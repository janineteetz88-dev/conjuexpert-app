#!/usr/bin/env node
/*
 * Seed the shared Texte story library (Supabase: public.texte_stories)
 * ------------------------------------------------------------------
 * Pre-generates stories for the most common combinations so real users
 * almost never wait for a cold generation. Uses the SAME generation logic
 * as the app (prose batches + comprehension questions) and writes rows via
 * the Supabase REST API. No npm install needed — Node 18+ (global fetch).
 *
 * USAGE
 *   node scripts/seed-texte-stories.mjs
 *
 * Start small to check cost/quality first, e.g. one language, one level,
 * a couple of topics, 1 variant, max 3 combos this run:
 *   SEED_LANGS=es SEED_LEVELS=beginner SEED_TOPICS=random,doctor \
 *   SEED_TARGET=1 SEED_LIMIT=3 node scripts/seed-texte-stories.mjs
 *
 * ENV OVERRIDES (all optional)
 *   SEED_LANGS    comma list   default: es,de,en,nl,fr
 *   SEED_LEVELS   comma list   default: beginner,intermediate,advanced
 *   SEED_TOPICS   comma list   default: random,shopping,doctor,family,travel,restaurant,work,freetime
 *   SEED_TENSES   comma list   default: mix            (only "mix" is fully supported)
 *   SEED_NATIVE   string       default: German         (language of translations + questions)
 *   SEED_TARGET   number       default: 3              (variants to ensure per combo)
 *   SEED_LIMIT    number       default: 0 (= no limit) (max combos to touch this run)
 *   WORKER_URL    required     Cloudflare Worker AI proxy URL (no default — ask Hans/Janine)
 *   SUPA_URL, SUPA_KEY              (defaults match the app)
 *
 * NOTE ON COST: every story = a few AI calls through your Cloudflare Worker
 *   (→ OpenAI). This is a ONE-TIME cost. Estimate before a big run:
 *   combos × SEED_TARGET × ~4 calls. Run a small subset first.
 *
 * NOTE ON LANGUAGE: stories are target-language only (the app translates
 *   them per user, on demand). Only the comprehension QUESTIONS are written
 *   in SEED_NATIVE (default German). Seed with your main audience's native
 *   language.
 */

const WORKER   = process.env.WORKER_URL || "https://bitter-bird-3204.janine-teetz88.workers.dev";
const SUPA_URL = process.env.SUPA_URL   || 'https://lrhmyboevoxtlvoxnrny.supabase.co';
const SUPA_KEY = process.env.SUPA_KEY   || 'sb_publishable_HJMTA3em7L69hzbQrwgwOA_WsYgyN3P';

if (!WORKER) { console.error('WORKER_URL env var is required (Cloudflare Worker AI proxy URL).'); process.exit(1); }

const LANGS  = (process.env.SEED_LANGS  || 'es,de,en,nl,fr').split(',').map(s => s.trim()).filter(Boolean);
const LEVELS = (process.env.SEED_LEVELS || 'beginner,intermediate,advanced').split(',').map(s => s.trim()).filter(Boolean);
const TOPICS = (process.env.SEED_TOPICS || 'random,shopping,doctor,family,travel,restaurant,work,freetime').split(',').map(s => s.trim()).filter(Boolean);
const TENSES = (process.env.SEED_TENSES || 'mix').split(',').map(s => s.trim()).filter(Boolean);
const NATIVE = process.env.SEED_NATIVE || 'German';
const TARGET = parseInt(process.env.SEED_TARGET || '3', 10);
const LIMIT  = parseInt(process.env.SEED_LIMIT  || '0', 10);

