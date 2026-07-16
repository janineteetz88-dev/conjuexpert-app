/**
 * notion-adapt.mjs
 *
 * Reine (API-freie) Adapter, die Notion-Block-Strukturen in die Eingaben der
 * Render-Pipeline übersetzen. Bewusst ohne Netzwerk/Key, damit Unit-getestet.
 *
 *   blocksToMetaText(blocks)        → Text für parseMetaBlock()
 *   extractFaqAndContent(blocks)    → { contentBlocks, faqBlocks }
 *
 * Es werden KEINE Artikel-Sonderfälle hardcoded.
 */

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function plainOf(richText) {
  return (richText || []).map((t) => t.plain_text).join("");
}

// Rich-Text → Markdown-ähnlicher Text (mit ** für fett), damit parseMetaBlock
// (das auf "**Label:**" trifft) die Felder wiederfindet.
function richToMd(richText) {
  return (richText || [])
    .map((t) => {
      const s = t.plain_text || "";
      if (!s) return "";
      return t.annotations && t.annotations.bold ? `**${s}**` : s;
    })
    .join("");
}

const META_HEADER_RE = /^\s*\*?\*?\s*Meta\s*\(für Blog-Engine/i;

function isMetaHeaderText(s) {
  return META_HEADER_RE.test(String(s || "").trim());
}

/**
 * Erster Intro-Absatz im Kopf (vor der ersten H1), der NICHT selbst eine
 * Meta-/Slug-Zeile ist. Mit { italicOnly:true } nur kursive Absätze (*…*) —
 * der typische unbeschriftete Standfirst. Dient als Meta-Description-Fallback.
 */
export function firstHeadIntro(list, { italicOnly = false } = {}) {
  for (const b of list || []) {
    if (b.type === "heading_1") break; // Kopf endet an der H1
    if (b.type !== "paragraph") continue;
    const rt = b.paragraph?.rich_text || [];
    const t = plainOf(rt).trim();
    if (!t) continue;
    if (/^\s*\*?\*?\s*Meta-Description:/i.test(t)) continue;
    if (/Slug:/i.test(t)) continue;
    if (italicOnly) {
      const isItalic = rt.some((x) => x.plain_text?.trim() && x.annotations?.italic);
      if (!isItalic) continue;
    }
    return t;
  }
  return "";
}

/* ─── Meta-Block aus führenden Blöcken → Text ────────────────────────────── */

/**
 * Sucht den führenden Paragraph "**Meta (für Blog-Engine & Freigabe)**" und
 * sammelt die direkt folgenden bulleted_list_item-Blöcke. Gibt Text zurück,
 * den parseMetaBlock() versteht (Header-Zeile + "- " Bullets).
 */
export function blocksToMetaText(blocks) {
  const list = blocks || [];
  let start = -1;
  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    if (b.type === "paragraph" && isMetaHeaderText(plainOf(b.paragraph?.rich_text))) {
      start = i;
      break;
    }
    if (b.type === "heading_1" && isMetaHeaderText(plainOf(b.heading_1?.rich_text))) { start = i; break; }
    if (b.type === "heading_2" && isMetaHeaderText(plainOf(b.heading_2?.rich_text))) { start = i; break; }
    if (b.type === "heading_3" && isMetaHeaderText(plainOf(b.heading_3?.rich_text))) { start = i; break; }
  }
  if (start === -1) return blocksToMetaTextV2(list);

  const lines = ["**Meta (für Blog-Engine & Freigabe)**"];
  let hasDesc = false;
  for (let i = start + 1; i < list.length; i++) {
    const b = list[i];
    if (b.type === "bulleted_list_item") {
      const md = richToMd(b.bulleted_list_item?.rich_text);
      if (/Meta-Description:/i.test(md)) hasDesc = true;
      lines.push(`- ${md}`);
      continue;
    }
    // erster Nicht-Bullet-Block beendet den Meta-Block.
    break;
  }
  // Fallback: kein "Meta-Description:"-Bullet → kursiven Intro-Absatz nehmen.
  if (!hasDesc) {
    const intro = firstHeadIntro(list, { italicOnly: true }) || firstHeadIntro(list);
    if (intro) lines.push(`- **Meta-Description:** ${intro}`);
  }
  return lines.join("\n");
}

