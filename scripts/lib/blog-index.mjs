/**
 * blog-index.mjs
 *
 * Reine String-Transformation für die /blog-Startseite (blog/index.html):
 *
 *   upsertBlogCards(indexHtml, cards) → newHtml
 *
 * Sortiert neue Artikel-Karten datengetrieben in die richtige Kategorie-Sektion
 * der handkuratierten Startseite ein (learn → #lernen, gram → #grammatik,
 * prod → #produkt). Idempotent: existiert bereits irgendwo eine Karte mit
 * href="/blog/<slug>/", wird sie ersetzt statt dupliziert. Bestehende Karten,
 * Sektionen und Struktur bleiben unangetastet — es wird nur eingefügt/ersetzt.
 *
 * Zweisprachigkeit: Neue Artikel sind de-only. Der deutsche Text wird in BEIDE
 * data-l="de" UND data-l="en" Spans gesetzt (Fallback, kein leeres EN).
 *
 * card-Objekt:
 *   { slug, titleDe, summaryDe, cat ('learn'|'gram'|'prod'),
 *     lang, langTag, colorVar, thumb, readMin }
 */

/* ─── Kategorie → Sektion / Label-Mapping ────────────────────────────────── */

const CAT_SECTION = {
  learn: "lernen",
  gram: "grammatik",
  prod: "produkt",
};

const CAT_LABEL = {
  gram: { de: "Grammatik", en: "Grammar" },
  learn: { de: "Lerntipps", en: "Learning" },
  prod: { de: "Produkt", en: "Product" },
};

/* ─── HTML-Escaping (analog notion-to-html.mjs esc) ──────────────────────── */

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ─── slug-Normalisierung → href ─────────────────────────────────────────── */