const LANG_NAMES = { es: 'Spanish', de: 'German', en: 'English', nl: 'Dutch', fr: 'French' };
const SENT_TOPICS = ['food and drink', 'travel', 'family and friends', 'work or study', 'the weather', 'hobbies', 'shopping', 'animals and pets', 'sports', 'music or films', 'a daily routine', 'weekend plans', 'health', 'technology', 'the city', 'nature', 'holidays', 'cooking', 'the morning', 'a phone call'];
const THEME_TOPIC = {
  shopping: 'shopping and stores',
  office: 'an official or government appointment (bureaucracy)',
  doctor: 'a doctor, pharmacy or health situation',
  family: 'family, kids and home life',
  travel: 'travelling, trains and asking directions',
  restaurant: 'a restaurant, café or ordering food',
  work: 'work, office and appointments',
  freetime: 'free time, hobbies and sport',
  sport: 'sport, exercise and the gym',
  pregnancy: 'pregnancy, baby and expecting a child',
  finance: 'finance, money, banking and the economy'
};
const ADV_CONN = {
  es: 'aunque, a pesar de que, mientras, puesto que, sin embargo, de modo que, no obstante',
  de: 'obwohl, während, da, sodass, dennoch, wohingegen, indessen',
  fr: 'bien que, quoique, tandis que, puisque, néanmoins, de sorte que',
  nl: 'hoewel, terwijl, aangezien, zodat, niettemin, ofschoon',
  en: 'although, while, since, so that, nevertheless, whereas'
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const enc = encodeURIComponent;
const SB_HEADERS = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` };

if (typeof fetch !== 'function') { console.error('Need Node 18+ (global fetch).'); process.exit(1); }

async function aiComplete(prompt, attempt = 0) {
  const resp = await fetch(WORKER, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
  const d = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    if (resp.status === 429 && attempt < 5) { await sleep(3000 * (attempt + 1)); return aiComplete(prompt, attempt + 1); }
    throw new Error((d.error && d.error.message) || ('AI error ' + resp.status));
  }
  return d.text || '';
}

// tolerant JSON-array parser (mirrors the app's parseArr): survives truncation / inner quotes
function parseArr(txt) {
  let s = String(txt || '').replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const a = s.indexOf('[');
  if (a >= 0) s = s.slice(a);
  const b = s.lastIndexOf(']');
  try { const j = JSON.parse(b > 0 ? s.slice(0, b + 1) : s); if (Array.isArray(j) && j.length) return j; } catch (_) {}
  const out = [];
  const objRe = /\{[^{}]*\}/g; let m;
  while ((m = objRe.exec(s))) { try { out.push(JSON.parse(m[0])); } catch (_) {} }
  return out.length ? out : null;
}

function styleFor(level, targetName, lang) {
  if (level === 'advanced') return ` Write LITERARY, flowing C1-level ${targetName} prose: long, complex sentences with subordinate, relative and concessive clauses, the subjunctive where natural, varied connectors (${ADV_CONN[lang] || ADV_CONN.en}), rich and idiomatic vocabulary, vivid sensory description and some dialogue. NEVER write short, choppy or list-like sentences — weave the ideas into elegant, varied prose.`;
  if (level === 'intermediate') return ` Write natural, everyday B1-level ${targetName} with varied sentence length, connectors and some subordinate clauses, and a real narrative flow (not isolated short sentences).`;
  return ` Write very simple A1–A2 ${targetName} with short, clear sentences and basic connectors, while still telling one coherent little story.`;
}

async function buildProse(lang, level, topicText) {
  const targetName = LANG_NAMES[lang];
  const N = level === 'advanced' ? 35 : level === 'intermediate' ? 28 : 25;
  const styleTxt = styleFor(level, targetName, lang);
  const tenseTxt = ` Use a natural mix of ${targetName} tenses.`;
  const seed = Math.floor(Math.random() * 100000);
  // advance by the sentences actually received (one big call when the worker's max_tokens is high)
  let sentences = [];
  let guard = 0;
  while (sentences.length < N && guard < 12) {
    guard++;
    const ask = Math.min(N - sentences.length, 40);
    const isFirst = sentences.length === 0;
    const isLast = sentences.length + ask >= N;
    const intro = isFirst
      ? ` This is the OPENING: establish a vivid setting, one or two named characters, and a small conflict or goal about ${topicText} that drives the plot.`
      : ` CONTINUE the same story with the SAME characters and setting; advance the plot and do NOT repeat earlier events. The story so far ends: "${sentences.slice(-3).map((s) => s.t).join(' ')}".`;
    const endTxt = isLast ? ' In these final sentences, resolve the conflict and give the story a satisfying, rounded ending.' : '';
    const prompt = `You are writing a real short story (a "Kurzgeschichte") in ${targetName}; write ${ask} more sentences now.${styleTxt}${intro}${tenseTxt}${endTxt} Keep the SAME narrative voice and tense register throughout. CRUCIAL — vary the sentence openings strongly: NEVER begin two sentences in a row with the same word or with the subject's name; open different sentences with time or place adverbials, subordinate or participial clauses, prepositional phrases, direct speech, or an object — and refer to the protagonist mostly with pronouns or epithets instead of repeating the name. Vary sentence length, rhythm and structure, and do NOT mirror the structure of the previous sentences. Variety seed ${seed}+${sentences.length}. Do NOT use any double-quote (") character inside any sentence. Reply with ONLY a minified JSON array and nothing else: [{"t":"<${targetName} sentence>"}]`;
    let arr = null;
    for (let att = 0; att < 3 && !(Array.isArray(arr) && arr.length); att++) {
      if (att) await sleep(900 * att);
      try { arr = parseArr(await aiComplete(prompt)); } catch (_) { arr = null; }
    }
    const before = sentences.length;
    if (Array.isArray(arr) && arr.length) sentences = sentences.concat(arr.filter((s) => s && s.t).map((s) => ({ t: String(s.t).trim() })));
    if (sentences.length === before) { if (sentences.length) break; return null; }
  }
  return sentences.length ? sentences : null;
}

