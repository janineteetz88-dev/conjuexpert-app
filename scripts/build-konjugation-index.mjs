#!/usr/bin/env node
/**
 * build-konjugation-index.mjs
 *
 * Generiert pro Sprache eine Übersichts-/Landing-Page unter
 *   konjugation/<lang>/index.html
 * die alle vorhandenen Verb-Seiten dieses Ordners alphabetisch verlinkt.
 *
 * Quelle = die real existierenden Verb-Ordner (konjugation/<lang>/<verb>/),
 * damit die Liste automatisch in Sync bleibt. Keine Hardcodes der Verben.
 *
 * Aufruf:
 *   node scripts/build-konjugation-index.mjs es        # nur Spanisch
 *   node scripts/build-konjugation-index.mjs es de fr  # mehrere
 *   node scripts/build-konjugation-index.mjs all       # alle konfigurierten
 *
 * Design folgt dem CI der Haupt-App (index.html): Space Grotesk (self-hosted),
 * Brand Pink→Violett, 22px-Radien, weiche Schatten, --cta-app-Button. Die
 * Sprachfarbe dient nur als dezenter Sekundär-Akzent.
 */

import { readdirSync, statSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://conjuexpert.app";

/* ─── Sprach-Konfiguration ────────────────────────────────────────────────── */
// accent = CI-Farbe der Sprache (identisch zu src/data/clusters.js), nur dezent
const LANGS = {
  es: { label: "Spanisch", accent: "#ff9f0a",
    title: "Spanische Verben konjugieren – alle Verben von A–Z", h1: "Spanische Verben konjugieren",
    intro: "Alle spanischen Verben auf einen Blick – mit vollständiger Konjugationstabelle, Beispielsätzen und einer Eselsbrücke zum Merken. Wähle ein Verb und sieh dir sämtliche Zeitformen an.",
    metaDesc: "Spanische Verben konjugieren: alphabetische Liste aller Verben mit vollständigen Konjugationstabellen, Beispielsätzen und Merkhilfen." },
  de: { label: "Deutsch", accent: "#ff3b5c",
    title: "Deutsche Verben konjugieren – alle Verben von A–Z", h1: "Deutsche Verben konjugieren",
    intro: "Alle deutschen Verben auf einen Blick – mit vollständiger Konjugationstabelle, Beispielsätzen und einer Eselsbrücke zum Merken. Wähle ein Verb und sieh dir sämtliche Zeitformen an.",
    metaDesc: "Deutsche Verben konjugieren: alphabetische Liste aller Verben mit vollständigen Konjugationstabellen, Beispielsätzen und Merkhilfen." },
  fr: { label: "Französisch", accent: "#a557ff",
    title: "Französische Verben konjugieren – alle Verben von A–Z", h1: "Französische Verben konjugieren",
    intro: "Alle französischen Verben auf einen Blick – mit vollständiger Konjugationstabelle, Beispielsätzen und einer Eselsbrücke zum Merken. Wähle ein Verb und sieh dir sämtliche Zeitformen an.",
    metaDesc: "Französische Verben konjugieren: alphabetische Liste aller Verben mit vollständigen Konjugationstabellen, Beispielsätzen und Merkhilfen." },
  en: { label: "Englisch", accent: "#0a84ff",
    title: "Englische Verben konjugieren – alle Verben von A–Z", h1: "Englische Verben konjugieren",
    intro: "Alle englischen Verben auf einen Blick – mit vollständiger Konjugationstabelle, Beispielsätzen und einer Eselsbrücke zum Merken. Wähle ein Verb und sieh dir sämtliche Zeitformen an.",
    metaDesc: "Englische Verben konjugieren: alphabetische Liste aller Verben mit vollständigen Konjugationstabellen, Beispielsätzen und Merkhilfen." },
  nl: { label: "Niederländisch", accent: "#30c95a",
    title: "Niederländische Verben konjugieren – alle Verben von A–Z", h1: "Niederländische Verben konjugieren",
    intro: "Alle niederländischen Verben auf einen Blick – mit vollständiger Konjugationstabelle, Beispielsätzen und einer Eselsbrücke zum Merken. Wähle ein Verb und sieh dir sämtliche Zeitformen an.",
    metaDesc: "Niederländische Verben konjugieren: alphabetische Liste aller Verben mit vollständigen Konjugationstabellen, Beispielsätzen und Merkhilfen." },
};

/* ─── Space-Grotesk @font-face (self-hosted, 1:1 aus index.html) ───────────── */
const FONT_LATIN = "/fonts/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2";
const FONT_LATIN_EXT = "/fonts/V8mDoQDjQSkFtoMM3T6r8E7mPb94C-s0.woff2";
const UR_LATIN = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const UR_LATIN_EXT = "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";

const FONT_FACE = [400, 500, 600, 700]
  .flatMap((w) => [
    `@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:${w};font-display:swap;src:url(${FONT_LATIN_EXT}) format('woff2');unicode-range:${UR_LATIN_EXT};}`,
    `@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:${w};font-display:swap;src:url(${FONT_LATIN}) format('woff2');unicode-range:${UR_LATIN};}`,
  ])
  .join("\n");

/* ─── Helfer ──────────────────────────────────────────────────────────────── */

function esc(s) {
  return String(s ?? "").replace(/[<>&"]/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;",
  })[c]);
}

