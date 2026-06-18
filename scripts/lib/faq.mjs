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

// (a) Toggle / <details> Blocks
function normalizeFromBlocks(blocks) {
  const items = [];
  for (const b of blocks || []) {
    if (b.type !== "toggle") continue;
    const q = (b.toggle?.rich_text || []).map((t) => t.plain_text).join("").trim();
    if (!q) continue;
    const a_html = b._children ? blocksToHtml(b._children) : "";
    items.push({ q, a_html, a_text: htmlToText(a_html) });
  }
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