async function buildQuestions(sentences) {
  const full = sentences.map((s) => s.t).join(' ');
  const prompt = `Read this story:\n"${full}"\nWrite 3 simple reading-comprehension questions about it in ${NATIVE}, each with exactly 3 short answer options where only ONE is correct. Do NOT use double-quote characters inside any text. Reply with ONLY a minified JSON array and nothing else: [{"q":"<question in ${NATIVE}>","options":["<a>","<b>","<c>"],"answer":"<exact text of the correct option>"}]`;
  let arr = null;
  try { arr = parseArr(await aiComplete(prompt)); } catch (_) { arr = null; }
  arr = (Array.isArray(arr) ? arr : []).filter((x) => x && x.q && Array.isArray(x.options) && x.options.length && x.answer);
  return arr.length ? arr : null;
}

async function libCount(lang, topic, level, tenses) {
  const url = `${SUPA_URL}/rest/v1/texte_stories?select=id&lang=eq.${enc(lang)}&topic=eq.${enc(topic)}&level=eq.${enc(level)}&tenses=eq.${enc(tenses)}`;
  const r = await fetch(url, { headers: SB_HEADERS });
  if (!r.ok) throw new Error('Supabase select failed ' + r.status + ': ' + (await r.text()));
  const a = await r.json().catch(() => []);
  return Array.isArray(a) ? a.length : 0;
}

async function libInsert(row) {
  const r = await fetch(`${SUPA_URL}/rest/v1/texte_stories`, {
    method: 'POST',
    headers: { ...SB_HEADERS, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row)
  });
  if (!r.ok) throw new Error('Supabase insert failed ' + r.status + ': ' + (await r.text()));
}

async function main() {
  const combos = [];
  for (const lang of LANGS) {
    if (!LANG_NAMES[lang]) { console.warn('skip unknown lang', lang); continue; }
    for (const level of LEVELS) for (const topic of TOPICS) for (const tenses of TENSES) combos.push({ lang, level, topic, tenses });
  }
  console.log(`Seeding library: ${combos.length} combos · target ${TARGET} variants each · native=${NATIVE}`);
  console.log(`langs=[${LANGS}] levels=[${LEVELS}] topics=[${TOPICS}] tenses=[${TENSES}]`);
  if (LIMIT) console.log(`(this run limited to ${LIMIT} combos)`);

  let touched = 0, made = 0, failed = 0;
  for (const c of combos) {
    if (LIMIT && touched >= LIMIT) break;
    let have;
    try { have = await libCount(c.lang, c.topic, c.level, c.tenses); }
    catch (e) { console.error('count error', c, e.message); continue; }
    const need = Math.max(TARGET - have, 0);
    const tag = `${c.lang}/${c.level}/${c.topic}/${c.tenses}`;
    if (!need) { console.log(`= ${tag} (have ${have}, ok)`); continue; }
    touched++;
    console.log(`→ ${tag} (have ${have}, generating ${need})`);
    for (let v = 0; v < need; v++) {
      try {
        const topicText = c.topic === 'random' ? pick(SENT_TOPICS) : (THEME_TOPIC[c.topic] || c.topic);
        const sentences = await buildProse(c.lang, c.level, topicText);
        if (!sentences) { console.warn(`  ✗ prose failed (${tag})`); failed++; continue; }
        const questions = await buildQuestions(sentences);
        await libInsert({ lang: c.lang, topic: c.topic, level: c.level, tenses: c.tenses, sentences, questions: questions || null });
        made++;
        console.log(`  ✓ ${sentences.length} sentences, ${questions ? questions.length : 0} questions  [total made ${made}]`);
      } catch (e) {
        failed++;
        console.error(`  ✗ ${tag}:`, e.message);
      }
      await sleep(500);
    }
  }
  console.log(`\nDone. combos touched=${touched}, stories made=${made}, failures=${failed}.`);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
