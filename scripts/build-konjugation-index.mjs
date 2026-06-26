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
 * Design ist self-contained (eigener <style>-Block) und spiegelt die
 * bestehenden Verb-Seiten (Nav, Footer, CSS-Tokens, Brand-Mark).
 */

import { readdirSync, statSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://conjuexpert.app";

/* ─── Sprach-Konfiguration ────────────────────────────────────────────────── */
// accent = CI-Farbe der Sprache (identisch zu src/data/clusters.js)
const LANGS = {
  es: {
    label: "Spanisch",
    accent: "#ff9f0a",
    title: "Spanische Verben konjugieren – alle Verben von A–Z",
    h1: "Spanische Verben konjugieren",
    intro:
      "Alle spanischen Verben auf einen Blick – mit vollständiger Konjugationstabelle, " +
      "Beispielsätzen und einer Eselsbrücke zum Merken. Wähle ein Verb und sieh dir " +
      "sämtliche Zeitformen an.",
    metaDesc:
      "Spanische Verben konjugieren: alphabetische Liste aller Verben mit vollständigen " +
      "Konjugationstabellen, Beispielsätzen und Merkhilfen.",
  },
  de: {
    label: "Deutsch",
    accent: "#ff3b5c",
    title: "Deutsche Verben konjugieren – alle Verben von A–Z",
    h1: "Deutsche Verben konjugieren",
    intro:
      "Alle deutschen Verben auf einen Blick – mit vollständiger Konjugationstabelle, " +
      "Beispielsätzen und einer Eselsbrücke zum Merken. Wähle ein Verb und sieh dir " +
      "sämtliche Zeitformen an.",
    metaDesc:
      "Deutsche Verben konjugieren: alphabetische Liste aller Verben mit vollständigen " +
      "Konjugationstabellen, Beispielsätzen und Merkhilfen.",
  },
  fr: {
    label: "Französisch",
    accent: "#a557ff",
    title: "Französische Verben konjugieren – alle Verben von A–Z",
    h1: "Französische Verben konjugieren",
    intro:
      "Alle französischen Verben auf einen Blick – mit vollständiger Konjugationstabelle, " +
      "Beispielsätzen und einer Eselsbrücke zum Merken. Wähle ein Verb und sieh dir " +
      "sämtliche Zeitformen an.",
    metaDesc:
      "Französische Verben konjugieren: alphabetische Liste aller Verben mit vollständigen " +
      "Konjugationstabellen, Beispielsätzen und Merkhilfen.",
  },
  en: {
    label: "Englisch",
    accent: "#0a84ff",
    title: "Englische Verben konjugieren – alle Verben von A–Z",
    h1: "Englische Verben konjugieren",
    intro:
      "Alle englischen Verben auf einen Blick – mit vollständiger Konjugationstabelle, " +
      "Beispielsätzen und einer Eselsbrücke zum Merken. Wähle ein Verb und sieh dir " +
      "sämtliche Zeitformen an.",
    metaDesc:
      "Englische Verben konjugieren: alphabetische Liste aller Verben mit vollständigen " +
      "Konjugationstabellen, Beispielsätzen und Merkhilfen.",
  },
  nl: {
    label: "Niederländisch",
    accent: "#30c95a",
    title: "Niederländische Verben konjugieren – alle Verben von A–Z",
    h1: "Niederländische Verben konjugieren",
    intro:
      "Alle niederländischen Verben auf einen Blick – mit vollständiger Konjugationstabelle, " +
      "Beispielsätzen und einer Eselsbrücke zum Merken. Wähle ein Verb und sieh dir " +
      "sämtliche Zeitformen an.",
    metaDesc:
      "Niederländische Verben konjugieren: alphabetische Liste aller Verben mit vollständigen " +
      "Konjugationstabellen, Beispielsätzen und Merkhilfen.",
  },
};

/* ─── Helfer ──────────────────────────────────────────────────────────────── */

function esc(s) {
  return String(s ?? "").replace(/[<>&"]/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;",
  })[c]);
}