/* ─── v2-Format: Meta steckt in einem Zitat-Block ────────────────────────── */

// Ist dieser Block der v2-Meta-Zitatblock? (enthält "Slug:" UND "Cluster:")
function isV2MetaQuote(b) {
  if (!b || b.type !== "quote") return false;
  const t = plainOf(b.quote?.rich_text);
  return /Slug:/i.test(t) && /Cluster:/i.test(t);
}

// Ist dieser Block der v2-"Meta-Description:"-Absatz?
function isV2MetaDescParagraph(b) {
  if (!b || b.type !== "paragraph") return false;
  return /^\s*Meta-Description:/i.test(plainOf(b.paragraph?.rich_text).trim());
}

/**
 * v2-Fallback: Die Engine-Meta steht NICHT als "Meta (für Blog-Engine…)"-Header,
 * sondern als Zitat-Block (> **Slug:** … · **Typ:** … · **Cluster:** … ·
 * **Pillar:** … · **Hub:** … · **Geschwister:** …) und die Meta-Description als
 * eigener Absatz im Body. Wir bauen daraus den kanonischen Meta-Text, den
 * parseMetaBlock() versteht.
 */
function blocksToMetaTextV2(list) {
  let quoteMd = null;
  for (const b of list) {
    if (isV2MetaQuote(b)) { quoteMd = richToMd(b.quote?.rich_text); break; }
  }
  if (!quoteMd) return "";

  // Jede Zeile des Meta-Zitatblocks, die ein "Label:" trägt, wird zu einem
  // eigenen Bullet. So funktionieren BEIDE Alt-Varianten rückwärtskompatibel:
  //   • einzeilig:  "Slug: … · Typ: … · Cluster: …"   → ein Bullet, mehrere Felder
  //   • mehrzeilig: "Slug: …" ⏎ "Typ: …" ⏎ "Cluster: …" → je ein Bullet
  // Reine Block-Überschriften ("**Meta-Block**", ohne Doppelpunkt) fallen raus.
  const bullets = [];
  let hasDesc = false;
  for (const raw of quoteMd.split(/\r?\n/)) {
    const t = raw.trim();
    if (!t || !t.includes(":")) continue;
    if (/meta-?description\s*:/i.test(t)) hasDesc = true;
    bullets.push(`- ${t}`);
  }
  if (bullets.length === 0) return "";

  // Fallback: Kein "Meta-Description:" im Zitat → eigener Absatz oder kursiver
  // Standfirst im Kopf (vor der H1) als Meta-Description.
  if (!hasDesc) {
    let descMd = "";
    for (const b of list) {
      if (b.type === "paragraph") {
        const md = richToMd(b.paragraph?.rich_text);
        if (/^\s*\*?\*?\s*Meta-Description:/i.test(md)) { descMd = md.trim(); break; }
      }
    }
    if (!descMd) {
      const intro = firstHeadIntro(list, { italicOnly: true }) || firstHeadIntro(list);
      if (intro) descMd = `**Meta-Description:** ${intro}`;
    }
    if (descMd) bullets.push(`- ${descMd}`);
  }

  return ["**Meta (für Blog-Engine & Freigabe)**", ...bullets].join("\n");
}

/**
 * Wie viele führende Blöcke gehören zum Meta-Block (Header + Bullets)?
 * Wird benötigt, um den Meta-Block aus den Content-Blöcken zu entfernen.
 */
export function metaBlockSpan(blocks) {
  const list = blocks || [];
  let start = -1;
  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    const txt =
      b.type === "paragraph" ? plainOf(b.paragraph?.rich_text) :
      b.type === "heading_1" ? plainOf(b.heading_1?.rich_text) :
      b.type === "heading_2" ? plainOf(b.heading_2?.rich_text) :
      b.type === "heading_3" ? plainOf(b.heading_3?.rich_text) : "";
    if (txt && isMetaHeaderText(txt)) { start = i; break; }
  }
  if (start === -1) return { start: -1, end: -1 };
  let end = start; // inkl. Header
  for (let i = start + 1; i < list.length; i++) {
    if (list[i].type === "bulleted_list_item") { end = i; continue; }
    break;
  }
  return { start, end };
}

