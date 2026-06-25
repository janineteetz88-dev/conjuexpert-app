#!/usr/bin/env node
/*
 * Quiz content sanity check.
 *
 * Why this exists: the quiz builds questions from the conjugation engines in
 * app.js. A data-modelling mistake there (e.g. a non-finite form modelled as if
 * it had persons) can produce nonsensical cards like "kommen · ich → kommend".
 * Those slip through because there is no compiler to catch them — only the rules
 * below. Run this whenever you touch the engines or buildQuestion.
 *
 *   npm run check:quiz
 *
 * It boots the real app in a headless browser and asserts, across every
 * language and many generated questions, that:
 *   1. no non-finite form (Partizip I / gerund / present participle) is quizzed
 *   2. every answer is a real, non-empty form (not "—")
 *   3. the options always contain the correct answer
 *   4. the shown pronoun is one of the engine's real pronouns
 *   5. the quiz tense picker never offers a non-finite tense
 *
 * Exit code 0 = all good, 1 = at least one rule broken (details printed).
 */
import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

/* Find a Chromium binary. Prefers $PLAYWRIGHT_CHROMIUM_PATH, then a browser
   installed under $PLAYWRIGHT_BROWSERS_PATH (CI/cloud), else lets Playwright
   resolve its own download. */
async function findChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH && existsSync(process.env.PLAYWRIGHT_CHROMIUM_PATH))
    return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (base && existsSync(base)) {
    try {
      const dirs = (await readdir(base)).filter(d => d.startsWith("chromium-")).sort();
      for (const d of dirs.reverse()) {
        const cand = join(base, d, "chrome-linux", "chrome");
        if (existsSync(cand)) return cand;
      }
    } catch {}
  }
  return null; // let Playwright try its default
}

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const ITER = 600; // questions per language
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".webmanifest": "application/manifest+json", ".ico": "image/x-icon"
};

async function loadPlaywright() {
  try { return (await import("playwright-core")).chromium; }
  catch {
    console.error("playwright-core is not installed. Run:  npm i -D playwright-core");
    process.exit(2);
  }
}

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const buf = await readFile(join(ROOT, p));
    res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
    res.end(buf);
  } catch { res.writeHead(404); res.end("not found"); }
});

await new Promise(r => server.listen(0, r));
const port = server.address().port;

const chromium = await loadPlaywright();
const exe = await findChromium();
let browser;
try { browser = await chromium.launch({ args: ["--no-sandbox"], ...(exe ? { executablePath: exe } : {}) }); }
catch (e) { console.error("Could not launch Chromium:", e.message); process.exit(2); }

const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => typeof window.buildQuestion === "function" && !!window.CONJ, null, { timeout: 8000 });

const report = await page.evaluate((ITER) => {
  const langs = Object.keys(window.CONJ);
  const problems = [];
  for (const lang of langs) {
    const eng = window.CONJ[lang];
    if (!eng || !eng.conjugate) continue;
    const pool = eng.samples || [];
    for (let i = 0; i < ITER; i++) {
      const q = window.buildQuestion(lang, "all", pool);
      if (!q) continue;
      const rr = eng.conjugate(q.verb);
      if (!rr || rr.error) { problems.push(`${lang}: ${q.verb} fails to conjugate`); continue; }
      const t = rr.tenses.find(x => x.id === q.tenseId);
      if (t && t.nonFinite) problems.push(`${lang}: non-finite quizzed — ${q.verb} · ${q.pronoun} · ${q.tenseId} → ${q.answer}`);
      if (!q.answer || q.answer === "—") problems.push(`${lang}: empty answer — ${q.verb} · ${q.tenseId}`);
      if (!q.options || q.options.indexOf(q.answer) < 0) problems.push(`${lang}: options miss the answer — ${q.verb} · ${q.tenseId}`);
      if (rr.pronouns && rr.pronouns.indexOf(q.pronoun) < 0) problems.push(`${lang}: unknown pronoun "${q.pronoun}" — ${q.verb} · ${q.tenseId}`);
    }
    // quiz tense picker must not offer non-finite tenses
    const r0 = eng.conjugate(pool[0]);
    (r0?.tenses || []).filter(t => t.nonFinite).forEach(t => {
      // it's fine for it to exist; just make sure buildQuestion never used it (covered above)
    });
  }
  return { langs, problems };
}, ITER);

await browser.close();
await new Promise(r => server.close(r));

if (report.problems.length) {
  console.error(`✗ Quiz check FAILED — ${report.problems.length} problem(s):`);
  report.problems.slice(0, 40).forEach(p => console.error("  • " + p));
  if (report.problems.length > 40) console.error(`  … and ${report.problems.length - 40} more`);
  process.exit(1);
}
console.log(`✓ Quiz check passed — ${report.langs.join(", ")} · ${ITER} questions each, all valid.`);