// Verb-Ordner als sortierte Liste (locale-bewusst, Kleinschreibung)
function listVerbs(lang) {
  const dir = join(ROOT, "konjugation", lang);
  return readdirSync(dir)
    .filter((name) => {
      if (name.startsWith(".") || name === "index.html") return false;
      try {
        return statSync(join(dir, name)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort((a, b) => a.localeCompare(b, "de"));
}

// Pfad-Segment URL-sicher kodieren (UTF-8-Verben wie „genießen")
function hrefFor(lang, verb) {
  return `/konjugation/${lang}/${encodeURIComponent(verb)}/`;
}

/* ─── Seiten-Template ─────────────────────────────────────────────────────── */

function renderPage(lang, cfg, verbs) {
  const canonical = `${ORIGIN}/konjugation/${lang}/`;
  const count = verbs.length;

  const listItems = verbs
    .map(
      (v) =>
        `      <li><a href="${esc(hrefFor(lang, v))}">${esc(v)}</a></li>`
    )
    .join("\n");

  // JSON-LD: CollectionPage + ItemList + Breadcrumb
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cfg.h1,
    description: cfg.metaDesc,
    url: canonical,
    inLanguage: "de",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: count,
      itemListElement: verbs.map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: v,
        url: `${ORIGIN}${hrefFor(lang, v)}`,
      })),
    },
    publisher: {
      "@type": "Organization",
      name: "ConjuExpert",
      url: ORIGIN,
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
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
<script type="application/ld+json">${JSON.stringify(itemListLd)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f5f6fa; --surface: #fff; --border: #e4e7ef; --text: #1a1d27;
    --muted: #6b7280; --accent: ${cfg.accent}; --accent2: #a557ff;
    --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --display: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
    --radius: 16px; --shadow: 0 2px 12px rgba(0,0,0,.07);
  }
  body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.6; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }

  .site-nav { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 20px; display: flex; align-items: center; justify-content: space-between; height: 54px; position: sticky; top: 0; z-index: 10; }
  .nav-brand{display:flex;align-items:center;gap:10px;text-decoration:none}
  .nav-brand-mark{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;width:30px;height:30px;padding:4px;background:var(--surface);border-radius:9px;box-shadow:0 1px 4px rgba(0,0,0,.08);flex:none}
  .nav-brand-mark i{display:block;border-radius:2px}
  .nav-brand-name{font-family:var(--display);font-weight:600;font-size:18px;letter-spacing:-.02em;color:var(--text)}
  .nav-brand-name b{font-weight:700;background:linear-gradient(90deg,#e71583,#a557ff);-webkit-background-clip:text;background-clip:text;color:transparent}
  .nav-cta { color: #fff; padding: 7px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; background: linear-gradient(100deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff); background-size: 240% 100%; box-shadow: 0 4px 14px -4px rgba(120,40,200,.45); transition: transform .14s; }
  .nav-cta:hover { text-decoration: none; transform: scale(1.02); }

  .page-wrap { max-width: 760px; margin: 0 auto; padding: 32px 20px 64px; }
  .crumbs { font-size: 13px; color: var(--muted); margin-bottom: 18px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .crumbs a { color: var(--muted); }
  .crumbs span[aria-current] { color: var(--text); font-weight: 600; }

  h1 { font-family: var(--display); font-size: clamp(28px, 5vw, 38px); letter-spacing: -.02em; line-height: 1.15; margin-bottom: 14px; }
  .lead { color: var(--muted); font-size: 16px; max-width: 60ch; margin-bottom: 8px; }
  .count { font-size: 13px; color: var(--muted); margin-bottom: 24px; }
  .count b { color: var(--accent); }

  .verb-grid { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
  .verb-grid li { margin: 0; }
  .verb-grid a { display: block; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 11px 14px; color: var(--text); font-weight: 600; box-shadow: var(--shadow); transition: border-color .14s, transform .14s; }
  .verb-grid a:hover { text-decoration: none; border-color: var(--accent); transform: translateY(-1px); }

  .site-footer { text-align: center; padding: 24px 20px; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); margin-top: 40px; }
  .site-footer a { color: var(--muted); }
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
    <span aria-current="page">${esc(cfg.label)}</span>
  </nav>

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
if (targets.length === 1 && targets[0] === "all") {
  targets = Object.keys(LANGS);
}

for (const lang of targets) {
  const cfg = LANGS[lang];
  if (!cfg) {
    console.error(`✗  Unbekannte Sprache: ${lang} (konfiguriert: ${Object.keys(LANGS).join(", ")})`);
    process.exitCode = 1;
    continue;
  }
  const verbs = listVerbs(lang);
  const html = renderPage(lang, cfg, verbs);
  const out = join(ROOT, "konjugation", lang, "index.html");
  writeFileSync(out, html, "utf8");
  console.log(`✓  konjugation/${lang}/index.html – ${verbs.length} Verben verlinkt`);
}