function slugToHref(slug) {
  // "/blog/foo", "/blog/foo/", "foo" → "/blog/foo/"
  let s = String(slug || "").trim();
  if (!s) return "";
  s = s.replace(/^\/+/, "").replace(/\/+$/, ""); // strip leading/trailing slashes
  if (!s.startsWith("blog/")) s = "blog/" + s.replace(/^blog\//, "");
  return "/" + s + "/";
}

/* ─── Eine Karte rendern (exaktes Markup wie bestehende .post-Karten) ─────── */

function renderCard(card) {
  const href = slugToHref(card.slug);
  const cat = card.cat;
  const lang = card.lang || "all";
  const colorVar = card.colorVar || "--muted";
  const thumb = card.thumb;
  const titleDe = card.titleDe || "";
  const summaryDe = card.summaryDe || "";
  const readMin = card.readMin != null ? card.readMin : 5;
  const langTag = card.langTag || "";
  const labels = CAT_LABEL[cat] || CAT_LABEL.gram;

  const altText = titleDe;

  // lngtag-Zeile nur wenn ein Tag vorhanden ist (sprach-neutral → weglassen)
  const lngTagLine = langTag
    ? `\n            <span class="lngtag">${esc(langTag)}</span>`
    : "";

  // pmeta: Tag (falls vorhanden) + Lesezeit
  const pmetaTag = langTag
    ? `<span>${esc(langTag)}</span><span class="dotsep"></span>`
    : "";

  return `          <a class="post" href="${esc(href)}" data-cat="${esc(cat)}" data-lang="${esc(lang)}">
            <div class="thumb duo" style="--c:var(${esc(colorVar)})">
              <img class="duoimg" src="/blog/img/${esc(thumb)}" alt="${esc(altText)}" width="142" height="252" loading="lazy" />
              <span class="cat ${esc(cat)}"><span class="d"></span><span data-l="de">${esc(labels.de)}</span><span data-l="en">${esc(labels.en)}</span></span>
            </div>${lngTagLine}
            <div class="body">
              <h3><span data-l="de">${esc(titleDe)}</span><span data-l="en">${esc(titleDe)}</span></h3>
              <p><span data-l="de">${esc(summaryDe)}</span><span data-l="en">${esc(summaryDe)}</span></p>
              <div class="pmeta">${pmetaTag}<span>${esc(readMin)} min</span></div>
            </div>
          </a>`;
}

/* ─── Sektion finden (robust über id) ────────────────────────────────────── */

// Findet den Bereich [openStart, closeEnd) der <section ... id="<sectionId>" ...>…</section>.
// Berücksichtigt verschachtelte <section>-Tags per Tiefenzählung.
function findSection(html, sectionId) {
  const idRe = new RegExp(
    `<section\\b[^>]*\\bid="${sectionId}"[^>]*>`,
    "i"
  );
  const m = idRe.exec(html);
  if (!m) return null;
  const openStart = m.index;
  let pos = openStart + m[0].length;
  let depth = 1;
  const tagRe = /<(\/?)section\b[^>]*>/gi;
  tagRe.lastIndex = pos;
  let t;
  while ((t = tagRe.exec(html)) !== null) {
    if (t[1] === "/") depth--;
    else depth++;
    if (depth === 0) {
      return { openStart, openEnd: openStart + m[0].length, closeStart: t.index, closeEnd: t.index + t[0].length };
    }
  }
  return null;
}

/* ─── Bestehende Karte mit gegebenem href entfernen (idempotent) ─────────── */

// Entfernt ALLE <a class="post" ... href="<href>" ...>…</a> Blöcke aus dem HTML.
// Räumt anschließend leer gewordene <div class="pair"></div> (nur Whitespace) auf.
function removeCardsByHref(html, href) {
  let out = html;
  const anchorOpenRe = new RegExp(
    `<a\\b[^>]*\\bclass="post"[^>]*\\bhref="${escapeRegExp(href)}"[^>]*>`,
    "i"
  );
  let guard = 0;
  while (guard++ < 100) {
    const m = anchorOpenRe.exec(out);
    if (!m) break;
    const start = m.index;
    // passendes </a> per Tiefenzählung finden
    let pos = start + m[0].length;
    let depth = 1;
    const tagRe = /<(\/?)a\b[^>]*>/gi;
    tagRe.lastIndex = pos;
    let t;
    let end = -1;
    while ((t = tagRe.exec(out)) !== null) {
      if (t[1] === "/") depth--;
      else depth++;
      if (depth === 0) {
        end = t.index + t[0].length;
        break;
      }
    }
    if (end === -1) break; // defekt → abbrechen
    // führendes Whitespace (inkl. einer Zeile) mitnehmen, damit keine Leerzeilen bleiben
    let cut = start;
    while (cut > 0 && (out[cut - 1] === " " || out[cut - 1] === "\t")) cut--;
    if (cut > 0 && out[cut - 1] === "\n") cut--;
    out = out.slice(0, cut) + out.slice(end);
  }
  // leere <div class="pair">…</div> (nur Whitespace) entfernen
  out = out.replace(
    /\n?\s*<div class="pair">\s*<\/div>/g,
    ""
  );
  return out;
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ─── Karte in eine Sektion einfügen ─────────────────────────────────────── */

// Fügt vor dem schließenden </section> der Sektion eine neue
// <div class="pair">…karte…</div> ein.
function insertCardIntoSection(html, sectionId, cardHtml) {
  const sec = findSection(html, sectionId);
  if (!sec) {
    throw new Error(`blog-index: Sektion #${sectionId} nicht gefunden`);
  }
  const block = `\n        <div class="pair">\n${cardHtml}\n        </div>\n      `;
  return html.slice(0, sec.closeStart) + block + html.slice(sec.closeStart);
}

/* ─── Hauptfunktion ──────────────────────────────────────────────────────── */

export function upsertBlogCards(indexHtml, cards) {
  let html = String(indexHtml);

  for (const card of cards || []) {
    if (!card || !card.slug || !card.cat) continue;
    const sectionId = CAT_SECTION[card.cat];
    if (!sectionId) {
      throw new Error(`blog-index: unbekannte Kategorie "${card.cat}" für ${card.slug}`);
    }
    const href = slugToHref(card.slug);

    // 1) idempotent: bestehende Karte(n) mit diesem href überall entfernen
    html = removeCardsByHref(html, href);

    // 2) frische Karte in die richtige Sektion einfügen
    const cardHtml = renderCard(card);
    html = insertCardIntoSection(html, sectionId, cardHtml);
  }

  return html;
}

/* ─── Mapping-Helfer: meta → cat / thumb / colorVar / langTag ────────────── */

const LANG_CODE_BY_NAME = {
  spanisch: "es",
  deutsch: "de",
  französisch: "fr",
  franzoesisch: "fr",
  englisch: "en",
  niederländisch: "nl",
  niederlaendisch: "nl",
};

// Sprach-Code aus meta.sprache (deutscher Name) ableiten; neutral → null.
export function langCodeFromMeta(meta) {
  const s = String(meta?.sprache || "").trim().toLowerCase();
  if (!s || /neutral/.test(s)) return null;
  return LANG_CODE_BY_NAME[s] || null;
}

/**
 * Deterministische Kategorie-Ableitung aus dem Meta-Block.
 *
 * Regeln (vom User bestätigt):
 *   - Methodik / Lernmethode im Cluster        → 'learn'
 *   - Verb-Cluster (Sprach-Hubs + Spokes)       → 'gram'
 *   - App-Vergleich / Anwendung-Produktartikel  → 'prod'
 *
 * Heuristik: Methodik zuerst (klarstes Signal). Dann echte Produktartikel
 * (App-Vergleich / Säule "Anwendung" mit Produktbezug). Sonst Default 'gram'
 * (Verb-Cluster). Im Zweifel landet ein Artikel in 'gram', nie versehentlich
 * in 'prod' — 'prod' nur bei explizitem App-/Produktsignal.
 */
export function catFromMeta(meta) {
  const cluster = String(meta?.cluster || "").toLowerCase();
  const saeule = String(meta?.saeule || "").toLowerCase();
  const keyword = String(meta?.keyword || "").toLowerCase();
  const slug = String(meta?.slug || "").toLowerCase();

  // Methodik / Lernmethode → learn
  if (/methodik|lernmethode/.test(cluster)) return "learn";

  // Produkt: App-Vergleich oder explizites Produkt/App-Signal
  const prodSignal =
    /app-vergleich|app vergleich|produkt|app-news/.test(cluster) ||
    /app-vergleich|sprachlern-app/.test(slug) ||
    /produkt/.test(saeule) ||
    /app-vergleich|app vergleich/.test(keyword);
  if (prodSignal) return "prod";

  // Default: Verb-Cluster → gram
  return "gram";
}

// Stabiles, deterministisches Alternieren für gram-Thumbnails (nicht-ES).
function hashSlug(slug) {
  let h = 0;
  const s = String(slug || "");
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Bild-Zuordnung (nur echte Assets aus blog/img/):
 *   learn → learn-1.png (NL → learn-nl.png)
 *   gram  → ES: gram-es-1.png; sonst alternierend gram-es-1/gram-es-2
 *   prod  → prod-1.png (ES → prod-es.png)
 */
export function thumbForCard(cat, langCode, slug) {
  if (cat === "learn") {
    return langCode === "nl" ? "learn-nl.png" : "learn-1.png";
  }
  if (cat === "prod") {
    return langCode === "es" ? "prod-es.png" : "prod-1.png";
  }
  // gram
  if (langCode === "es") return "gram-es-1.png";
  // deterministisch alternieren für nicht-ES-Artikel
  return hashSlug(slug) % 2 === 0 ? "gram-es-1.png" : "gram-es-2.png";
}

const COLOR_VAR_BY_LANG = {
  es: "--es",
  de: "--de",
  fr: "--fr",
  en: "--en",
  nl: "--nl",
};

// CSS-Farbvariable je Sprache; sprach-neutral → --muted.
export function colorVarForLang(langCode) {
  return COLOR_VAR_BY_LANG[langCode] || "--muted";
}

// langTag: "ES"/"DE"/… ; sprach-neutral → "5 Sprachen".
export function langTagForLang(langCode) {
  if (!langCode) return "5 Sprachen";
  return langCode.toUpperCase();
}

// data-lang-Attributwert: Sprachcode oder "all" (sprach-neutral).
export function dataLangForLang(langCode) {
  return langCode || "all";
}

/**
 * Baut aus einem (gerenderten) Artikel ein Karten-Objekt für upsertBlogCards.
 *   { meta, title, readMin } → card
 */
export function buildCardFromArticle({ meta, title, readMin }) {
  const langCode = langCodeFromMeta(meta);
  const cat = catFromMeta(meta);
  const summaryDe = shortenSummary(meta?.metaDescription || "");
  return {
    slug: meta.slug,
    titleDe: title || meta.keyword || "",
    summaryDe,
    cat,
    lang: dataLangForLang(langCode),
    langTag: langTagForLang(langCode),
    colorVar: colorVarForLang(langCode),
    thumb: thumbForCard(cat, langCode, meta.slug),
    readMin: readMin != null ? readMin : 5,
  };
}

// metaDescription auf ~110 Zeichen kürzen (an Wortgrenze, mit … wenn gekürzt).
export function shortenSummary(text, max = 110) {
  const s = String(text || "").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return base.replace(/[\s.,;:–—-]+$/, "") + "…";
}
