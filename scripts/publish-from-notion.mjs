#!/usr/bin/env node
/**
 * publish-from-notion.mjs
 *
 * Liest Notion-Datenbank, findet "Freigegeben"-Artikel,
 * setzt sie in clusters.js auf live: true und updated Notion auf "Veröffentlicht".
 *
 * Aufruf: node scripts/publish-from-notion.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { generateHtmlFromNotion } from "./notion-to-html.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARGS = process.argv.slice(2);
const DRY_RUN = ARGS.includes("--dry-run");
const DB_ID = "f78defbe1d0543309b443fc134ad9127";
const NOTION_VERSION = "2022-06-28";

const key = process.env.NOTION_API_KEY;
if (!key) {
  console.error("❌  NOTION_API_KEY nicht gesetzt.");
  process.exit(0);
}

/* ─── Notion API ─────────────────────────────────────────────────────────── */

async function notionFetch(path, method = "GET", body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://api.notion.com/v1${path}`, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Notion ${res.status}: ${txt}`);
  }
  return res.json();
}

async function getFreigegebene() {
  const entries = [];
  let cursor;
  do {
    const body = {
      page_size: 100,
      filter: { property: "Status", select: { equals: "Freigegeben" } },
    };
    if (cursor) body.start_cursor = cursor;
    const data = await notionFetch(`/databases/${DB_ID}/query`, "POST", body);
    entries.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return entries;
}

async function setVeroeffentlicht(pageId) {
  return notionFetch(`/pages/${pageId}`, "PATCH", {
    properties: {
      Status: { select: { name: "Veröffentlicht" } },
    },
  });
}

function parseTitle(page) {
  const props = page.properties;
  return (
    props["Thema"]?.title?.[0]?.plain_text ||
    props["Titel"]?.title?.[0]?.plain_text ||
    props["Name"]?.title?.[0]?.plain_text ||
    ""
  );
}

/* ─── clusters.js Hilfsfunktionen ─────────────────────────────────────────── */

const CLUSTERS_PATH = join(ROOT, "src/data/clusters.js");

function findSpokeByTitle(clusters, title) {
  const norm = (s) => s.toLowerCase().trim().replace(/[^a-z0-9äöüß\s]/g, "");
  const nt = norm(title);
  for (const cluster of clusters) {
    // Exakter Match zuerst
    let spoke = cluster.spokes.find((s) => norm(s.title) === nt);
    if (spoke) return { cluster, spoke };
    // Partial match: clusters-Titel ist Anfang des Notion-Titels (z.B. "Ser vs. Estar" in "Ser vs. Estar: Wann welches?")
    spoke = cluster.spokes.find((s) => nt.startsWith(norm(s.title)) || norm(s.title).startsWith(nt));
    if (spoke) return { cluster, spoke };
  }
  return null;
}

function setLiveInFile(slug) {
  let src = readFileSync(CLUSTERS_PATH, "utf8");
  const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pat = new RegExp(
    `(slug:\\s*"${escapedSlug}"[^}]*?)live:\\s*false`,
    "s"
  );
  if (!pat.test(src)) return false;
  src = src.replace(pat, "$1live: true");
  writeFileSync(CLUSTERS_PATH, src, "utf8");
  return true;
}

function htmlExists(slug) {
  const file = join(ROOT, slug.replace(/^\//, ""), "index.html");
  return existsSync(file);
}

/* ─── Hauptlogik ─────────────────────────────────────────────────────────── */

console.log(`\n🚀  Notion → ConjuExpert Publish (${new Date().toISOString().slice(0, 10)})`);
console.log(DRY_RUN ? "   Modus: Dry-run\n" : "   Modus: Live\n");

const { clusters, GLOBAL_PILLAR } = await import(CLUSTERS_PATH);

// API-Verbindungstest
try {
  const testRes = await notionFetch(`/databases/${DB_ID}/query`, "POST", { page_size: 1 });
  if (testRes.object === "error") {
    console.error(`❌  Notion API Fehler: ${testRes.status} ${testRes.code} — ${testRes.message}`);
    process.exit(0);
  }
  const firstTitle = testRes.results?.[0]?.properties?.["Thema"]?.title?.[0]?.plain_text || "?";
  const firstStatus = testRes.results?.[0]?.properties?.["Status"]?.select?.name || "?";
  console.log(`✓  Notion API OK — erster Eintrag: "${firstTitle}" | Status: "${firstStatus}"`);
} catch (e) {
  console.error(`❌  Notion API nicht erreichbar: ${e.message}`);
  process.exit(0);
}

let freigegeben;
try {
  freigegeben = await getFreigegebene();
} catch (e) {
  console.error(`❌  Notion-Abfrage fehlgeschlagen: ${e.message}`);
  process.exit(0);
}

console.log(`📋  Freigegeben in Notion: ${freigegeben.length}`);

let published = 0;
let noHtml = 0;
let notFound = 0;

for (const page of freigegeben) {
  const title = parseTitle(page);
  if (!title) continue;

  const match = findSpokeByTitle(clusters, title);

  if (!match) {
    // Pillar-Artikel prüfen: ist schon live → nur Notion auf Veröffentlicht setzen
    const norm = (s) => s.toLowerCase().trim().replace(/[^a-z0-9äöüß\s]/g, "");
    if (GLOBAL_PILLAR && norm(title).startsWith(norm(GLOBAL_PILLAR.title?.split(":")[0] || ""))) {
      if (htmlExists(GLOBAL_PILLAR.slug)) {
        console.log(`✓   Pillar bereits live, setze Notion → Veröffentlicht: "${title}"`);
        if (!DRY_RUN) await setVeroeffentlicht(page.id);
        published++;
      } else {
        console.log(`⚠️   Pillar-HTML fehlt für: "${title}"`);
        noHtml++;
      }
      continue;
    }
    console.log(`⚠️   Kein clusters.js-Eintrag für: "${title}"`);
    notFound++;
    continue;
  }

  const { spoke } = match;

  if (!htmlExists(spoke.slug)) {
    // Notion-Seite hat eine verknüpfte Page-URL — Notion Page ID extrahieren
    const notionUrl =
      page.properties["Live-Link"]?.url ||
      page.properties["Link"]?.url ||
      page.url ||
      "";
    const pageIdMatch = notionUrl.match(/([a-f0-9]{32})$/);
    const cleanId = page.id.replace(/-/g, "");

    console.log(`📄  Generiere HTML aus Notion für: "${title}"`);
    if (!DRY_RUN) {
      try {
        const html = await generateHtmlFromNotion(cleanId, spoke, match.cluster, GLOBAL_PILLAR, key);
        const dir = join(ROOT, spoke.slug.replace(/^\//, ""));
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "index.html"), html, "utf8");
        console.log(`   ✓ HTML erstellt: ${spoke.slug}/index.html`);
        // Weiter mit live schalten
      } catch (e) {
        console.error(`   ✗ HTML-Generierung fehlgeschlagen: ${e.message}`);
        noHtml++;
        continue;
      }
    } else {
      console.log(`   (Dry-run — kein HTML geschrieben)`);
      published++;
      continue;
    }
  }

  if (spoke.live) {
    console.log(`✓   Bereits live, setze Notion → Veröffentlicht: "${title}"`);
    if (!DRY_RUN) await setVeroeffentlicht(page.id);
    published++;
    continue;
  }

  console.log(`🟢  Live schalten: "${title}" (${spoke.slug})`);
  if (!DRY_RUN) {
    const ok = setLiveInFile(spoke.slug);
    if (ok) {
      await setVeroeffentlicht(page.id);
      published++;
    } else {
      console.error(`   ✗  Konnte live: true nicht setzen in clusters.js`);
    }
  } else {
    published++;
  }
}

console.log(`\n✅  Ergebnis:`);
console.log(`   Veröffentlicht: ${published}`);
if (noHtml > 0) console.log(`   HTML fehlt noch: ${noHtml}`);
if (notFound > 0) console.log(`   Nicht in clusters.js: ${notFound}`);
console.log();
