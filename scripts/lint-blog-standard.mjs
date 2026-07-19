#!/usr/bin/env node
/**
 * lint-blog-standard.mjs
 *
 * Fährt den Gold-Standard-Linter über ALLE live ausgelieferten Blog-Artikel
 * (blog/<slug>/index.html) — ohne Notion, rein aus dem Repo. Damit lässt sich
 * der Bestand einmalig prüfen UND nächtlich überwachen (Report + Exit-Code).
 *
 *   node scripts/lint-blog-standard.mjs            # Report, Exit 1 bei harten Fehlern
 *   node scripts/lint-blog-standard.mjs --warn     # auch Warnungen listen
 *   node scripts/lint-blog-standard.mjs --json      # maschinenlesbar
 *
 * Handgepflegte Seiten (PROTECTED) werden markiert, aber mitgeprüft.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { lintRenderedHtml, hardErrors } from "./lib/standard-lint.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BLOG = join(ROOT, "blog");
const ARGS = process.argv.slice(2);
const SHOW_WARN = ARGS.includes("--warn");
const AS_JSON = ARGS.includes("--json");

function listArticleHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    const idx = join(p, "index.html");
    if (existsSync(idx)) out.push({ slug: `/blog/${name}/`, file: idx });
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}

if (!existsSync(BLOG)) {
  console.error("Kein blog/-Verzeichnis gefunden.");
  process.exit(2);
}

const articles = listArticleHtml(BLOG);
const results = [];
for (const a of articles) {
  const html = readFileSync(a.file, "utf8");
  const findings = lintRenderedHtml(html);
  results.push({ slug: a.slug, findings });
}

if (AS_JSON) {
  console.log(JSON.stringify(results, null, 2));
} else {
  let nErr = 0, nWarnArticles = 0;
  for (const r of results) {
    const errs = r.findings.filter((f) => f.level === "error");
    const warns = r.findings.filter((f) => f.level === "warn");
    nErr += errs.length;
    if (warns.length) nWarnArticles++;
    if (errs.length === 0 && (!SHOW_WARN || warns.length === 0)) continue;
    const mark = errs.length ? "❌" : "⚠️ ";
    console.log(`\n${mark} ${r.slug}`);
    for (const e of errs) console.log(`   ERROR  ${e.code}: ${e.msg}`);
    if (SHOW_WARN) for (const w of warns) console.log(`   warn   ${w.code}: ${w.msg}`);
  }
  const withErr = results.filter((r) => hardErrors(r.findings).length).length;
  console.log(
    `\n— Gold-Standard-Audit: ${results.length} Live-Artikel · ` +
    `${withErr} mit harten Fehlern · ${nWarnArticles} mit Warnungen —`
  );
}

const anyHard = results.some((r) => hardErrors(r.findings).length);
process.exit(anyHard ? 1 : 0);
