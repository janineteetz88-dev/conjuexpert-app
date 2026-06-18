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

/**
 * (a) Notion-Block-FAQ — deckt BEIDE Notion-Formate ab:
 *   1) toggle: Frage in toggle.rich_text, Antwort in _children
 *   2) bulleted_list_item: "▸ **Frage**" + Antwort.
 *      Antwort kann in _children stehen (eingerückte Unter-Blöcke) ODER
 *      — wenn Frage und Antwort in derselben Bullet stehen — hinter der
 *      ersten Zeile/dem fett gesetzten Frage-Teil.
 */
function normalizeFromBlocks(blocks) {
  const items = [];
  for (const b of blocks || []) {
    if (b.type === "toggle") {
      const q = plainOf(b.toggle?.rich_text).trim();
      if (!q) continue;
      const a_html = b._children ? blocksToHtml(b._children) : "";
      items.push({ q, a_html, a_text: htmlToText(a_html) });
      continue;
    }

    if (b.type === "bulleted_list_item") {
      const rt = b.bulleted_list_item?.rich_text || [];
      const full = plainOf(rt).trim();
      if (!full) continue;

      // Frage = bis zum Ende des ersten fett gesetzten Segments (oder erste Zeile).
      let q = "";
      let aInline = "";

      // Bevorzugt strukturell: erstes fettes rich_text-Segment ist die Frage.
      const firstBoldEnd = rt.findIndex((t) => t.annotations && t.annotations.bold);
      if (firstBoldEnd !== -1) {
        // Sammle zusammenhängende fette Segmente am Anfang als Frage.
        let i = 0;
        // optionales führendes Marker-Segment "▸ " überspringen
        const qParts = [];
        let started = false;
        for (; i < rt.length; i++) {
          const t = rt[i];
          const isBold = t.annotations && t.annotations.bold;
          if (isBold) {
            started = true;
            qParts.push(t.plain_text);
          } else if (!started) {
            // führender Nicht-Fett-Text (z. B. "▸ ") überspringen
            continue;
          } else {
            break;
          }
        }
        q = cleanQuestion(qParts.join(""));
        aInline = plainOf(rt.slice(i)).trim();
      } else {
        // Fallback: erste Zeile = Frage, Rest = Antwort
        const nl = full.indexOf("\n");
        if (nl !== -1) {
          q = cleanQuestion(full.slice(0, nl));
          aInline = full.slice(nl + 1).trim();
        } else {
          q = cleanQuestion(full);
          aInline = "";
        }
      }

      if (!q) continue;

      // Antwort: eingerückte Kinder bevorzugt, sonst Inline-Rest.
      let a_html = "";
      if (b._children && b._children.length) {
        a_html = blocksToHtml(b._children);
      } else if (aInline) {
        a_html = inlineMdToHtml(aInline);
      }
      items.push({ q, a_html, a_text: htmlToText(a_html) });
      continue;
    }
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
