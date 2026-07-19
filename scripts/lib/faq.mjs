/**
 * faq.mjs
 *
 * Generischer, robuster FAQ-Normalisierer + Renderer.
 *
 * Normalisiert ZWEI Eingabeformate auf eine einheitliche Liste [{q, a_html, a_text}]:
 *   (a) Toggle / <details> — Frage im <summary>, Antwort in den Children
 *   (b) Bullet-Liste "- ▸ **Frage**" mit eingerückter Antwort darunter
 *
 * Renderer:
 *   renderFaqHtml(faqItems)   → genau EIN <h2 id="faq"> + .faq2 (Antwort-zuerst-Markup)
 *   renderFaqSchema(faqItems) → FAQPage JSON-LD (vollständige Antworttexte)
 *   speakableSchema()         → SpeakableSpecification (GEO)
 *
 * Reuse: rtToHtml/blocksToHtml/esc aus notion-to-html.mjs für Toggle-Children.
 */

import {
  esc,
  rtToHtml,
  blocksToHtml,
} from "../notion-to-html.mjs";

/* ─── Inline-Markdown → HTML (für Bullet-Format-Antworten) ───────────────── */

function inlineMdToHtml(s) {
  let out = esc(String(s || ""));
  // Reihenfolge: code zuerst (damit ** darin nicht greift), dann links, bold, italic.
  out = out.replace(/`([^`]+)`/g, (_m, t) => `<code>${t}</code>`);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t, url) => `<a class="inline" href="${url}">${t}</a>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, (_m, t) => `<strong>${t}</strong>`);
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, (_m, pre, t) => `${pre}<em>${t}</em>`);
  return out;
}

