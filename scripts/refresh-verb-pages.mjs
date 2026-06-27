#!/usr/bin/env node
/**
 * refresh-verb-pages.mjs
 *
 * Hebt die bereits existierenden SEO-Verb-Seiten (konjugation/<lang>/<verb>/index.html)
 * chirurgisch auf den neuen Stand:
 *   1. CI aus docs/ci.md (Sand & Ink, Schibsted Grotesk, Ink-Button + Regenbogen-Kante)
 *   2. interaktives Mini-Quiz-Widget (liest die Formen aus den Tabellen der Seite)
 *   3. Deep-Link der App-CTAs (?lang=..&verb=..) → App öffnet direkt auf dem Verb
 *
 * Der SEO-Inhalt (Tabellen, Beispiele, Story, Meta, JSON-LD) bleibt unangetastet.
 * Keine AI-Aufrufe, kein Netzwerk. Idempotent: Seiten mit Widget werden übersprungen.
 *
 * Aufruf:
 *   node scripts/refresh-verb-pages.mjs            # alle
 *   node scripts/refresh-verb-pages.mjs es/estar   # einzelne (Debug)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const KONJ = path.join(ROOT, "konjugation");

// Sprach-Akzentfarben (--lc) gemäß docs/ci.md §3
const LANG_ACCENT = { de: "#ff3b5c", es: "#ff9f0a", en: "#0a84ff", nl: "#30c95a", fr: "#1b1813" };

const FONT_LINKS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">';

function css(accent, transFlag) {
  return `  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f4eede; --surface: #fffdf6; --surface-2: #ece3d0;
    --text: #211d15; --muted: #8b8068; --border: rgba(60,48,24,.12);
    --ink: #1b1813; --espresso: #2c2823; --selbg: #211d15; --selfg: #fdf8ec;
    --lc: ${accent};
    --ok: #1a9b46; --bad: #ff3b5c;
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
  .nav-cta, .cta-btn-big, .qz-check, .qz-cta {
    color: var(--selfg);
    background: linear-gradient(var(--selbg),var(--selbg)) padding-box, var(--brand-rainbow) border-box;
    border: 1.5px solid transparent;
    box-shadow: 0 12px 26px -12px rgba(30,22,8,.55);
    transition: transform .14s, box-shadow .14s;
  }
  .nav-cta:hover, .cta-btn-big:hover, .qz-cta:hover { text-decoration: none; transform: translateY(-1px); box-shadow: 0 16px 32px -12px rgba(30,22,8,.68); }
  .nav-cta:active, .cta-btn-big:active, .qz-cta:active, .qz-check:active { transform: translateY(0); }

  /* Nav — mit Regenbogen-Signaturlinie */
  .site-nav { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 20px; display: flex; align-items: center; justify-content: space-between; height: 56px; position: sticky; top: 0; z-index: 10; }
  .site-nav::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 3px; background: var(--brand-rainbow); }
  .nav-brand{display:flex;align-items:center;gap:10px;text-decoration:none}
  .nav-brand-mark{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;width:30px;height:30px;padding:4px;background:var(--surface);border-radius:9px;box-shadow:0 1px 4px rgba(60,48,24,.14);flex:none}
  .nav-brand-mark i{display:block;border-radius:2px}
  .nav-brand-name{font-family:var(--display);font-weight:600;font-size:18px;letter-spacing:-.02em;color:var(--text)}
  .nav-brand-name b{font-weight:800;background:var(--brand-rainbow);-webkit-background-clip:text;background-clip:text;color:transparent}
  .nav-cta { padding: 8px 17px; border-radius: 12px; font-family: var(--display); font-weight: 700; font-size: 13px; }

  /* Page layout */
  .page-wrap { max-width: 760px; margin: 0 auto; padding: 32px 20px 64px; }

  /* Hero */
  .verb-hero { margin-bottom: 26px; }
  .verb-flag { font-size: 28px; margin-bottom: 8px; }
  .verb-hero h1 { font-family: var(--display); font-weight: 800; font-size: clamp(26px,5vw,38px); letter-spacing: -.03em; line-height: 1.15; margin-bottom: 12px; }
  .verb-hero h1 em { font-style: normal; color: var(--lc); }
  .verb-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; border: 1px solid var(--border); background: var(--surface-2); color: var(--muted); }
  .badge-irr { color: var(--lc); }
  .badge-lang { color: var(--text); }
  .verb-intro { color: var(--muted); font-size: 15px; line-height: 1.6; }

  /* Section headings */
  section { margin-bottom: 40px; }
  section h2 { font-family: var(--display); font-weight: 700; font-size: 22px; letter-spacing: -.02em; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }

  /* Conjugation tables */
  .tense-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .tense-block { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 18px; box-shadow: var(--shadow-sm); }
  .tense-label { font-family: var(--display); font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); margin-bottom: 12px; }
  .conj-table { width: 100%; border-collapse: collapse; }
  .conj-table td { padding: 5px 0; font-size: 15px; }
  .conj-table .pron { color: var(--muted); font-size: 13px; width: 45%; }
  .conj-table .irr { color: var(--lc); font-weight: 700; }

  /* All tenses toggle */
  .all-tenses-wrap details summary { cursor: pointer; font-weight: 700; font-size: 15px; color: var(--lc); padding: 12px 0; list-style: none; }
  .all-tenses-wrap details summary::-webkit-details-marker { display: none; }
  .all-tenses-wrap details summary::before { content: "▶ "; font-size: 11px; }
  .all-tenses-wrap details[open] summary::before { content: "▼ "; }

  /* Examples */
  .ex-tense { margin-bottom: 24px; }
  .ex-tense-label { display: inline-block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--lc); background: var(--surface-2); border-radius: 999px; padding: 3px 10px; margin-bottom: 12px; }
  .ex-tense ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .ex-item { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 12px 16px; box-shadow: var(--shadow-sm); }
  .ex-tgt { display: block; font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .ex-de { display: block; font-size: 13px; color: var(--muted); }

  /* Story */
  .story-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; }
  .story-text { padding: 20px 22px; font-size: 15px; line-height: 1.75; border-bottom: 1px solid var(--border); }
  .story-trans { padding: 16px 22px; font-size: 14px; color: var(--muted); line-height: 1.7; }
  .story-trans::before { content: "${transFlag} "; }

  /* Hero image */
  .hero-img { margin: 0 0 24px; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
  .hero-img img { width: 100%; height: 260px; object-fit: cover; display: block; }
  .hero-img figcaption { font-size: 11px; color: var(--muted); padding: 6px 12px; background: var(--surface); text-align: right; }
  .hero-img figcaption a { color: var(--muted); }

  /* CTA bottom — Feature-Karte mit Regenbogen-Klammer (Oberkante) */
  .cta-bottom { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 30px 24px; text-align: center; box-shadow: var(--shadow); overflow: hidden; }
  .cta-bottom::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--brand-rainbow); }
  .cta-bottom h3 { font-family: var(--display); font-weight: 800; font-size: 20px; letter-spacing: -.02em; margin-bottom: 8px; }
  .cta-bottom p { color: var(--muted); font-size: 14px; margin-bottom: 20px; }
  .cta-btn-big { display: inline-block; padding: 15px 30px; border-radius: 14px; font-family: var(--display); font-weight: 800; font-size: 17px; letter-spacing: -.01em; }
  .cta-sub { display: block; margin-top: 12px; font-size: 13px; color: var(--muted); }

  /* Breadcrumb */
  .breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
  .breadcrumb a { color: var(--muted); }
  .breadcrumb a:hover { color: var(--lc); }

  /* Footer */
  .site-footer { text-align: center; padding: 24px 20px; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); margin-top: 40px; }
  .site-footer a { color: var(--muted); }

  /* ── Mini-Quiz-Widget (ein Stück echte App) ─────────────────────── */
  .qz { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); padding: 22px 22px 24px; margin: 0 0 36px; overflow: hidden; }
  .qz::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--brand-rainbow); }
  .qz-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  .qz-title { font-family: var(--display); font-weight: 800; font-size: 20px; letter-spacing: -.02em; margin-bottom: 4px; }
  .qz-title em { font-style: normal; color: var(--lc); }
  .qz-sub { color: var(--muted); font-size: 14px; margin-bottom: 18px; }
  .qz-progress { display: flex; gap: 6px; margin-bottom: 18px; }
  .qz-progress i { width: 24px; height: 5px; border-radius: 999px; background: var(--surface-2); display: block; }
  .qz-progress i.done { background: var(--brand-rainbow); }
  .qz-prompt { font-size: 14px; color: var(--muted); margin-bottom: 8px; }
  .qz-prompt b { color: var(--text); font-weight: 700; }
  .qz-cue { font-family: var(--display); font-weight: 800; font-size: 26px; letter-spacing: -.02em; margin-bottom: 14px; }
  .qz-cue .tense { color: var(--lc); }
  .qz-form { display: flex; gap: 10px; flex-wrap: wrap; }
  .qz-input { flex: 1 1 180px; min-width: 0; font-family: var(--font); font-size: 17px; font-weight: 600; padding: 13px 16px; border-radius: 14px; border: 1.5px solid var(--border); background: var(--surface-2); color: var(--text); }
  .qz-input:focus { outline: none; border-color: var(--lc); background: var(--surface); }
  .qz-input:disabled { opacity: .7; }
  .qz-check { flex: 0 0 auto; padding: 13px 22px; border-radius: 14px; font-family: var(--display); font-weight: 700; font-size: 15px; cursor: pointer; }
  .qz-feedback { margin-top: 14px; font-size: 15px; font-weight: 600; min-height: 22px; }
  .qz-feedback.ok { color: var(--ok); }
  .qz-feedback.near { color: #b06a00; }
  .qz-feedback.bad { color: var(--bad); }
  .qz-result { text-align: center; padding: 4px 0 2px; }
  .qz-score { font-family: var(--display); font-weight: 800; font-size: 30px; letter-spacing: -.02em; margin-bottom: 4px; }
  .qz-result p { color: var(--muted); font-size: 14px; margin-bottom: 18px; max-width: 42ch; margin-left: auto; margin-right: auto; }
  .qz-cta { display: inline-block; padding: 15px 28px; border-radius: 14px; font-family: var(--display); font-weight: 800; font-size: 16px; }
  .qz-again { display: block; margin-top: 12px; font-size: 13px; color: var(--muted); background: none; border: 0; cursor: pointer; width: 100%; font-family: var(--font); }
  .qz-again:hover { color: var(--text); }
  /* Regenbogen-Button (Fläche) — direkt nach dem Feedback */
  .qz-go-app { display: inline-block; margin-top: 14px; padding: 13px 24px; border-radius: 14px; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.35); font-family: var(--display); font-weight: 800; font-size: 15px; background: var(--brand-rainbow); box-shadow: 0 12px 26px -12px rgba(60,40,10,.5); transition: transform .14s, box-shadow .14s; }
  .qz-go-app:hover { text-decoration: none; transform: translateY(-1px); box-shadow: 0 16px 32px -12px rgba(60,40,10,.62); }
  .qz-go-app:active { transform: translateY(0); }

  @media (max-width: 480px) {
    .tense-grid { grid-template-columns: 1fr; }
    .page-wrap { padding: 20px 16px 48px; }
  }`;
}

function widget(verb) {
  return `  <!-- Mini-Quiz-Widget: ein Stück echte App, direkt nutzbar -->
  <section class="qz" id="qz" aria-label="Mini-Quiz zu ${verb}">
    <div class="qz-eyebrow">★ Mini-Quiz · ein Stück echte App</div>
    <div class="qz-title">Sitzt <em>${verb}</em> schon?</div>
    <div class="qz-sub">Tippe die richtige Form — du bekommst sofort Feedback, genau wie in der App.</div>
    <div class="qz-progress" id="qzDots" aria-hidden="true"></div>
    <div id="qzBody"></div>
  </section>`;
}

function quizScript(verb, lang) {
  const enc = encodeURIComponent(verb);
  const app = `https://conjuexpert.app/?lang=${lang}&verb=${enc}&utm_source=seo&utm_medium=verb-quiz&utm_content=${lang}-${enc}`;
  const jsVerb = JSON.stringify(verb);
  return `<!-- Mini-Quiz-Widget — speist sich aus den Konjugationstabellen dieser Seite -->
<script>(function(){
  var VERB = ${jsVerb};
  var APP = ${JSON.stringify(app)};
  var N = 5;
  function strip(s){ return (s||"").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().trim(); }
  function shuffle(a){ for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
  var pool = [];
  var grid = document.querySelector(".tense-grid");
  if (grid) grid.querySelectorAll(".tense-block").forEach(function(b){
    var lbl = b.querySelector(".tense-label");
    var tense = lbl ? lbl.textContent.trim() : "";
    b.querySelectorAll("tr").forEach(function(tr){
      var p = tr.querySelector(".pron");
      var f = tr.querySelector("td:last-child");
      if (!p || !f) return;
      var form = f.textContent.trim();
      if (form && form !== "\\u2014" && form !== "—" && form.indexOf(" ") === -1)
        pool.push({ tense: tense, pron: p.textContent.trim(), form: form });
    });
  });
  var sec = document.getElementById("qz");
  var dots = document.getElementById("qzDots");
  var body = document.getElementById("qzBody");
  if (pool.length < 3 || !body) { if (sec) sec.style.display = "none"; return; }
  N = Math.min(N, pool.length);
  var qs = [], idx = 0, score = 0;
  for (var k = 0; k < N; k++){ var d = document.createElement("i"); dots.appendChild(d); }
  function paintDots(){ var ii = dots.querySelectorAll("i"); for (var n=0;n<ii.length;n++) ii[n].className = (n<idx?"done":""); }
  function ask(){
    paintDots();
    var q = qs[idx];
    body.innerHTML =
      '<div class="qz-prompt">Wie lautet <b>'+VERB+'</b> hier?</div>'+
      '<div class="qz-cue"><span class="tense">'+q.tense+'</span> · '+q.pron+'</div>'+
      '<div class="qz-form">'+
        '<input class="qz-input" id="qzIn" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="deine Antwort…" aria-label="Antwort">'+
        '<button class="qz-check" id="qzGo" type="button">Prüfen</button>'+
      '</div>'+
      '<div class="qz-feedback" id="qzFb" aria-live="polite"></div>';
    var inp = document.getElementById("qzIn");
    var go = document.getElementById("qzGo");
    var fb = document.getElementById("qzFb");
    var answered = false;
    try { inp.focus(); } catch(e){}
    function submit(){
      if (answered){ idx++; (idx>=N) ? result() : ask(); return; }
      var v = inp.value.trim();
      if (!v) return;
      answered = true;
      if (v.toLowerCase() === q.form.toLowerCase()){ score++; fb.className="qz-feedback ok"; fb.textContent="✓ Richtig!"; }
      else if (strip(v) === strip(q.form)){ score++; fb.className="qz-feedback near"; fb.textContent="Fast! Achte auf den Akzent: "+q.form; }
      else { fb.className="qz-feedback bad"; fb.textContent="✗ Richtig wäre: "+q.form; }
      inp.disabled = true;
      go.textContent = (idx < N-1) ? "Weiter →" : "Ergebnis →";
      var goApp = document.createElement("a");
      goApp.className = "qz-go-app";
      goApp.href = APP;
      goApp.innerHTML = "Jetzt in der App weiterüben →";
      fb.insertAdjacentElement("afterend", goApp);
    }
    go.addEventListener("click", submit);
    inp.addEventListener("keydown", function(e){ if (e.key === "Enter"){ e.preventDefault(); submit(); } });
  }
  function result(){
    paintDots();
    var line = score >= Math.ceil(N*0.8) ? "Stark — das sitzt fast!"
             : score >= Math.ceil(N*0.4) ? "Solide. Mit ein paar Runden sitzt das."
             : "Übung macht den Meister.";
    body.innerHTML =
      '<div class="qz-result">'+
        '<div class="qz-score">'+score+' / '+N+'</div>'+
        '<p>'+line+' Im echten Quiz: alle Zeitformen, 5 Sprachen, dazu Sprechen &amp; Merken.</p>'+
        '<a class="qz-cta" href="'+APP+'">'+VERB+' im vollen Quiz üben →</a>'+
        '<button class="qz-again" id="qzAgain" type="button">↻ Nochmal mit anderen Formen</button>'+
      '</div>';
    document.getElementById("qzAgain").addEventListener("click", function(){
      qs = shuffle(pool.slice()).slice(0, N); idx = 0; score = 0; ask();
    });
  }
  qs = shuffle(pool.slice()).slice(0, N);
  ask();
})();</script>`;
}