function listVerbs(lang) {
  const dir = join(ROOT, "konjugation", lang);
  return readdirSync(dir)
    .filter((name) => {
      if (name.startsWith(".") || name === "index.html") return false;
      try { return statSync(join(dir, name)).isDirectory(); } catch { return false; }
    })
    .sort((a, b) => a.localeCompare(b, "de"));
}

function hrefFor(lang, verb) {
  return `/konjugation/${lang}/${encodeURIComponent(verb)}/`;
}

/* ─── Seiten-Template ─────────────────────────────────────────────────────── */

function renderPage(lang, cfg, verbs) {
  const canonical = `${ORIGIN}/konjugation/${lang}/`;
  const count = verbs.length;

  const listItems = verbs
    .map((v) => `      <li><a href="${esc(hrefFor(lang, v))}">${esc(v)}</a></li>`)
    .join("\n");

  const itemListLd = {
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: cfg.h1, description: cfg.metaDesc, url: canonical, inLanguage: "de",
    mainEntity: {
      "@type": "ItemList", numberOfItems: count,
      itemListElement: verbs.map((v, i) => ({
        "@type": "ListItem", position: i + 1, name: v, url: `${ORIGIN}${hrefFor(lang, v)}`,
      })),
    },
    publisher: { "@type": "Organization", name: "ConjuExpert", url: ORIGIN },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ConjuExpert", item: `${ORIGIN}/` },
      { "@type": "ListItem", position: 2, name: cfg.label, item: canonical },
    ],
  };

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(cfg.title)} | ConjuExpert</title>
<meta name="description" content="${esc(cfg.metaDesc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(cfg.h1)}">
<meta property="og:description" content="${esc(cfg.metaDesc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="ConjuExpert">
<meta name="theme-color" content="#e71583">
<link rel="preload" href="${FONT_LATIN}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${FONT_LATIN_EXT}" as="font" type="font/woff2" crossorigin>
<script type="application/ld+json">${JSON.stringify(itemListLd)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
${FONT_FACE}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f3f4f8; --surface: #ffffff; --surface-2: #f7f8fb;
    --text: #14151a; --muted: #646b7a; --border: rgba(20, 22, 30, 0.08);
    --brand-pink: #e71583; --brand-violet: #a557ff;
    --cta-app: linear-gradient(135deg, #e71583, #a557ff);
    --brand-rainbow: linear-gradient(90deg, #ff3b5c, #ff7a18, #ffc400, #34c759, #0a84ff, #a557ff);
    --lang: ${cfg.accent};
    --radius: 22px;
    --shadow: 0 18px 50px -22px rgba(30, 35, 60, 0.35);
    --shadow-sm: 0 6px 18px -10px rgba(30, 35, 60, 0.3);
    --font: 'Space Grotesk', system-ui, -apple-system, sans-serif;
  }
  body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.6; -webkit-font-smoothing: antialiased; }
  a { color: var(--brand-violet); text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* Nav */
  .site-nav { background: rgba(255,255,255,.85); backdrop-filter: saturate(1.4) blur(10px); border-bottom: 1px solid var(--border); padding: 0 20px; display: flex; align-items: center; justify-content: space-between; height: 58px; position: sticky; top: 0; z-index: 10; }
  .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .nav-brand-mark { display: grid; grid-template-columns: repeat(5,1fr); gap: 3px; width: 30px; height: 30px; padding: 4px; background: var(--surface); border-radius: 9px; box-shadow: 0 1px 4px rgba(0,0,0,.08); flex: none; }
  .nav-brand-mark i { display: block; border-radius: 2px; }
  .nav-brand-name { font-family: var(--font); font-weight: 600; font-size: 18px; letter-spacing: -.02em; color: var(--text); }
  .nav-brand-name b { font-weight: 700; background: var(--cta-app); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .nav-cta { color: #fff; padding: 9px 18px; border-radius: 12px; font-weight: 700; font-size: 13px; background: var(--cta-app); box-shadow: 0 8px 20px -8px rgba(167,87,255,.6); transition: transform .14s, box-shadow .14s; }
  .nav-cta:hover { text-decoration: none; transform: translateY(-1px); box-shadow: 0 12px 26px -8px rgba(167,87,255,.7); }

  /* Page layout */
  .page-wrap { max-width: 860px; margin: 0 auto; padding: 36px 20px 72px; }
  .crumbs { font-size: 13px; color: var(--muted); margin-bottom: 22px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .crumbs a { color: var(--muted); }
  .crumbs a:hover { color: var(--brand-violet); }
  .crumbs .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--lang); display: inline-block; }
  .crumbs span[aria-current] { color: var(--text); font-weight: 600; }

  .eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; }
  h1 { font-family: var(--font); font-weight: 700; font-size: clamp(30px, 5.2vw, 42px); letter-spacing: -.03em; line-height: 1.12; margin-bottom: 14px; }
  .lead { color: var(--muted); font-size: 16.5px; max-width: 62ch; margin-bottom: 20px; }
  .count { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text); background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 7px 14px; box-shadow: var(--shadow-sm); margin-bottom: 30px; }
  .count b { color: var(--brand-pink); }

  .verb-grid { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
  .verb-grid li { margin: 0; }
  .verb-grid a { display: flex; align-items: center; gap: 9px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 13px 16px; color: var(--text); font-weight: 600; box-shadow: var(--shadow-sm); transition: border-color .14s, transform .14s, box-shadow .14s; }
  .verb-grid a::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--lang); flex: none; opacity: .55; transition: opacity .14s, transform .14s; }
  .verb-grid a:hover { text-decoration: none; border-color: var(--brand-violet); transform: translateY(-2px); box-shadow: 0 14px 30px -16px rgba(167,87,255,.5); }
  .verb-grid a:hover::before { opacity: 1; transform: scale(1.25); }

  .site-footer { text-align: center; padding: 26px 20px; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); margin-top: 48px; }
  .site-footer a { color: var(--muted); }
  .site-footer a:hover { color: var(--brand-violet); }
