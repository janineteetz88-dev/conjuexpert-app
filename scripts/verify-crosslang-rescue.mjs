// Verify the "sein in NL" fix: extract the real deconjugate/conceptFromAny/verbPool
// from app.js, run them, and confirm the new ordering rescues to "zijn".
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runInNewContext } from 'vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8').split('\n');
const slice = (a, b) => app.slice(a - 1, b).join('\n'); // 1-indexed inclusive

const src = [
  slice(3844, 3846),   // deburr
  slice(3847, 3849),   // infBase
  slice(3854, 3888),   // EXTRA_VERBS 1..4
  slice(3889, 3904),   // verbPool
  slice(4010, 4016),   // INF_SUF
  slice(4021, 4065),   // ruleCandidates
  slice(4069, 4091),   // pruneGuess
  slice(4092, 4222),   // deconjugate
  slice(4304, 4304),   // CONCEPTS
  slice(4305, 4311),   // _LIDX
  slice(4325, 4339),   // conceptFromAny
  slice(5931, 5933),   // norm
].join('\n\n');

// Context: window.CONJ (engines) + window.TRANS + tr() stub
const ctx = { window: { CONJ: {}, TRANS: {} }, console };
for (const l of ['de','es','en','fr','nl']) {
  const es = fs.readFileSync(path.join(ROOT, `engine/conj-${l}.js`), 'utf8');
  runInNewContext(es, ctx);
}
const trSrc = fs.readFileSync(path.join(ROOT, 'engine/translations.js'), 'utf8');
runInNewContext(trSrc, ctx);
ctx.tr = k => k;

runInNewContext(src + `
globalThis.__deconjugate = deconjugate;
globalThis.__conceptFromAny = conceptFromAny;
globalThis.__verbPool = verbPool;
globalThis.__isKnown = raw => verbPool('nl').indexOf(raw.trim().toLowerCase()) >= 0;
`, ctx);

// Replicate onConjugate's decision path (NEW ordering) for a given input in NL.
function decide(raw, lang) {
  raw = raw.trim();
  if (ctx.window.CONJ[lang].samples && false) {}
  // 1) known infinitive?
  const known = ctx.__verbPool(lang).indexOf(raw.toLowerCase()) >= 0;
  if (known) return { branch: '1-known-infinitive', result: raw.toLowerCase() };
  // 2) solid deconjugation?
  const dq = ctx.__deconjugate(lang, raw);
  if (dq && !dq.guessed) return { branch: '2-solid-deconj', result: dq.infinitives[0].base };
  // 2.5) cross-language rescue?
  const xl = ctx.__conceptFromAny(raw, lang);
  if (xl && xl.base !== raw.toLowerCase()) return { branch: '2.5-rescue', result: xl.base, from: xl.fromLang, guessedWas: !!(dq && dq.guessed) };
  // 2.6) guessed deconjugation?
  if (dq) return { branch: '2.6-guessed-deconj', result: dq.infinitives[0].base };
  // 3) fallback
  return { branch: '3-fallback-guess', result: raw.toLowerCase() };
}

console.log('\n=== NL mode ===');
for (const w of ['sein','haben','gehen','sprechen','zijn','ging','werken','loop','fiets']) {
  const dq = ctx.__deconjugate('nl', w);
  const d = decide(w, 'nl');
  console.log(`  ${w.padEnd(10)} → ${d.branch.padEnd(22)} ⇒ "${d.result}"${d.from?` (from ${d.from})`:''}   [deconj:${dq?(dq.guessed?'guessed':'solid'):'null'}]`);
}
console.log('\n=== ES mode (gehen→ir, haben→tener) ===');
for (const w of ['gehen','haben','trabajar','fui']) {
  const d = decide(w, 'es');
  console.log(`  ${w.padEnd(10)} → ${d.branch.padEnd(22)} ⇒ "${d.result}"${d.from?` (from ${d.from})`:''}`);
}
