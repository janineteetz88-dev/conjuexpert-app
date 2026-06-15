#!/usr/bin/env node
/**
 * sync-notion-tracker.mjs
 *
 * Gleicht live-geschaltete Blog-Artikel im Repo gegen die Notion-Datenbank
 * „Blogartikel-Tracker" ab.
 *
 * Quelle der Wahrheit: Repo (main = deployed = live)
 * Ziel: Notion-Datenbank ID f78defbe1d0543309b443fc134ad9127
 *
 * Env-Variable benötigt: NOTION_API_KEY
 *
 * Regeln:
 *   - Im Repo live, kein Notion-Eintrag  → neuen Eintrag anlegen (nach Freigabe)
 *   - Im Tracker "Veröffentlicht", nicht im Repo → Abweichung melden (nicht ändern)
 *   - Titel / URL / Datum gegenprüfen
 *
 * Aufruf: node scripts/sync-notion-tracker.mjs [--dry-run] [--create]
 *   --dry-run  : nur Abweichungen zeigen, nichts anlegen (default)
 *   --create   : fehlende Einträge in Notion anlegen
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readdirSync, existsSync } from "fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARGS = process.argv.slice(2);
const DRY_RUN = !ARGS.includes("--create");
const DB_ID = "f78defbe1d0543309b443fc134ad9127";



function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/);
  if (!m) return "";
  return m[1].replace(/\s*\|.*$/, "").trim(); // ohne " | ConjuExpert"
}

function extractDate(html) {
  const m = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  return m ? m[1] : "";
}

/* ─── Notion-Abfrage ─────────────────────────────────────────────────────── */

const NOTION_VERSION = "2022-06-28";