// ── Transform one page ─────────────────────────────────────────────────────────

function transform(html, lang, verb) {
  if (html.includes('id="qz"')) return null; // schon umgestellt
  const accent = LANG_ACCENT[lang] || "#ff9f0a";
  const enc = encodeURIComponent(verb);

  // 1. Font-Links nach dem Icon-Link
  if (!html.includes("Schibsted+Grotesk")) {
    html = html.replace(
      '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
      '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n' + FONT_LINKS
    );
  }

  // 2. Komplettes Stylesheet ersetzen (DE-Seiten: Übersetzung ist englisch → 🇬🇧)
  const transFlag = lang === "de" ? "🇬🇧" : "🇩🇪";
  html = html.replace(/<style>[\s\S]*?<\/style>/, "<style>\n" + css(accent, transFlag) + "\n</style>");

  // 3. cta-top → Widget (oder Widget vor die erste <section>, falls kein cta-top)
  if (/<a class="cta-top"[\s\S]*?<\/a>/.test(html)) {
    html = html.replace(/<a class="cta-top"[\s\S]*?<\/a>/, widget(verb));
  } else {
    html = html.replace(/(\n\s*<section)/, "\n\n" + widget(verb) + "$1");
  }

  // 4. App-CTAs deep-linken (nav-cta, cta-btn-big …)
  html = html.replace(
    /href="https:\/\/conjuexpert\.app\/\?utm_source=seo/g,
    `href="https://conjuexpert.app/?lang=${lang}&verb=${enc}&utm_source=seo`
  );

  // 5. Brand-Mark-Farben auf die weichen Regenbogen-Töne
  html = html.replace(
    '["#ff3b5c","#ff7a18","#ffc400","#34c759","#0a84ff"]',
    '["#ff5a4d","#ff9e2c","#ffcf3f","#5bbf6a","#3aa6c9"]'
  );

  // 6. Quiz-JS vor </body>
  html = html.replace("</body>", quizScript(verb, lang) + "\n</body>");

  return html;
}

// ── Main ───────────────────────────────────────────────────────────────────────

const onlyArg = process.argv[2]; // optional "lang/verb"
let changed = 0, skipped = 0, missing = 0;

for (const lang of fs.readdirSync(KONJ)) {
  const langDir = path.join(KONJ, lang);
  if (!fs.statSync(langDir).isDirectory()) continue;
  for (const verb of fs.readdirSync(langDir)) {
    if (onlyArg && onlyArg !== `${lang}/${verb}`) continue;
    const file = path.join(langDir, verb, "index.html");
    if (!fs.existsSync(file)) continue;
    const before = fs.readFileSync(file, "utf8");
    const after = transform(before, lang, verb);
    if (after === null) { skipped++; continue; }
    fs.writeFileSync(file, after, "utf8");
    changed++;
  }
}

console.log(`✓ umgestellt: ${changed} · übersprungen (schon fertig): ${skipped}`);
