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

import { existsSync } from "node:fs";

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
 * Bild-Zuordnung. Vorrang: das pro Artikel generierte, EINDEUTIGE Lifestyle-Foto
 * (blog/img/auto/<slug>.jpg — erzeugt von scripts/gen-article-photos.mjs). Fehlt
 * es noch (neuer Artikel, Generator noch nicht gelaufen), greift der alte
 * Fallback, damit nie ein Bild fehlt.
 */
export function thumbForCard(cat, langCode, slug) {
  const auto = `auto/${slug}.jpg`;
  if (existsSync(`blog/img/${auto}`)) return auto;
  // Fallback bis der Foto-Generator gelaufen ist
  if (cat === "learn") return langCode === "nl" ? "learn-nl.png" : "learn-1.png";
  if (cat === "prod") return langCode === "es" ? "prod-es.png" : "prod-1.png";
  if (langCode === "es") return "gram-es-1.png";
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

/* ─── Reconcile aus clusters.js (Backfill + ongoing, selbstheilend) ───────── */

// "/blog/foo/" → "foo" (nackter Slug-Name, ohne /blog/ und Slashes).
function bareSlug(slug) {
  return String(slug || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/^blog\//, "");
}

// Prüft, ob die Startseite bereits irgendwo eine Karte mit href="/blog/<slug>/" hat.
export function hasCardForHref(indexHtml, slug) {
  const href = slugToHref(slug);
  const re = new RegExp(
    `<a\\b[^>]*\\bclass="post"[^>]*\\bhref="${escapeRegExp(href)}"`,
    "i"
  );
  return re.test(String(indexHtml || ""));
}

/**
 * Kategorie aus einem clusters.js-Cluster + Slug ableiten (analog catFromMeta).
 *
 * Regeln (bestätigt):
 *   - Methodik / Lernmethode  → 'learn'
 *   - App-/Produkt-Signal     → 'prod'
 *   - sonst (Verb-Cluster)    → 'gram'
 */
export function catFromCluster(cluster, slug) {
  const id = String(cluster?.id || "").toLowerCase();
  const s = String(slug || "").toLowerCase();
  const hay = `${id} ${s}`;

  if (/methodik|lernmethode/.test(hay)) return "learn";

  const prodSignal =
    /app-vergleich|app vergleich|sprachlern-app|app-news|produkt/.test(hay);
  if (prodSignal) return "prod";

  return "gram";
}

// <meta name="description" content="..."> aus einem Artikel-HTML extrahieren.
export function extractMetaDescription(html) {
  if (!html) return "";
  const m = String(html).match(
    /<meta\s+name="description"\s+content="([^"]*)"/i
  );
  if (m) return m[1];
  // robust gegen umgedrehte Attribut-Reihenfolge
  const m2 = String(html).match(
    /<meta\s+content="([^"]*)"\s+name="description"/i
  );
  return m2 ? m2[1] : "";
}

// Knapper Fallback-Text aus dem Titel, wenn keine Meta-Description vorhanden ist.
function fallbackSummaryFromTitle(title) {
  const t = String(title || "").trim();
  if (!t) return "";
  return shortenSummary(`${t} — jetzt im Blog lesen.`);
}

