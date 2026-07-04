#!/usr/bin/env node
/**
 * Generates static SEO verb pages: /konjugation/[lang]/[verb]/index.html
 * Each page includes conjugation table + AI example sentences per tense + AI story + CTA.
 *
 * Usage:
 *   node scripts/generate-verb-pages.mjs
 *   PAGES_PER_RUN=10 node scripts/generate-verb-pages.mjs
 *
 * Reads/writes scripts/verb-queue.json to track progress.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runInNewContext } from 'vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const WORKER = 'https://bitter-bird-3204.janine-teetz88.workers.dev';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const PEXELS_KEY = process.env.PEXELS_API_KEY || '';
const _perRun = parseInt(process.env.PAGES_PER_RUN || '0');
const PER_RUN = _perRun === 0 ? Infinity : _perRun;
const QUEUE_FILE = path.join(__dirname, 'verb-queue.json');
const VERB_IMAGES_FILE = path.join(__dirname, 'verb-images.json');
const SITE = 'https://conjuexpert.app';

const LANG_META = {
  es: { name: 'Spanisch', native: 'Español', flag: '🇪🇸', pronLabel: ['yo','tú','él/ella','nosotros','vosotros','ellos/ellas'], mainTenses: ['present','past','imperfect','future','subjunctive'], ctaVerb: 'konjugieren üben' },
  fr: { name: 'Französisch', native: 'Français', flag: '🇫🇷', pronLabel: ['je','tu','il/elle','nous','vous','ils/elles'], mainTenses: ['present','past','imperfect','future','conditional'], ctaVerb: 'konjugieren üben' },
  de: { name: 'Deutsch', native: 'Deutsch', flag: '🇩🇪', pronLabel: ['ich','du','er/sie/es','wir','ihr','sie/Sie'], mainTenses: ['present','past','future'], ctaVerb: 'konjugieren üben' },
  nl: { name: 'Niederländisch', native: 'Nederlands', flag: '🇳🇱', pronLabel: ['ik','jij/je','hij/zij','wij/we','jullie','zij/ze'], mainTenses: ['present','past','future'], ctaVerb: 'vervoegen oefenen' },
  en: { name: 'Englisch', native: 'English', flag: '🇬🇧', pronLabel: ['I','you','he/she/it','we','you (pl)','they'], mainTenses: ['present','past','future','perfect'], ctaVerb: 'conjugate & practise' },
};

// ── Engine loader ────────────────────────────────────────────────────────────

function loadEngine(lang) {
  const src = fs.readFileSync(path.join(ROOT, `engine/conj-${lang}.js`), 'utf8');
  const ctx = { window: { CONJ: {} } };
  runInNewContext(src, ctx);
  return ctx.window.CONJ[lang];
}

function loadTrans() {
  const src = fs.readFileSync(path.join(ROOT, 'engine/translations.js'), 'utf8');
  const ctx = { window: { TRANS: {} } };
  runInNewContext(src, ctx);
  return ctx.window.TRANS;
}

// ── Queue management ─────────────────────────────────────────────────────────

function extractExtraVerbs() {
  // Parse EXTRA_VERBS / EXTRA_VERBS2 / EXTRA_VERBS3 from index.html
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const result = {};
  for (const match of src.matchAll(/const EXTRA_VERBS\d*\s*=\s*\{([\s\S]*?)\n\};/g)) {
    const block = match[1];
    for (const langMatch of block.matchAll(/(\w{2}):\s*\[([^\]]+)\]/g)) {
      const lang = langMatch[1];
      const verbs = langMatch[2].match(/"([^"]+)"/g)?.map(v => v.replace(/"/g, '')) || [];
      result[lang] = [...(result[lang] || []), ...verbs];
    }
  }
  return result;
}

function buildQueue(engines) {
  const extra = extractExtraVerbs();
  const queue = [];
  for (const lang of Object.keys(LANG_META)) {
    const eng = engines[lang];
    const irr = new Set(eng.irregulars || []);
    const seen = new Set();
    const add = (v) => { if (v && !seen.has(v)) { seen.add(v); queue.push({ lang, verb: v }); } };
    // Priority: samples + irregulars first, then extra verb batches
    (eng.samples || []).forEach(add);
    Array.from(irr).forEach(add);
    (extra[lang] || []).forEach(add);
  }
  return queue.filter(({ lang, verb }) => {
    const out = path.join(ROOT, 'konjugation', lang, verb, 'index.html');
    return !fs.existsSync(out);
  });
}

function loadQueue(engines) {
  if (fs.existsSync(QUEUE_FILE)) {
    const q = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    // Filter out already-generated pages (in case of manual generation)
    return q.filter(({ lang, verb }) => !fs.existsSync(path.join(ROOT, 'konjugation', lang, verb, 'index.html')));
  }
  const q = buildQueue(engines);
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(q, null, 2));
  console.log(`Queue built: ${q.length} pages to generate.`);
  return q;
}

// ── AI helper ────────────────────────────────────────────────────────────────

async function aiDirect(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message || `HTTP ${res.status}`);
      return d.choices?.[0]?.message?.content || '';
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

async function aiWorker(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(WORKER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
      return d.text || '';
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

const ai = OPENAI_KEY ? aiDirect : aiWorker;

// ── Verb image overrides ──────────────────────────────────────────────────────

function loadVerbImages() {
  if (!fs.existsSync(VERB_IMAGES_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(VERB_IMAGES_FILE, 'utf8')); } catch { return {}; }
}
const VERB_IMAGES = loadVerbImages();

// ── Hero image (Pexels / Unsplash) ────────────────────────────────────────────

async function fetchHeroImage(verb, meaning, lang) {
  const apiKey = PEXELS_KEY || UNSPLASH_KEY;

  // Custom override from verb-images.json
  const override = VERB_IMAGES[`${lang}/${verb}`];
  if (override?.url) {
    return {
      url: override.url,
      alt: override.alt || `${verb} auf ${LANG_META[lang]?.name} konjugieren — ${meaning}`,
      authorName: override.authorName || null,
      authorUrl: override.authorUrl || null,
      sourceUrl: override.sourceUrl || override.url,
      sourceName: override.sourceName || null,
    };
  }

  if (!apiKey) return null;
  // Use override.query if set, otherwise derive from meaning
  const rawQuery = override?.query || (meaning || verb).replace(/^to\s+/i, '');
  const query = encodeURIComponent(rawQuery);

  if (PEXELS_KEY) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${query}&orientation=landscape&per_page=1&size=medium`,
        { headers: { Authorization: PEXELS_KEY } }
      );
      if (!res.ok) return null;
      const d = await res.json();
      const photo = d.photos?.[0];
      if (!photo) return null;
      return {
        url: photo.src?.large,
        alt: `${verb} auf ${LANG_META[lang]?.name} konjugieren — ${photo.alt || meaning}`,
        authorName: photo.photographer,
        authorUrl: photo.photographer_url,
        sourceUrl: photo.url,
        sourceName: 'Pexels',
      };
    } catch { return null; }
  }

  // Fallback: Unsplash
  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return {
      url: d.urls?.regular,
      alt: `${verb} auf ${LANG_META[lang]?.name} konjugieren — ${d.alt_description || meaning}`,
      authorName: d.user?.name,
      authorUrl: d.user?.links?.html + '?utm_source=conjuexpert&utm_medium=referral',
      sourceUrl: d.links?.html + '?utm_source=conjuexpert&utm_medium=referral',
      sourceName: 'Unsplash',
    };
  } catch { return null; }
}

function parseJSON(raw) {
  const m = raw?.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

// ── Content generation ───────────────────────────────────────────────────────

async function getMeaning(lang, verb, trans) {
  // Use existing translation if available
  const existing = trans[lang]?.[verb];
  if (existing) {
    // Convert "to speak" → "sprechen" via simple mapping or keep as-is
    return existing;
  }
  // Fall back to AI
  const raw = await ai(`What does the ${LANG_META[lang].native} verb "${verb}" mean? Reply with ONLY the English meaning, starting with "to ", max 5 words, no punctuation.`);
  return raw.trim();
}

async function generateExamples(lang, verb, meaning, tenses) {
  const meta = LANG_META[lang];
  const tenseList = tenses.slice(0, 4).join(', ');
  const prompt = `You are creating language-learning content for the verb "${verb}" in ${meta.native} (meaning: "${meaning}").
Generate 2 short, natural example sentences for each of these tenses: ${tenseList}.
Each sentence should be max 10 words. Also provide a German translation for each.
Reply with ONLY minified JSON, no other text:
{"${tenses[0]}":[{"s":"sentence","t":"German translation"},{"s":"sentence2","t":"German translation2"}],"${tenses[1]}":[...],...}`;

  const raw = await ai(prompt);
  return parseJSON(raw) || {};
}

async function generateStory(lang, verb, meaning) {
  const meta = LANG_META[lang];
  const prompt = `Write a short, vivid story (5–6 sentences, ~100 words) in ${meta.native} that naturally uses the verb "${verb}" (= "${meaning}") multiple times across different tenses. Make it engaging and realistic — like a slice of everyday life.
Then provide the German translation.
Reply with ONLY minified JSON: {"story":"...","translation":"..."}`;

  const raw = await ai(prompt);
  return parseJSON(raw) || null;
}

// ── HTML renderer ────────────────────────────────────────────────────────────

function conjugationTableHTML(tense, pronouns) {
  if (!tense?.forms?.length) return '';
  const rows = tense.forms.map((form, i) => {
    const pron = pronouns[i] || '';
    const isHighlighted = tense.reg && form !== tense.reg[i];
    return `<tr><td class="pron">${pron}</td><td class="${isHighlighted ? 'irr' : ''}">${form || '—'}</td></tr>`;
  }).join('');
  return `<div class="tense-block">
  <h3 class="tense-label">${tense.label}</h3>
  <table class="conj-table"><tbody>${rows}</tbody></table>
</div>`;
}

function examplesHTML(examples, tenses, tenseLabels) {
  const blocks = tenses.filter(tid => examples[tid]?.length).map(tid => {
    const label = tenseLabels[tid] || tid;
    const sentences = examples[tid].map(ex =>
      `<li class="ex-item"><span class="ex-tgt">${ex.s}</span><span class="ex-de">${ex.t}</span></li>`
    ).join('');
    return `<div class="ex-tense"><span class="ex-tense-label">${label}</span><ul>${sentences}</ul></div>`;
  }).join('');
  return blocks;
}

function renderPage({ lang, verb, eng, conjugated, examples, story, meaning, heroImage }) {
  const meta = LANG_META[lang];
  const isIrr = (eng.irregulars || []).includes(verb);
  const pronouns = conjugated.pronouns || meta.pronLabel;
  const tenses = conjugated.tenses || [];

  // Build conjugation tables for main tenses only
  const mainTenseIds = new Set(meta.mainTenses);
  const mainTenses = tenses.filter(t => mainTenseIds.has(t.id));
  const allTenses = tenses;

  const tenseLabels = {};
  tenses.forEach(t => { tenseLabels[t.id] = t.label; });

  const conjTablesMain = mainTenses.map(t => conjugationTableHTML(t, pronouns)).join('');
  const conjTablesAll = allTenses.map(t => conjugationTableHTML(t, pronouns)).join('');

  const verbType = isIrr ? 'unregelmäßiges' : 'regelmäßiges';
  const verbTypeEn = isIrr ? 'irregular' : 'regular';
  const ctaUrl = `${SITE}/?utm_source=seo&utm_medium=verb-page&utm_content=${lang}-${verb}`;

  const exHtml = examplesHTML(examples, meta.mainTenses, tenseLabels);
  const hasExamples = exHtml.trim().length > 0;

  const storyHtml = story ? `
<section class="story-section">
  <h2>Geschichte mit „${verb}"</h2>
  <div class="story-wrap">
    <div class="story-text">${story.story}</div>
    <div class="story-trans">${story.translation}</div>
  </div>
</section>` : '';

  const heroImgHtml = heroImage ? `
<figure class="hero-img">
  <img src="${heroImage.url}"
       alt="${verb} auf ${meta.name} konjugieren — ${meaning} (${verbType} Verb)"
       title="${verb} ${meta.name} konjugieren — alle Zeitformen"
       loading="lazy" width="760" height="420">
  <figcaption>Foto von <a href="${heroImage.authorUrl}" target="_blank" rel="noopener">${heroImage.authorName}</a> auf <a href="${heroImage.sourceUrl}" target="_blank" rel="noopener">${heroImage.sourceName}</a></figcaption>
</figure>` : '';

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${verb} ${meta.name} konjugieren — alle Zeitformen`,
    "description": `Vollständige Konjugationstabelle für „${verb}" auf ${meta.name} (${verbTypeEn}). Alle Zeitformen mit Beispielsätzen und Geschichte.`,
    "url": `${SITE}/konjugation/${lang}/${verb}/`,
    "inLanguage": "de",
    "image": heroImage?.url || null,
    "publisher": { "@type": "Organization", "name": "ConjuExpert", "url": SITE }
  });

  const breadcrumbLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "ConjuExpert", "item": `${SITE}/` },
      { "@type": "ListItem", "position": 2, "name": meta.name, "item": `${SITE}/konjugation/${lang}/` },
      { "@type": "ListItem", "position": 3, "name": verb, "item": `${SITE}/konjugation/${lang}/${verb}/` }
    ]
  });

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${verb} ${meta.name} konjugieren — alle Zeitformen | ConjuExpert</title>
<meta name="description" content="Konjugation von „${verb}" auf ${meta.name}: alle Zeitformen auf einen Blick, Beispielsätze und eine Geschichte zum Merken. ${verbType} Verb.">
<link rel="canonical" href="${SITE}/konjugation/${lang}/${verb}/">
<meta property="og:title" content="${verb} (${meta.name}) — alle Zeitformen">
<meta property="og:description" content="Vollständige Konjugationstabelle + Beispielsätze + Geschichte für „${verb}".">
<meta property="og:url" content="${SITE}/konjugation/${lang}/${verb}/">
<meta property="og:site_name" content="ConjuExpert">
<script type="application/ld+json">${jsonLd}</script>
<script type="application/ld+json">${breadcrumbLd}</script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
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

  /* Nav */
  .site-nav { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 20px; display: flex; align-items: center; justify-content: space-between; height: 54px; position: sticky; top: 0; z-index: 10; }
  .nav-logo { font-family: var(--display); font-weight: 800; font-size: 17px; letter-spacing: -.02em; color: var(--text); }
  .nav-logo span { color: #e71583; }
  .nav-cta { background: var(--accent); color: #fff; padding: 7px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; }
  .nav-cta:hover { text-decoration: none; background: #0070e0; }

  /* Page layout */
  .page-wrap { max-width: 760px; margin: 0 auto; padding: 32px 20px 64px; }

  /* Hero */
  .verb-hero { margin-bottom: 36px; }
  .verb-flag { font-size: 28px; margin-bottom: 8px; }
  .verb-hero h1 { font-family: var(--display); font-weight: 800; font-size: clamp(26px,5vw,38px); letter-spacing: -.03em; line-height: 1.15; margin-bottom: 12px; }
  .verb-hero h1 em { font-style: normal; color: var(--accent); }
  .verb-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
  .badge-irr { background: #fff0f3; color: var(--irr); border: 1px solid #ffd0d8; }
  .badge-reg { background: #f0fff4; color: #1a7f37; border: 1px solid #b7efc5; }
  .badge-lang { background: #f0f4ff; color: var(--accent); border: 1px solid #c7d7ff; }
  .verb-intro { color: var(--muted); font-size: 15px; line-height: 1.6; }

  /* CTA top */
  .cta-top { display: block; margin: 24px 0; padding: 18px 24px; border-radius: var(--radius); position: relative; overflow: hidden; color: #fff; font-family: var(--display); font-weight: 800; font-size: 16px; text-align: center; letter-spacing: -.01em; -webkit-font-smoothing: antialiased; box-shadow: 0 8px 24px -8px rgba(120,40,200,.5); transition: transform .14s, box-shadow .14s; }
  .cta-top::before { content: ""; position: absolute; inset: 0; background: linear-gradient(100deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff); background-size: 240% 100%; animation: gslide 5s linear infinite; }
  .cta-top span { position: relative; z-index: 2; }
  .cta-top:hover { text-decoration: none; transform: scale(1.01); box-shadow: 0 12px 32px -8px rgba(120,40,200,.6); }
  .cta-top:active { transform: scale(.98); }
  @keyframes gslide { 0%{background-position:0% 50%} 100%{background-position:240% 50%} }

  /* Section headings */
  section { margin-bottom: 40px; }
  section h2 { font-family: var(--display); font-weight: 700; font-size: 22px; letter-spacing: -.02em; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid var(--border); }

  /* Conjugation tables */
  .tense-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .tense-block { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 18px; box-shadow: var(--shadow); }
  .tense-label { font-family: var(--display); font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); margin-bottom: 12px; }
  .conj-table { width: 100%; border-collapse: collapse; }
  .conj-table td { padding: 5px 0; font-size: 15px; }
  .conj-table .pron { color: var(--muted); font-size: 13px; width: 45%; }
  .conj-table .irr { color: var(--irr); font-weight: 700; }

  /* All tenses toggle */
  .all-tenses-wrap details summary { cursor: pointer; font-weight: 700; font-size: 15px; color: var(--accent); padding: 12px 0; list-style: none; }
  .all-tenses-wrap details summary::-webkit-details-marker { display: none; }
  .all-tenses-wrap details summary::before { content: "▶ "; font-size: 11px; transition: transform .2s; }
  .all-tenses-wrap details[open] summary::before { content: "▼ "; }

  /* Examples */
  .ex-tense { margin-bottom: 24px; }
  .ex-tense-label { display: inline-block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--accent); background: #f0f4ff; border-radius: 6px; padding: 3px 10px; margin-bottom: 12px; }
  .ex-tense ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .ex-item { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; box-shadow: var(--shadow); }
  .ex-tgt { display: block; font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .ex-de { display: block; font-size: 13px; color: var(--muted); }

  /* Story */
  .story-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
  .story-text { padding: 20px 22px; font-size: 15px; line-height: 1.75; border-bottom: 1px solid var(--border); }
  .story-trans { padding: 16px 22px; font-size: 14px; color: var(--muted); line-height: 1.7; }
  .story-trans::before { content: "🇩🇪 "; }

  /* CTA bottom */
  .cta-bottom { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px 24px; text-align: center; box-shadow: var(--shadow); }
  .cta-bottom h3 { font-family: var(--display); font-weight: 800; font-size: 20px; letter-spacing: -.02em; margin-bottom: 8px; }
  .cta-bottom p { color: var(--muted); font-size: 14px; margin-bottom: 20px; }
  .cta-btn-big { display: inline-block; padding: 16px 32px; border-radius: 14px; position: relative; overflow: hidden; color: #fff; font-family: var(--display); font-weight: 800; font-size: 17px; letter-spacing: -.01em; -webkit-font-smoothing: antialiased; box-shadow: 0 10px 28px -8px rgba(120,40,200,.55); transition: transform .14s; }
  .cta-btn-big::before { content: ""; position: absolute; inset: 0; background: linear-gradient(100deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff); background-size: 240% 100%; animation: gslide 5s linear infinite; }
  .cta-btn-big span { position: relative; z-index: 2; }
  .cta-btn-big:hover { text-decoration: none; transform: scale(1.02); }
  .cta-btn-big:active { transform: scale(.97); }
  .cta-sub { display: block; margin-top: 12px; font-size: 13px; color: var(--muted); }

  /* Breadcrumb */
  .breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
  .breadcrumb a { color: var(--muted); }
  .breadcrumb a:hover { color: var(--accent); }

  /* Footer */
  .site-footer { text-align: center; padding: 24px 20px; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); margin-top: 40px; }
  .site-footer a { color: var(--muted); }

  /* Hero image */
  .hero-img { margin: 0 0 24px; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
  .hero-img img { width: 100%; height: 260px; object-fit: cover; display: block; }
  .hero-img figcaption { font-size: 11px; color: var(--muted); padding: 6px 12px; background: var(--surface); text-align: right; }
  .hero-img figcaption a { color: var(--muted); }

  @media (max-width: 480px) {
    .tense-grid { grid-template-columns: 1fr; }
    .page-wrap { padding: 20px 16px 48px; }
  }
</style>
</head>
<body>

<nav class="site-nav">
  <a class="nav-logo" href="${SITE}/">Conju<span>Expert</span></a>
  <a class="nav-cta" href="${ctaUrl}">App öffnen →</a>
</nav>

<main class="page-wrap">

  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="${SITE}/">ConjuExpert</a> › <a href="${SITE}/konjugation/${lang}/">${meta.name}</a> › ${verb}
  </nav>

  <div class="verb-hero">
    <div class="verb-flag">${meta.flag}</div>
    <h1><em>${verb}</em> auf ${meta.name} konjugieren</h1>
    <div class="verb-meta">
      <span class="badge badge-lang">${meta.name}</span>
      <span class="badge ${isIrr ? 'badge-irr' : 'badge-reg'}">${isIrr ? '⚡ unregelmäßig' : '✓ regelmäßig'}</span>
    </div>
    <p class="verb-intro">
      <strong>${verb}</strong> bedeutet „${meaning}" und ist ein ${verbType} ${meta.native}-Verb.
      Hier findest du alle Zeitformen, natürliche Beispielsätze und eine kurze Geschichte — perfekt zum Lernen und Merken.
    </p>
  </div>

  ${heroImgHtml}

  <a class="cta-top" href="${ctaUrl}">
    <span>🎯 „${verb}" jetzt im Quiz üben — kostenlos →</span>
  </a>

  <section>
    <h2>Konjugationstabelle — die wichtigsten Zeitformen</h2>
    <div class="tense-grid">
      ${conjTablesMain}
    </div>
    ${allTenses.length > mainTenses.length ? `
    <div class="all-tenses-wrap" style="margin-top:20px">
      <details>
        <summary>Alle ${allTenses.length} Zeitformen anzeigen</summary>
        <div class="tense-grid" style="margin-top:16px">${conjTablesAll}</div>
      </details>
    </div>` : ''}
  </section>

  ${hasExamples ? `
  <section>
    <h2>Beispielsätze mit „${verb}"</h2>
    ${exHtml}
  </section>` : ''}

  ${storyHtml}

  <section class="cta-bottom">
    <h3>„${verb}" direkt im Quiz üben</h3>
    <p>Alle 5 Sprachen · alle Zeitformen · KI-Beispielsätze · kostenlos starten</p>
    <a class="cta-btn-big" href="${ctaUrl}">
      <span>ConjuExpert öffnen →</span>
    </a>
    <span class="cta-sub">Kein Download · keine Anmeldung nötig</span>
  </section>

</main>

<footer class="site-footer">
  <p>© ConjuExpert · <a href="${SITE}/landing/">Über uns</a> · <a href="${SITE}/agb.html">AGB</a> · <a href="${SITE}/datenschutz.html">Datenschutz</a> · <a href="${SITE}/impressum.html">Impressum</a> · <a href="${SITE}/barrierefreiheit.html">Barrierefreiheit</a></p>
</footer>

</body>
</html>`;
}

// ── Sitemap update ────────────────────────────────────────────────────────────

function updateSitemap(newUrls) {
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  let xml = fs.readFileSync(sitemapPath, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const entries = newUrls.map(u => `
  <url>
    <loc>${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');
  xml = xml.replace('</urlset>', entries + '\n</urlset>');
  fs.writeFileSync(sitemapPath, xml);
}

// ── Reflexive (ES) + gezielte Einzel-Verben ─────────────────────────────────
const REFL_PRON = ['me', 'te', 'se', 'nos', 'os', 'se'];
function isReflexiveEs(lang, verb) { return lang === 'es' && /(a|e|i)rse$/.test(verb); }
// Reflexiv: Basisverb konjugieren, Proklitik-Pronomen vor JEDE Form (auch
// zusammengesetzte: „me he levantado", „me estoy levantando"). Imperativ raus —
// der hängt enklitisch an („¡levántate!"), Sonderfall; lieber weglassen als falsch.
function conjugateVerb(eng, lang, verb) {
  if (!isReflexiveEs(lang, verb)) return eng.conjugate(verb);
  const c = eng.conjugate(verb.slice(0, -2));
  if (!c || c.error) return c;
  const pre = (arr) => (arr ? arr.map((f, i) => (f ? `${REFL_PRON[i]} ${f}` : f)) : arr);
  const tenses = (c.tenses || [])
    .filter((t) => t.id !== 'imperative')
    .map((t) => ({ ...t, forms: pre(t.forms), reg: pre(t.reg) }));
  return { ...c, tenses };
}
// Gezielte Generierung: ONLY_VERBS="es:levantarse,es:llamarse" ignoriert die Queue.
const ONLY_VERBS = (process.env.ONLY_VERBS || '')
  .split(',').map((s) => s.trim()).filter(Boolean)
  .map((s) => { const [lang, verb] = s.split(':'); return { lang, verb }; });

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const engines = {};
  for (const lang of Object.keys(LANG_META)) {
    engines[lang] = loadEngine(lang);
  }
  const trans = loadTrans();

  const queue = loadQueue(engines);
  if (queue.length === 0 && !ONLY_VERBS.length) {
    console.log('✅ Queue empty — all pages already generated.');
    return;
  }

  const batch = ONLY_VERBS.length ? ONLY_VERBS : queue.splice(0, PER_RUN);
  console.log(`Generating ${batch.length} pages${ONLY_VERBS.length ? ' (ONLY_VERBS)' : ` (${queue.length} remaining after this run)`}…\n`);

  const newUrls = [];
  const failed = [];

  for (const { lang, verb } of batch) {
    console.log(`▶ ${lang}/${verb}`);
    try {
      const eng = engines[lang];
      const conjugated = conjugateVerb(eng, lang, verb);
      if (!conjugated || conjugated.error) {
        console.log(`  ✗ Conjugation failed: ${conjugated?.error || 'unknown'}`);
        failed.push({ lang, verb });
        continue;
      }

      const meaning = await getMeaning(lang, verb, trans);
      console.log(`  meaning: "${meaning}"`);

      const mainTenseIds = LANG_META[lang].mainTenses;
      const [examples, story, heroImage] = await Promise.all([
        generateExamples(lang, verb, meaning, mainTenseIds),
        generateStory(lang, verb, meaning),
        fetchHeroImage(verb, meaning, lang),
      ]);

      console.log(`  examples: ${Object.keys(examples).length} tenses, story: ${story ? 'yes' : 'none'}`);

      const html = renderPage({ lang, verb, eng, conjugated, examples, story, meaning, heroImage });

      const outDir = path.join(ROOT, 'konjugation', lang, verb);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html);

      newUrls.push(`${SITE}/konjugation/${lang}/${verb}/`);
      console.log(`  ✓ saved to konjugation/${lang}/${verb}/index.html`);
    } catch (e) {
      console.error(`  ✗ Error: ${e.message}`);
      failed.push({ lang, verb });
    }
  }

  // Put failed ones back at end of queue (nicht im gezielten ONLY_VERBS-Modus).
  if (!ONLY_VERBS.length) {
    queue.push(...failed);
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  }

  if (newUrls.length > 0) {
    updateSitemap(newUrls);
    console.log(`\n✅ ${newUrls.length} pages generated, sitemap updated.`);
  }
  console.log(`📋 ${queue.length} pages still in queue.`);
}

main().catch(e => { console.error(e); process.exit(1); });
