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
  if (start === -1) return "";

  const lines = ["**Meta (für Blog-Engine & Freigabe)**"];
  for (let i = start + 1; i < list.length; i++) {
    const b = list[i];
    if (b.type === "bulleted_list_item") {
      lines.push(`- ${richToMd(b.bulleted_list_item?.rich_text)}`);
      continue;
    }
    // erster Nicht-Bullet-Block beendet den Meta-Block.
    break;
  }
  return lines.join("\n");
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

  // 3) Aus dem Bereich nach der FAQ-Heading die FAQ-Item-Blöcke sammeln.
  //    Alles bis zur nächsten Heading (oder Ende) wird betrachtet.
  const faqBlocks = [];
  for (const b of after) {
    if (b.type === "heading_1" || b.type === "heading_2" || b.type === "heading_3") break;
    if (isFaqItemBlock(b)) faqBlocks.push(b);
  }

  return { contentBlocks, faqBlocks };
}