/* ─── FAQ-Abschnitt finden & abtrennen ───────────────────────────────────── */

function headingText(b) {
  if (b.type === "heading_1") return plainOf(b.heading_1?.rich_text);
  if (b.type === "heading_2") return plainOf(b.heading_2?.rich_text);
  if (b.type === "heading_3") return plainOf(b.heading_3?.rich_text);
  return "";
}

function isFaqHeading(b) {
  const t = headingText(b).trim();
  return /^FAQ\b/i.test(t) || /häufige fragen/i.test(t);
}

// Block, der eine FAQ-Q/A-Einheit trägt: toggle ODER "▸ **…**"-Bullet.
function isFaqItemBlock(b) {
  if (b.type === "toggle") return true;
  if (b.type === "bulleted_list_item") {
    const rt = b.bulleted_list_item?.rich_text || [];
    const full = plainOf(rt).trim();
    // entweder beginnt mit ▸-Marker ODER hat ein fett gesetztes Frage-Segment
    if (/^[▸▶►]\s*/.test(full)) return true;
    if (rt.some((t) => t.annotations && t.annotations.bold)) return true;
  }
  return false;
}

/**
 * Trennt Content von Meta-Block + FAQ.
 *   - Meta-Block (Header + folgende Bullets) wird entfernt.
 *   - Ab der "## FAQ"-Heading: Heading verwerfen, folgende FAQ-Item-Blöcke
 *     (toggle / ▸-Bullet) → faqBlocks. Nicht-FAQ-Blöcke nach FAQ bleiben Content.
 *
 * Gibt { contentBlocks, faqBlocks } zurück.
 */
export function extractFaqAndContent(blocks) {
  const list = (blocks || []).slice();

  // 1) Meta-Block-Span bestimmen und ausschneiden.
  const span = metaBlockSpan(list);
  let work;
  if (span.start !== -1) {
    work = list.slice(0, span.start).concat(list.slice(span.end + 1));
  } else {
    work = list.slice();
  }

  // 1b) v2-Artefakte entfernen (für kanonische Artikel ein No-op):
  //   - Meta-Zitatblock (Slug:+Cluster:)
  //   - "Meta-Description:"-Absatz (Description kommt über meta.metaDescription)
  //   - führende H1 (Artikel-Titel kommt separat aus dem Tracker)
  let h1Dropped = false;
  work = work.filter((b) => {
    if (isV2MetaQuote(b)) return false;
    if (isV2MetaDescParagraph(b)) return false;
    if (b.type === "heading_1" && !h1Dropped) { h1Dropped = true; return false; }
    return true;
  });

  // 2) FAQ-Heading finden.
  let faqStart = -1;
  for (let i = 0; i < work.length; i++) {
    const b = work[i];
    if ((b.type === "heading_1" || b.type === "heading_2" || b.type === "heading_3") && isFaqHeading(b)) {
      faqStart = i;
      break;
    }
  }

  if (faqStart === -1) {
    return { contentBlocks: work, faqBlocks: [] };
  }

  const contentBlocks = work.slice(0, faqStart); // FAQ-Heading selbst verwerfen
  const after = work.slice(faqStart + 1);

  // 3) Den KOMPLETTEN FAQ-Bereich nach der Heading sammeln — bis zur nächsten
  //    Sektions-Heading (H1/H2) oder Ende. heading_3 ist KEINE Grenze, da einige
  //    Artikel ihre Fragen als H3 schreiben. Der Normalisierer (normalizeFaq)
  //    erkennt die Frage-/Antwort-Formate im Bereich selbst (Toggle, „▸ **…**"-
  //    Bullet, fette Frage-Absätze/-Zitate, „### Frage"; Marker wie <toggle>/+++
  //    werden übersprungen).
  const faqBlocks = [];
  for (const b of after) {
    if (b.type === "heading_1" || b.type === "heading_2") break;
    faqBlocks.push(b);
  }

  return { contentBlocks, faqBlocks };
}
