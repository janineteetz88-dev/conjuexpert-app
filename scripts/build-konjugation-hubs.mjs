/**
 * Generiert die Sprach-Hub-Seiten /konjugation/<lang>/index.html.
 *
 * Hintergrund: Jede Verb-Seite verlinkt in der Breadcrumb auf
 * /konjugation/<lang>/ (z. B. „Englisch"). Diese Hub-Seiten existierten nicht
 * -> Google meldete sie als „Nicht gefunden (404)". Dieses Skript erzeugt sie
 * aus den vorhandenen Verb-Ordnern, im Design der Verb-Seiten, und stärkt
 * zugleich die interne Verlinkung (Hub -> alle Verben).
 *
 * Ausführen:  node scripts/build-konjugation-hubs.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KONJ = join(ROOT, "konjugation");

const LANGS = {
  de: { flag: "🇩🇪", name: "Deutsch", adj: "Deutsche", code: "de" },
  en: { flag: "🇬🇧", name: "Englisch", adj: "Englische", code: "en" },
  es: { flag: "🇪🇸", name: "Spanisch", adj: "Spanische", code: "es" },
  fr: { flag: "🇫🇷", name: "Französisch", adj: "Französische", code: "fr" },
  nl: { flag: "🇳🇱", name: "Niederländisch", adj: "Niederländische", code: "nl" },
};
const ORDER = ["de", "es", "en", "fr", "nl"];

function listVerbs(lang) {
  const dir = join(KONJ, lang);
  return readdirSync(dir)
    .filter((n) => {
      try { return statSync(join(dir, n)).isDirectory(); } catch { return false; }
    })
    .sort((a, b) => a.localeCompare(b, lang));
}

// Markenzeichen-Skript (identisch zu den Verb-Seiten)
const MARK_SCRIPT =
  '<script>(function(){var BR=["#ff3b5c","#ff7a18","#ffc400","#34c759","#0a84ff"];' +
  'document.querySelectorAll("[data-mark]").forEach(function(m){for(var i=0;i<5;i++){' +
  'var s=document.createElement("i");s.style.background=BR[i];m.appendChild(s);}});})();</script>';

const STYLE = `<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f5f6fa; --surface: #fff; --border: #e4e7ef; --text: #1a1d27;
    --muted: #6b7280; --accent: #0a84ff; --accent2: #a557ff;
    --irr: #ff3b5c; --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  .nav-brand-name b{font-weight:700;background:linear-gradient(90deg,#0a84ff,#a557ff);-webkit-background-clip:text;background-clip:text;color:transparent}
  .nav-cta { color: #fff; padding: 7px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; background: linear-gradient(100deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff); background-size: 240% 100%; animation: gslide 5s linear infinite; box-shadow: 0 4px 14px -4px rgba(120,40,200,.45); transition: transform .14s; }
  .nav-cta:hover { text-decoration: none; transform: scale(1.02); }
  @keyframes gslide { 0%{background-position:0% 50%} 100%{background-position:240% 50%} }
  .page-wrap { max-width: 760px; margin: 0 auto; padding: 32px 20px 64px; }
  .breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
  .breadcrumb a { color: var(--muted); }
  .breadcrumb a:hover { color: var(--accent); }
  .verb-hero { margin-bottom: 28px; }
  .verb-flag { font-size: 28px; margin-bottom: 8px; }
  .verb-hero h1 { font-family: var(--display); font-weight: 800; font-size: clamp(26px,5vw,38px); letter-spacing: -.03em; line-height: 1.15; margin-bottom: 12px; }
  .verb-hero h1 em { font-style: normal; color: var(--accent); }
  .verb-intro { color: var(--muted); font-size: 15px; line-height: 1.6; }
  .lang-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 22px 0 30px; }
  .lang-tabs a { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 20px; font-size: 14px; font-weight: 600; background: var(--surface); border: 1px solid var(--border); color: var(--text); box-shadow: var(--shadow); }
  .lang-tabs a.on { background: #f0f4ff; border-color: #c7d7ff; color: var(--accent); }
  .lang-tabs a:hover { text-decoration: none; border-color: var(--accent); }
  .cta-top { display: block; margin: 24px 0; padding: 18px 24px; border-radius: var(--radius); position: relative; overflow: hidden; color: #fff; font-family: var(--display); font-weight: 800; font-size: 16px; text-align: center; letter-spacing: -.01em; -webkit-font-smoothing: antialiased; box-shadow: 0 8px 24px -8px rgba(120,40,200,.5); transition: transform .14s, box-shadow .14s; }
  .cta-top::before { content: ""; position: absolute; inset: 0; background: linear-gradient(100deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff); background-size: 240% 100%; animation: gslide 5s linear infinite; }
  .cta-top span { position: relative; z-index: 2; }
  .cta-top:hover { text-decoration: none; transform: scale(1.01); }
  section { margin-bottom: 40px; }
  section h2 { font-family: var(--display); font-weight: 700; font-size: 22px; letter-spacing: -.02em; margin-bottom: 8px; padding-bottom: 10px; border-bottom: 2px solid var(--border); }
  .sec-sub { color: var(--muted); font-size: 14px; margin: 12px 0 18px; }
  .verb-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; list-style: none; }
  .verb-list a { display: block; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 11px 14px; font-weight: 600; font-size: 15px; box-shadow: var(--shadow); color: var(--text); transition: transform .12s, border-color .12s; }
  .verb-list a:hover { text-decoration: none; transform: translateY(-2px); border-color: var(--accent); color: var(--accent); }
  .cta-bottom { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px 24px; text-align: center; box-shadow: var(--shadow); }
  .cta-bottom h3 { font-family: var(--display); font-weight: 800; font-size: 20px; letter-spacing: -.02em; margin-bottom: 8px; }
  .cta-bottom p { color: var(--muted); font-size: 14px; margin-bottom: 20px; }
  .cta-btn-big { display: inline-block; padding: 16px 32px; border-radius: 14px; position: relative; overflow: hidden; color: #fff; font-family: var(--display); font-weight: 800; font-size: 17px; letter-spacing: -.01em; -webkit-font-smoothing: antialiased; box-shadow: 0 10px 28px -8px rgba(120,40,200,.55); transition: transform .14s; }
  .cta-btn-big::before { content: ""; position: absolute; inset: 0; background: linear-gradient(100deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff); background-size: 240% 100%; animation: gslide 5s linear infinite; }
  .cta-btn-big span { position: relative; z-index: 2; }
  .cta-btn-big:hover { text-decoration: none; transform: scale(1.02); }
  .cta-sub { display: block; margin-top: 12px; font-size: 13px; color: var(--muted); }
  .site-footer { text-align: center; padding: 24px 20px; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); margin-top: 40px; }
  .site-footer a { color: var(--muted); }
  @media (max-width: 480px) { .page-wrap { padding: 20px 16px 48px; } }
</style>`;

function buildHub(lang) {
  const meta = LANGS[lang];
  const verbs = listVerbs(lang);
  const url = `https://conjuexpert.app/konjugation/${lang}/`;
  const title = `${meta.adj} Verben konjugieren — alle ${verbs.length} Verben | ConjuExpert`;
  const desc = `Alle ${meta.adj.toLowerCase()} Verben konjugieren: Übersicht von ${verbs.length} Verben mit vollständigen Konjugationstabellen, Beispielsätzen und Geschichten. Kostenlos, ohne Anmeldung.`;

  const utm = `?utm_source=seo&utm_medium=hub-page&utm_content=${lang}`;

  const tabs = ORDER.map((l) => {
    const m = LANGS[l];
    const on = l === lang ? " on" : "";
    return `<a class="lang-tab${on}" href="https://conjuexpert.app/konjugation/${l}/">${m.flag} ${m.name}</a>`;
  }).join("\n      ");

  const items = verbs
    .map((v) => `<li><a href="${url}${encodeURI(v)}/">${v}</a></li>`)
    .join("");

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ConjuExpert", item: "https://conjuexpert.app/" },
      { "@type": "ListItem", position: 2, name: meta.name, item: url },
    ],
  };
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${meta.adj} Verben konjugieren`,
    description: desc,
    url,
    inLanguage: "de",
    isPartOf: { "@type": "WebSite", name: "ConjuExpert", url: "https://conjuexpert.app/" },
  };

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:title" content="${meta.adj} Verben konjugieren — alle Zeitformen">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="ConjuExpert">
<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
<script type="application/ld+json">${JSON.stringify(collectionLd)}</script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${STYLE}
</head>
<body>

<nav class="site-nav">
  <a class="nav-brand" href="https://conjuexpert.app/"><span class="nav-brand-mark" data-mark></span><span class="nav-brand-name">Conju<b>Expert</b></span></a>
  <a class="nav-cta" href="https://conjuexpert.app/${utm}">App öffnen →</a>
</nav>

<main class="page-wrap">

  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="https://conjuexpert.app/">ConjuExpert</a> › ${meta.name}
  </nav>

  <div class="verb-hero">
    <div class="verb-flag">${meta.flag}</div>
    <h1><em>${meta.adj} Verben</em> konjugieren</h1>
    <p class="verb-intro">
      Alle ${meta.adj.toLowerCase()} Verben auf einen Blick: Wähle ein Verb und erhalte die
      vollständige Konjugationstabelle, natürliche Beispielsätze und eine kurze Geschichte zum Merken.
      Aktuell <strong>${verbs.length} Verben</strong> — kostenlos und ohne Anmeldung.
    </p>
  </div>

  <div class="lang-tabs">
      ${tabs}
  </div>

  <a class="cta-top" href="https://conjuexpert.app/${utm}">
    <span>🎯 ${meta.name} im Quiz üben — kostenlos →</span>
  </a>

  <section>
    <h2>Alle ${meta.adj.toLowerCase()} Verben (${verbs.length})</h2>
    <p class="sec-sub">Alphabetisch sortiert. Klicke ein Verb für alle Zeitformen.</p>
    <ul class="verb-list">${items}</ul>
  </section>

  <section class="cta-bottom">
    <h3>Lieber direkt üben?</h3>
    <p>Alle 5 Sprachen · alle Zeitformen · KI-Beispielsätze · kostenlos starten</p>
    <a class="cta-btn-big" href="https://conjuexpert.app/${utm}">
      <span>ConjuExpert öffnen →</span>
    </a>
    <span class="cta-sub">Kein Download · keine Anmeldung nötig</span>
  </section>

</main>

<footer class="site-footer">
  <p>© ConjuExpert · <a href="https://conjuexpert.app/landing/">Über uns</a> · <a href="https://conjuexpert.app/agb.html">AGB</a> · <a href="https://conjuexpert.app/datenschutz.html">Datenschutz</a> · <a href="https://conjuexpert.app/impressum.html">Impressum</a></p>
</footer>

${MARK_SCRIPT}
</body>
</html>
`;
}

let n = 0;
for (const lang of Object.keys(LANGS)) {
  const html = buildHub(lang);
  const out = join(KONJ, lang, "index.html");
  writeFileSync(out, html);
  const count = listVerbs(lang).length;
  console.log(`✓ konjugation/${lang}/index.html (${count} Verben)`);
  n++;
}
console.log(`Fertig: ${n} Hub-Seiten erzeugt.`);
