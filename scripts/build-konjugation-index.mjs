#!/usr/bin/env node
/**
 * build-konjugation-index.mjs
 *
 * Generiert pro Sprache die Übersichts-/Hub-Seite konjugation/<lang>/index.html:
 *   Sprach-Tabs · Intro · alphabetische Verbliste (Links zu den Verb-Seiten).
 *
 * Quelle der Verbliste = die real existierenden Verb-Ordner
 * (konjugation/<lang>/<verb>/), bleibt also automatisch in Sync.
 *
 * Design folgt docs/ci.md (Sand & Ink, Schibsted Grotesk, Ink-Button + Regenbogen-
 * Kante) — identisch zu den Verb-Seiten.
 *
 * Aufruf:
 *   node scripts/build-konjugation-index.mjs            # alle 5
 *   node scripts/build-konjugation-index.mjs es de      # einzelne
 */

import { readdirSync, statSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://conjuexpert.app";

// Reihenfolge der Sprach-Tabs (alle Seiten gleich)
const TAB_ORDER = ["de", "es", "en", "fr", "nl"];

const LANGS = {
  de: { label: "Deutsch",        adj: "deutschen",        flag: "🇩🇪", accent: "#ff3b5c" },
  es: { label: "Spanisch",       adj: "spanischen",       flag: "🇪🇸", accent: "#ff9f0a" },
  en: { label: "Englisch",       adj: "englischen",       flag: "🇬🇧", accent: "#0a84ff" },
  fr: { label: "Französisch",    adj: "französischen",    flag: "🇫🇷", accent: "#1b1813" },
  nl: { label: "Niederländisch", adj: "niederländischen", flag: "🇳🇱", accent: "#30c95a" },
};

const FONT_LINKS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">';

function esc(s) {
  return String(s ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]);
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

function hrefFor(lang, verb) { return `/konjugation/${lang}/${encodeURIComponent(verb)}/`; }

function css(accent) {
  return `  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f4eede; --surface: #fffdf6; --surface-2: #ece3d0;
    --text: #211d15; --muted: #8b8068; --border: rgba(60,48,24,.12);
    --ink: #1b1813; --espresso: #2c2823; --selbg: #211d15; --selfg: #fdf8ec;
    --lc: ${accent};
    --brand-rainbow: linear-gradient(90deg,#ff5a4d,#ff9e2c,#ffcf3f,#5bbf6a,#3aa6c9,#5b8def,#a874e6);
    --font: "Schibsted Grotesk", system-ui, sans-serif;
    --display: "Schibsted Grotesk", system-ui, sans-serif;
    --radius: 22px;
    --shadow: 0 22px 48px -26px rgba(70,55,25,.4);
    --shadow-sm: 0 6px 18px -12px rgba(70,55,25,.32);
  }
  body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.6; -webkit-font-smoothing: antialiased; }
  a { color: var(--lc); text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* Primär-Button (CI): dunkles Ink + dünne Regenbogen-Kante */
  .nav-cta, .cta-top, .cta-btn-big {
    color: var(--selfg);
    background: linear-gradient(var(--selbg),var(--selbg)) padding-box, var(--brand-rainbow) border-box;
    border: 1.5px solid transparent;
    box-shadow: 0 12px 26px -12px rgba(30,22,8,.55);
    transition: transform .14s, box-shadow .14s;
  }
  .nav-cta:hover, .cta-top:hover, .cta-btn-big:hover { text-decoration: none; transform: translateY(-1px); box-shadow: 0 16px 32px -12px rgba(30,22,8,.68); }
  .nav-cta:active, .cta-top:active, .cta-btn-big:active { transform: translateY(0); }

  /* Nav */
  .site-nav { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 20px; display: flex; align-items: center; justify-content: space-between; height: 56px; position: sticky; top: 0; z-index: 10; }
  .site-nav::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 3px; background: var(--brand-rainbow); }
  .nav-brand{display:flex;align-items:center;gap:10px;text-decoration:none}
  .nav-brand-mark{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;width:30px;height:30px;padding:4px;background:var(--surface);border-radius:9px;box-shadow:0 1px 4px rgba(60,48,24,.14);flex:none}
  .nav-brand-mark i{display:block;border-radius:2px}
  .nav-brand-name{font-family:var(--display);font-weight:600;font-size:18px;letter-spacing:-.02em;color:var(--text)}
  .nav-brand-name b{font-weight:800;color:var(--ink)}
  .nav-cta { padding: 8px 17px; border-radius: 12px; font-family: var(--display); font-weight: 700; font-size: 13px; }

  .page-wrap { max-width: 760px; margin: 0 auto; padding: 32px 20px 64px; }
  .breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
  .breadcrumb a { color: var(--muted); }
  .breadcrumb a:hover { color: var(--lc); }

  /* Hero */
  .verb-hero { margin-bottom: 22px; }
  .verb-flag { font-size: 28px; margin-bottom: 8px; }
  .verb-hero h1 { font-family: var(--display); font-weight: 800; font-size: clamp(28px,5vw,40px); letter-spacing: -.03em; line-height: 1.14; margin-bottom: 12px; }
  .verb-hero h1 em { font-style: normal; color: var(--lc); }
  .verb-intro { color: var(--muted); font-size: 15.5px; line-height: 1.6; max-width: 62ch; }
  .verb-intro strong { color: var(--text); }

  /* Sprach-Tabs */
  .lang-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 22px; }
  .lang-tab { font-family: var(--display); font-weight: 700; font-size: 13.5px; padding: 9px 15px; border-radius: 999px; background: var(--surface-2); color: var(--muted); border: 1px solid var(--border); transition: transform .12s, border-color .12s; }
  .lang-tab:hover { text-decoration: none; transform: translateY(-1px); border-color: var(--lc); color: var(--text); }
  .lang-tab.on { background: var(--selbg); color: var(--selfg); border-color: transparent; }

  /* CTA oben */
  .cta-top { display: block; text-align: center; margin: 0 0 34px; padding: 15px 24px; border-radius: 14px; font-family: var(--display); font-weight: 800; font-size: 16px; letter-spacing: -.01em; }

  /* Verbliste */
  section { margin-bottom: 40px; }
  section h2 { font-family: var(--display); font-weight: 700; font-size: 22px; letter-spacing: -.02em; margin-bottom: 6px; }
  .sec-sub { color: var(--muted); font-size: 14px; margin-bottom: 20px; }
  .verb-list { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
  .verb-list li { margin: 0; }
  .verb-list a { display: flex; align-items: center; gap: 9px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 12px 15px; color: var(--text); font-weight: 600; box-shadow: var(--shadow-sm); transition: border-color .14s, transform .14s, box-shadow .14s; }
  .verb-list a::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--lc); flex: none; opacity: .55; transition: opacity .14s, transform .14s; }
  .verb-list a:hover { text-decoration: none; border-color: var(--lc); transform: translateY(-2px); box-shadow: 0 14px 30px -16px color-mix(in srgb, var(--lc) 45%, transparent); }
  .verb-list a:hover::before { opacity: 1; transform: scale(1.25); }

  /* CTA unten — Feature-Karte mit Regenbogen-Klammer */
  .cta-bottom { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 30px 24px; text-align: center; box-shadow: var(--shadow); overflow: hidden; }
  .cta-bottom::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--brand-rainbow); }
  .cta-bottom h3 { font-family: var(--display); font-weight: 800; font-size: 20px; letter-spacing: -.02em; margin-bottom: 8px; }
  .cta-bottom p { color: var(--muted); font-size: 14px; margin-bottom: 20px; }
  .cta-btn-big { display: inline-block; padding: 15px 30px; border-radius: 14px; font-family: var(--display); font-weight: 800; font-size: 17px; letter-spacing: -.01em; }
  .cta-sub { display: block; margin-top: 12px; font-size: 13px; color: var(--muted); }

  /* Footer */
  .site-footer { text-align: center; padding: 24px 20px; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); margin-top: 40px; }
  .site-footer a { color: var(--muted); }

  @media (max-width: 480px) {
    .verb-list { grid-template-columns: 1fr 1fr; }
    .page-wrap { padding: 20px 16px 48px; }
  }`;
}

function renderPage(lang, verbs) {
  const cfg = LANGS[lang];
  const canonical = `${ORIGIN}/konjugation/${lang}/`;
  const count = verbs.length;
  const title = `${cfg.label === "Deutsch" ? "Deutsche" : cfg.label === "Spanisch" ? "Spanische" : cfg.label === "Englisch" ? "Englische" : cfg.label === "Französisch" ? "Französische" : "Niederländische"} Verben konjugieren — alle ${count} Verben`;
  const h1adj = title.split(" ")[0];
  const intro = `Alle ${cfg.adj} Verben auf einen Blick: Wähle ein Verb und erhalte die vollständige Konjugationstabelle, natürliche Beispielsätze und eine kurze Geschichte zum Merken. Aktuell <strong>${count} Verben</strong> — kostenlos und ohne Anmeldung.`;
  const metaDesc = `Alle ${cfg.adj} Verben konjugieren: alphabetische Liste mit ${count} Verben, vollständigen Konjugationstabellen, Beispielsätzen und Merkhilfen. Kostenlos.`;
  const ctaUrl = `${ORIGIN}/?utm_source=seo&utm_medium=hub-page&utm_content=${lang}`;

  const tabs = TAB_ORDER.map((l) => {
    const t = LANGS[l];
    const on = l === lang ? " on" : "";
    return `      <a class="lang-tab${on}" href="${ORIGIN}/konjugation/${l}/">${t.flag} ${esc(t.label)}</a>`;
  }).join("\n");

  const listItems = verbs
    .map((v) => `      <li><a href="${esc(hrefFor(lang, v))}">${esc(v)}</a></li>`)
    .join("\n");

  const itemListLd = {
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: title, description: metaDesc, url: canonical, inLanguage: "de",
    mainEntity: {
      "@type": "ItemList", numberOfItems: count,
      itemListElement: verbs.map((v, i) => ({ "@type": "ListItem", position: i + 1, name: v, url: `${ORIGIN}${hrefFor(lang, v)}` })),
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
<title>${esc(title)} | ConjuExpert</title>
<meta name="description" content="${esc(metaDesc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="ConjuExpert">
<meta name="theme-color" content="#f4eede">
<script type="application/ld+json">${JSON.stringify(itemListLd)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${FONT_LINKS}
<style>
${css(cfg.accent)}
</style>
</head>
<body>

<nav class="site-nav">
  <a class="nav-brand" href="${ORIGIN}/"><span class="nav-brand-mark" data-mark></span><span class="nav-brand-name">Conju<b>Expert</b></span></a>
  <a class="nav-cta" href="${ctaUrl}">App öffnen →</a>
</nav>

<main class="page-wrap">

  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="${ORIGIN}/">ConjuExpert</a> › ${esc(cfg.label)}
  </nav>

  <div class="verb-hero">
    <div class="verb-flag">${cfg.flag}</div>
    <h1><em>${esc(h1adj)} Verben</em> konjugieren</h1>
    <p class="verb-intro">${intro}</p>
  </div>

  <nav class="lang-tabs" aria-label="Sprache wählen">
${tabs}
  </nav>

  <a class="cta-top" href="${ctaUrl}">${esc(cfg.label)} im Quiz üben — kostenlos →</a>

  <section>
    <h2>Alle ${esc(cfg.adj)} Verben (${count})</h2>
    <p class="sec-sub">Alphabetisch sortiert. Klicke ein Verb für alle Zeitformen.</p>
    <ul class="verb-list">
${listItems}
    </ul>
  </section>

  <section class="cta-bottom">
    <h3>Verben aktiv üben statt nur nachschlagen</h3>
    <p>Alle Zeitformen · 5 Sprachen · Quiz, Sprechen &amp; Merken · kostenlos starten</p>
    <a class="cta-btn-big" href="${ctaUrl}">ConjuExpert öffnen →</a>
    <span class="cta-sub">Kein Download · keine Anmeldung nötig</span>
  </section>

</main>

<footer class="site-footer">
  <p>© ConjuExpert · <a href="${ORIGIN}/landing/">Über uns</a> · <a href="${ORIGIN}/agb.html">AGB</a> · <a href="${ORIGIN}/datenschutz.html">Datenschutz</a> · <a href="${ORIGIN}/impressum.html">Impressum</a> · <a href="${ORIGIN}/barrierefreiheit.html">Barrierefreiheit</a></p>
</footer>

<script>(function(){var BR=["#ff5a4d","#ff9e2c","#ffcf3f","#5bbf6a","#3aa6c9"];document.querySelectorAll("[data-mark]").forEach(function(m){for(var i=0;i<5;i++){var s=document.createElement("i");s.style.background=BR[i];m.appendChild(s);}});})();</script>
</body>
</html>
`;
}

let targets = process.argv.slice(2);
if (targets.length === 0 || (targets.length === 1 && targets[0] === "all")) targets = TAB_ORDER.slice();

for (const lang of targets) {
  if (!LANGS[lang]) { console.error(`✗ Unbekannte Sprache: ${lang}`); process.exitCode = 1; continue; }
  const verbs = listVerbs(lang);
  writeFileSync(join(ROOT, "konjugation", lang, "index.html"), renderPage(lang, verbs), "utf8");
  console.log(`✓ konjugation/${lang}/index.html — ${verbs.length} Verben`);
}