function htmlToText(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ─── Format-Erkennung & Normalisierung ──────────────────────────────────── */

// Eingang kann sein: Array von Notion-Blocks (Toggles) ODER ein String (Markdown-Sektion).
export function normalizeFaq(input) {
  if (Array.isArray(input)) {
    return normalizeFromBlocks(input);
  }
  return normalizeFromRawSection(String(input || ""));
}

// Hilfen für Block-basierte FAQ
function plainOf(richText) {
  return (richText || []).map((t) => t.plain_text).join("");
}

// Entfernt führendes "▸ " und umschließende **fett**-Marker aus einer Frage.
function cleanQuestion(s) {
  return String(s || "")
    .replace(/^[▸▶►•·]\s*/, "")
    .trim()
    .replace(/^\*\*/, "")
    .replace(/\*\*$/, "")
    .trim();
}

/* ─── Helfer für den generischen Block-Parser ────────────────────────────── */

function richTextOf(b) {
  switch (b?.type) {
    case "paragraph":           return b.paragraph?.rich_text || [];
    case "quote":               return b.quote?.rich_text || [];
    case "heading_1":           return b.heading_1?.rich_text || [];
    case "heading_2":           return b.heading_2?.rich_text || [];
    case "heading_3":           return b.heading_3?.rich_text || [];
    case "bulleted_list_item":  return b.bulleted_list_item?.rich_text || [];
    case "numbered_list_item":  return b.numbered_list_item?.rich_text || [];
    default:                    return [];
  }
}

// Reine Struktur-Marker, die versehentlich als Text ankommen (escaped Toggle/
// Details, +++-Toggle-Syntax) — werden übersprungen, nie als Frage/Antwort.
function isMarkerOnly(text) {
  const t = String(text || "").trim();
  return /^<\/?(?:toggle|details|summary)>$/i.test(t) || /^\+{3,}$/.test(t);
}

function stripHeadingPrefix(s) {
  return String(s || "").replace(/^\s*#{1,6}\s+/, "").trim();
}

// Ganzer Block fett gesetzt → sehr wahrscheinlich eine Frage (nicht eine Antwort,
// die höchstens mit einem fetten Label beginnt).
function isFullyBold(rt) {
  const meaningful = (rt || []).filter((t) => t.plain_text && t.plain_text.trim());
  return meaningful.length > 0 && meaningful.every((t) => t.annotations && t.annotations.bold);
}

function bulletIsQuestion(b) {
  const rt = b.bulleted_list_item?.rich_text || [];
  const full = plainOf(rt).trim();
  return /^[▸▶►]\s*/.test(full) || rt.some((t) => t.annotations && t.annotations.bold);
}

// Absatz / Zitat / heading_3 als Frage erkennen.
function looksLikeQuestion(b) {
  if (b.type === "heading_3") return true;
  if (b.type === "paragraph" || b.type === "quote") {
    const rt = richTextOf(b);
    const plain = plainOf(rt).trim();
    if (!plain || isMarkerOnly(plain)) return false;
    if (/^\s*#{1,6}\s+/.test(plain)) return true; // „### Frage" (als Absatz/Zitat)
    if (/^\*\*.+\*\*\s*$/.test(plain)) return true; // literales **Frage**
    if (isFullyBold(rt)) return true;               // komplett fett gesetzte Frage
  }
  return false;
}

// Bestehende „▸ **Frage**"-Bullet-Logik → { q, a_html, a_text }.
function bulletToItem(b) {
  const rt = b.bulleted_list_item?.rich_text || [];
  const full = plainOf(rt).trim();
  if (!full) return null;

  let q = "";
  let aInline = "";
  const firstBoldEnd = rt.findIndex((t) => t.annotations && t.annotations.bold);
  if (firstBoldEnd !== -1) {
    let i = 0;
    const qParts = [];
    let started = false;
    for (; i < rt.length; i++) {
      const t = rt[i];
      const isBold = t.annotations && t.annotations.bold;
      if (isBold) { started = true; qParts.push(t.plain_text); }
      else if (!started) { continue; }
      else { break; }
    }
    q = cleanQuestion(qParts.join(""));
    aInline = plainOf(rt.slice(i)).trim();
  } else {
    const nl = full.indexOf("\n");
    if (nl !== -1) { q = cleanQuestion(full.slice(0, nl)); aInline = full.slice(nl + 1).trim(); }
    else { q = cleanQuestion(full); aInline = ""; }
  }
  if (!q) return null;

  let a_html = "";
  if (b._children && b._children.length) a_html = blocksToHtml(b._children);
  else if (aInline) a_html = inlineMdToHtml(aInline);
  return { q, a_html, a_text: htmlToText(a_html) };
}

/**
 * (a) Notion-Block-FAQ — robust über die real vorkommenden Autoren-Formate:
 *   1) toggle: Frage in toggle.rich_text, Antwort in _children
 *   2) „▸ **Frage**"-Bullet: Frage im ersten fetten Segment, Antwort in
 *      _children oder inline dahinter
 *   3) generischer Frage-/Antwort-Strom: komplett fett gesetzte Frage-Absätze/
 *      -Zitate, „### Frage" (als Absatz/Zitat oder heading_3) — jeweils gefolgt
 *      von einem oder mehreren Antwort-Blöcken. Literale Marker (<toggle>,
 *      </toggle>, <details>, +++) werden übersprungen.
 */
function normalizeFromBlocks(blocks) {
  const items = [];
  let current = null;
  const flush = () => {
    if (current && current.q) {
      const a_html = current.aParts.join("\n");
      items.push({ q: current.q, a_html, a_text: htmlToText(a_html) });
    }
    current = null;
  };

  for (const b of blocks || []) {
    // 1) toggle: eigenständige Q/A-Einheit
    if (b.type === "toggle") {
      flush();
      const q = plainOf(b.toggle?.rich_text).trim();
      if (!q) continue;
      const a_html = b._children ? blocksToHtml(b._children) : "";
      items.push({ q, a_html, a_text: htmlToText(a_html) });
      continue;
    }

    // 2) „▸ **Frage**"-Bullet: eigenständige Q/A-Einheit
    if (b.type === "bulleted_list_item" && bulletIsQuestion(b)) {
      flush();
      const it = bulletToItem(b);
      if (it) items.push(it);
      continue;
    }

    // 3) generischer Frage-/Antwort-Strom (Absatz / Zitat / heading_3)
    const rt = richTextOf(b);
    const plain = plainOf(rt).trim();
    if (!plain || isMarkerOnly(plain)) continue; // <toggle>/</toggle>/+++ überspringen

    if (looksLikeQuestion(b)) {
      flush();
      current = { q: cleanQuestion(stripHeadingPrefix(plain)), aParts: [] };
    } else if (current) {
      const html = rtToHtml(rt);
      if (html) current.aParts.push(`<p>${html}</p>`);
    }
  }
  flush();
  return items;
}

/**
 * (b) Roh-Markdown-Sektion. Deckt beide Textformate ab:
 *   - <details><summary>**Q**</summary>A</details>
 *   - "- ▸ **Q**" + eingerückte Antwortzeile(n)
 */
function normalizeFromRawSection(raw) {
  const text = raw.trim();
  if (!text) return [];

  // Heuristik: enthält <details> → HTML-Toggle-Format
  if (/<details[\s>]/i.test(text)) {
    return parseDetailsFormat(text);
  }
  // sonst Bullet-/▸-Format
  return parseBulletFormat(text);
}

function parseDetailsFormat(text) {
  const items = [];
  const re = /<details[^>]*>([\s\S]*?)<\/details>/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const inner = m[1];
    const sumMatch = inner.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
    if (!sumMatch) continue;
    const qRaw = sumMatch[1].replace(/<[^>]+>/g, "").trim();
    const q = qRaw.replace(/^\*\*/, "").replace(/\*\*$/, "").trim();
    let aRaw = inner.replace(/<summary[^>]*>[\s\S]*?<\/summary>/i, "").trim();
    if (!q) continue;
    const a_html = inlineMdToHtml(aRaw);
    items.push({ q, a_html, a_text: htmlToText(a_html) });
  }
  return items;
}

function parseBulletFormat(text) {
  const lines = text.split(/\r?\n/);
  const items = [];
  let current = null;

  const isQ = (line) => {
    // "- ▸ **Frage**"  (optional ohne ▸)
    return /^\s*[-*]\s+(▸\s*)?\*\*.+\*\*/.test(line);
  };

  for (const line of lines) {
    if (isQ(line)) {
      if (current) items.push(current);
      let q = line
        .replace(/^\s*[-*]\s+/, "")
        .replace(/^▸\s*/, "")
        .trim()
        .replace(/^\*\*/, "")
        .replace(/\*\*$/, "")
        .trim();
      current = { q, _aLines: [] };
    } else if (current) {
      const t = line.trim();
      if (t === "") continue;
      current._aLines.push(t);
    }
  }
  if (current) items.push(current);

  return items.map((it) => {
    const a_html = inlineMdToHtml((it._aLines || []).join(" ").trim());
    return { q: it.q, a_html, a_text: htmlToText(a_html) };
  });
}

/* ─── Renderer: HTML ─────────────────────────────────────────────────────── */

// Genau EIN <h2 id="faq"> — der Renderer "besitzt" die Überschrift.
// Markup wie im bestehenden buildHtml (.faq2 / <details>).
export function renderFaqHtml(faqItems) {
  const items = faqItems || [];
  if (!items.length) return "";

  const details = items
    .map((it) => {
      return `          <details>\n            <summary>${inlineMdToHtml(it.q)}<span class="pm"></span></summary>\n            <div class="a">${it.a_html}</div>\n          </details>`;
    })
    .join("\n");

  return `        <h2 id="faq">Häufige Fragen</h2>\n        <div class="faq2">\n${details}\n        </div>`;
}

/* ─── Renderer: FAQPage JSON-LD ──────────────────────────────────────────── */

export function renderFaqSchema(faqItems) {
  const items = faqItems || [];
  if (!items.length) return null;

  return {
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a_text,
      },
    })),
  };
}

/* ─── GEO: SpeakableSpecification ────────────────────────────────────────── */

export function speakableSchema() {
  return {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".faq2 summary", ".faq2 .a"],
  };
}