async function notionFetch(path, method = "GET", body = null) {
  const key = process.env.NOTION_API_KEY;
  if (!key) throw new Error("NOTION_API_KEY nicht gesetzt");
  const opts = {
    method,
    headers: {
      "Authorization": `Bearer ${key}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://api.notion.com/v1${path}`, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Notion API ${res.status}: ${txt}`);
  }
  return res.json();
}

async function getTrackerEntries() {
  const entries = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const data = await notionFetch(`/databases/${DB_ID}/query`, "POST", body);
    entries.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return entries;
}

async function ensureProperties() {
  const db = await notionFetch(`/databases/${DB_ID}`);
  const existing = Object.keys(db.properties || {});
  const toAdd = {};
  if (!existing.includes("Live-Link")) toAdd["Live-Link"] = { url: {} };
  if (!existing.includes("Notion-Quelle")) toAdd["Notion-Quelle"] = { url: {} };
  if (Object.keys(toAdd).length > 0) {
    await notionFetch(`/databases/${DB_ID}`, "PATCH", { properties: toAdd });
    console.log(`   ✓ Spalten angelegt: ${Object.keys(toAdd).join(", ")}`);
  }
}

function parseEntry(page) {
  const props = page.properties;
  return {
    id: page.id,
    title: props["Thema"]?.title?.[0]?.plain_text || props["Titel"]?.title?.[0]?.plain_text || props["Name"]?.title?.[0]?.plain_text || "",
    status: props["Status"]?.select?.name || "",
    url: props["Live-Link"]?.url || props["Link"]?.url || props["URL"]?.url || "",
    datePublished: props["Veröffentlicht am"]?.date?.start || "",
  };
}

async function createEntry(article) {
  const props = {
    "Thema": { title: [{ text: { content: article.title } }] },
    "Status": { select: { name: "Veröffentlicht" } },
    "Live-Link": { url: article.url },
  };
  if (article.datePublished) props["Veröffentlicht am"] = { date: { start: article.datePublished } };
  if (article.notionUrl) props["Notion-Quelle"] = { url: article.notionUrl };
  return notionFetch("/pages", "POST", { parent: { database_id: DB_ID }, properties: props });
}

async function updateDate(pageId, datePublished) {
  return notionFetch(`/pages/${pageId}`, "PATCH", {
    properties: {
      "Veröffentlicht am": { date: { start: datePublished } },
    },
  });
}

/* ─── Hauptlogik ─────────────────────────────────────────────────────────── */

const key = process.env.NOTION_API_KEY;
if (!key) {
  console.error("❌  NOTION_API_KEY nicht gesetzt — Sync übersprungen.");
  console.error("    export NOTION_API_KEY=secret_xxx  # in ~/.bashrc oder CI-Secrets");
  process.exit(0); // nicht blockieren
}

const repoArticles = await (async () => {
  // getRepoArticles() nutzt await import → muss self-contained async sein
  const { clusters, GLOBAL_PILLAR } = await import(
    join(ROOT, "src/data/clusters.js")
  );

  const articles = [];

  const pillarFile = join(ROOT, "blog/verben-konjugieren-lernen/index.html");
  if (existsSync(pillarFile)) {
    const html = readFileSync(pillarFile, "utf8");
    articles.push({
      slug: GLOBAL_PILLAR.slug,
      url: `https://conjuexpert.app${GLOBAL_PILLAR.slug}/`,
      title: extractTitle(html),
      datePublished: extractDate(html),
    });
  }

  for (const cluster of clusters) {
    for (const spoke of cluster.spokes.filter((s) => s.live)) {
      const dir = spoke.slug.replace(/^\//, "");
      const file = join(ROOT, dir, "index.html");
      if (!existsSync(file)) continue;
      const html = readFileSync(file, "utf8");
      articles.push({
        slug: spoke.slug,
        url: `https://conjuexpert.app${spoke.slug}/`,
        title: extractTitle(html),
        datePublished: extractDate(html),
      });
    }
  }

  for (const entry of readdirSync(join(ROOT, "blog"), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const slug = `/blog/${entry.name}`;
    if (articles.some((a) => a.slug === slug)) continue;
    const file = join(ROOT, "blog", entry.name, "index.html");
    if (!existsSync(file)) continue;
    const html = readFileSync(file, "utf8");
    if (!/name="robots"[^>]*content="index/.test(html)) continue;
    articles.push({
      slug,
      url: `https://conjuexpert.app${slug}/`,
      title: extractTitle(html),
      datePublished: extractDate(html),
    });
  }

  return articles;
})();

console.log(`\n📋 Blogartikel-Tracker Sync (${new Date().toISOString().slice(0, 10)})`);
console.log(`   Repo-Artikel: ${repoArticles.length}`);

try {
  await ensureProperties();
} catch (e) {
  console.warn(`⚠️   Spalten-Check übersprungen: ${e.message}`);
}

let trackerEntries;
try {
  trackerEntries = await getTrackerEntries();
} catch (e) {
  console.error(`❌  Notion-Abfrage fehlgeschlagen: ${e.message}`);
  process.exit(0);
}

console.log(`   Tracker-Einträge: ${trackerEntries.length}`);
const parsed = trackerEntries.map(parseEntry);

const toCreate = [];
const toUpdateDate = [];
const mismatches = [];

for (const article of repoArticles) {
  const match = parsed.find(
    (e) =>
      e.url === article.url ||
      e.url === article.url.replace(/\/$/, "") ||
      (e.title && article.title && e.title.toLowerCase() === article.title.toLowerCase())
  );

  if (!match) {
    toCreate.push(article);
    continue;
  }

  if (match.status !== "Veröffentlicht") {
    mismatches.push(`Status-Abweichung: "${article.title}" ist im Repo live, Tracker zeigt "${match.status}"`);
  }

  if (!match.datePublished && article.datePublished) {
    toUpdateDate.push({ id: match.id, title: article.title, datePublished: article.datePublished });
  }
}

// Tracker-Einträge, die im Repo nicht existieren
for (const entry of parsed.filter((e) => e.status === "Veröffentlicht")) {
  const inRepo = repoArticles.some(
    (a) => a.url === entry.url || a.url === entry.url + "/"
  );
  if (!inRepo && entry.url) {
    mismatches.push(`Nur im Tracker: "${entry.title}" (${entry.url}) — nicht im Repo gefunden`);
  }
}

// Ausgabe
if (toCreate.length === 0 && mismatches.length === 0 && toUpdateDate.length === 0) {
  console.log("\n✅  Tracker ist aktuell — kein Handlungsbedarf.\n");
  process.exit(0);
}

if (toCreate.length > 0) {
  console.log(`\n➕  Im Repo live, fehlt im Tracker (${toCreate.length}):`);
  for (const a of toCreate) {
    console.log(`   • ${a.title}`);
    console.log(`     URL: ${a.url}`);
    console.log(`     Datum: ${a.datePublished || "—"}`);
  }
}

if (mismatches.length > 0) {
  console.log(`\n⚠️   Abweichungen (${mismatches.length}):`);
  for (const m of mismatches) console.log(`   • ${m}`);
}

if (!DRY_RUN && toCreate.length > 0) {
  console.log("\n📝  Lege fehlende Einträge in Notion an…");
  for (const article of toCreate) {
    try {
      await createEntry(article);
      console.log(`   ✓ ${article.title}`);
    } catch (e) {
      console.error(`   ✗ ${article.title}: ${e.message}`);
    }
  }
} else if (DRY_RUN && toCreate.length > 0) {
  console.log("\n   (Dry-run — nichts angelegt. Mit --create ausführen, um Einträge zu erstellen.)");
}

if (!DRY_RUN && toUpdateDate.length > 0) {
  console.log(`\n📅  Veröffentlichungsdatum nachtragen (${toUpdateDate.length})…`);
  for (const entry of toUpdateDate) {
    try {
      await updateDate(entry.id, entry.datePublished);
      console.log(`   ✓ ${entry.title} → ${entry.datePublished}`);
    } catch (e) {
      console.error(`   ✗ ${entry.title}: ${e.message}`);
    }
  }
} else if (toUpdateDate.length > 0) {
  console.log(`\n📅  Datum fehlt in Notion (${toUpdateDate.length} Einträge):`);
  for (const e of toUpdateDate) console.log(`   • ${e.title} → ${e.datePublished}`);
}

console.log();