</style>
</head>
<body>

<nav class="site-nav">
  <a class="nav-brand" href="${ORIGIN}/"><span class="nav-brand-mark" data-mark></span><span class="nav-brand-name">Conju<b>Expert</b></span></a>
  <a class="nav-cta" href="${ORIGIN}/?utm_source=seo&utm_medium=konj-index&utm_content=${lang}">App öffnen →</a>
</nav>

<main class="page-wrap">
  <nav class="crumbs" aria-label="Breadcrumb">
    <a href="${ORIGIN}/">ConjuExpert</a>
    <span aria-hidden="true">›</span>
    <span class="dot" aria-hidden="true"></span>
    <span aria-current="page">${esc(cfg.label)}</span>
  </nav>

  <span class="eyebrow">Konjugation · ${esc(cfg.label)}</span>
  <h1>${esc(cfg.h1)}</h1>
  <p class="lead">${esc(cfg.intro)}</p>
  <p class="count"><b>${count}</b> Verben verfügbar</p>

  <ul class="verb-grid">
${listItems}
  </ul>
</main>

<footer class="site-footer">
  <p>© ConjuExpert · <a href="${ORIGIN}/landing/">Über uns</a> · <a href="${ORIGIN}/agb.html">AGB</a> · <a href="${ORIGIN}/datenschutz.html">Datenschutz</a> · <a href="${ORIGIN}/impressum.html">Impressum</a> · <a href="${ORIGIN}/barrierefreiheit.html">Barrierefreiheit</a></p>
</footer>

<script>(function(){var BR=["#ff3b5c","#ff7a18","#ffc400","#34c759","#0a84ff"];document.querySelectorAll("[data-mark]").forEach(function(m){for(var i=0;i<5;i++){var s=document.createElement("i");s.style.background=BR[i];m.appendChild(s);}});})();</script>
</body>
</html>
`;
}

/* ─── Hauptlauf ───────────────────────────────────────────────────────────── */

let targets = process.argv.slice(2);
if (targets.length === 0) {
  console.log("Sprachen angeben, z. B.: node scripts/build-konjugation-index.mjs es");
  console.log("Konfiguriert:", Object.keys(LANGS).join(", "), "(oder 'all')");
  process.exit(0);
}
if (targets.length === 1 && targets[0] === "all") targets = Object.keys(LANGS);

for (const lang of targets) {
  const cfg = LANGS[lang];
  if (!cfg) {
    console.error(`✗  Unbekannte Sprache: ${lang} (konfiguriert: ${Object.keys(LANGS).join(", ")})`);
    process.exitCode = 1;
    continue;
  }
  const verbs = listVerbs(lang);
  const html = renderPage(lang, cfg, verbs);
  writeFileSync(join(ROOT, "konjugation", lang, "index.html"), html, "utf8");
  console.log(`✓  konjugation/${lang}/index.html – ${verbs.length} Verben verlinkt`);
}