/**
 * Reconciliation der /blog-Startseiten-Karten aus clusters.js.
 *
 *   reconcileBlogCardsFromClusters(indexHtml, { clusters, GLOBAL_PILLAR }, opts)
 *     → { html, added: [{ slug, cat }], summary }
 *
 * Iteriert über ALLE live-Artikel (cluster.hub falls live, cluster.spokes[]
 * mit live:true) plus GLOBAL_PILLAR (falls dessen HTML existiert). Für jeden
 * Artikel: existiert auf der Startseite noch KEINE Karte mit href="/blog/<slug>/",
 * wird eine ergänzt. Bereits vorhandene Karten (kuratiert ODER generiert) bleiben
 * UNANGETASTET — nicht überschrieben, nicht dupliziert. Idempotent & selbstheilend.
 *
 * opts (Dependency Injection — der Aufrufer liefert das File-IO):
 *   readArticleHtml(slug) → string|null   (liest blog/<slug>/index.html; null falls fehlt)
 *   articleHtmlExists(slug) → boolean      (ob blog/<slug>/index.html existiert)
 *
 * Werden sie nicht übergeben, arbeitet die Funktion rein in-memory:
 *   - readArticleHtml → null  ⇒ Beschreibung kommt aus dem Titel-Fallback
 *   - articleHtmlExists → false ⇒ GLOBAL_PILLAR wird übersprungen
 * So bleibt das Modul ohne fs testbar; den echten Dateizugriff injiziert
 * publish-from-notion.mjs.
 */
export function reconcileBlogCardsFromClusters(
  indexHtml,
  { clusters, GLOBAL_PILLAR } = {},
  opts = {}
) {
  let html = String(indexHtml || "");

  const readArticleHtml =
    typeof opts.readArticleHtml === "function" ? opts.readArticleHtml : () => null;
  const articleHtmlExists =
    typeof opts.articleHtmlExists === "function"
      ? opts.articleHtmlExists
      : () => false;

  // 1) Liste aller live-Artikel sammeln (mit Cluster-Kontext).
  const live = [];
  for (const cluster of clusters || []) {
    if (cluster?.hub && cluster.hub.live && cluster.hub.slug) {
      live.push({ slug: cluster.hub.slug, title: cluster.hub.title, cluster });
    }
    for (const spoke of cluster?.spokes || []) {
      if (spoke && spoke.live && spoke.slug) {
        live.push({ slug: spoke.slug, title: spoke.title, cluster });
      }
    }
  }
  // GLOBAL_PILLAR nur, wenn dessen HTML existiert.
  if (GLOBAL_PILLAR && GLOBAL_PILLAR.slug && articleHtmlExists(GLOBAL_PILLAR.slug)) {
    live.push({ slug: GLOBAL_PILLAR.slug, title: GLOBAL_PILLAR.title, cluster: null });
  }

  // 2) Fehlende Karten bestimmen + bauen.
  const cardsToAdd = [];
  const added = [];
  for (const item of live) {
    if (hasCardForHref(html, item.slug)) continue; // existiert → nie anfassen
    if (!articleHtmlExists(item.slug)) continue;   // keine HTML-Seite → keine 404-Karte (Leitplanke)

    const cat = catFromCluster(item.cluster, item.slug);
    // Sprache: Methodik-Cluster ohne klare Sprache → neutral/"all".
    const langCode = cat === "learn" ? null : (item.cluster?.lang || null);

    // Beschreibung aus dem Artikel-HTML; sonst Fallback aus dem Titel.
    let summaryDe = "";
    const articleHtml = readArticleHtml(item.slug);
    const desc = extractMetaDescription(articleHtml);
    summaryDe = desc
      ? shortenSummary(desc)
      : fallbackSummaryFromTitle(item.title);

    cardsToAdd.push({
      slug: item.slug,
      titleDe: item.title || bareSlug(item.slug),
      summaryDe,
      cat,
      lang: dataLangForLang(langCode),
      langTag: langTagForLang(langCode),
      colorVar: colorVarForLang(langCode),
      thumb: thumbForCard(cat, langCode, item.slug),
      readMin: 5,
    });
    added.push({ slug: item.slug, cat });
  }

  // 3) Einfügen über die bestehende, idempotente upsert-Logik.
  if (cardsToAdd.length) {
    html = upsertBlogCards(html, cardsToAdd);
  }

  const byCat = (c) =>
    added.filter((a) => a.cat === c).map((a) => bareSlug(a.slug)).join(", ") ||
    "–";
  const summary = `learn: ${byCat("learn")}; gram: ${byCat("gram")}; prod: ${byCat("prod")}`;

  return { html, added, summary };
}
