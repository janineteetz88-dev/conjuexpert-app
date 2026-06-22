#!/usr/bin/env node
/**
 * create-backlog-entries.mjs
 * Einmalig ausführen um geplante Blogartikel in den Notion-Tracker einzutragen.
 */

const DB_ID = "f78defbe1d0543309b443fc134ad9127";
// Echte Tabelle des Trackers. Dem DB hängt versehentlich eine 2. (leere) Data
// Source an → /databases-Operationen geben 400 multiple_data_sources. Wir
// adressieren daher direkt die Data Source (Notion-Version 2025-09-03).
const DATA_SOURCE_ID = "675fdfec-f644-4fd4-9f7e-340b85966013";
const NOTION_VERSION_DS = "2025-09-03"; // data_sources-API (Multi-Source-DBs)
const key = process.env.NOTION_API_KEY;

if (!key) { console.error("❌ NOTION_API_KEY fehlt"); process.exit(1); }

async function notionFetch(path, method = "GET", body = null) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Notion-Version": NOTION_VERSION_DS,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text()}`);
  return res.json();
}

const entries = [
  { thema: "Active Recall: Wie du Vokabeln wirklich behältst",           sprache: "Alle",    saeule: "Sprachtipps" },
  { thema: "Die Feynman-Methode fürs Sprachenlernen",                     sprache: "Alle",    saeule: "Sprachtipps" },
  { thema: "Pausen und Zeitmanagement beim Sprachenlernen",               sprache: "Alle",    saeule: "Sprachtipps" },
  { thema: "Neurobiologie des Lernens: Was im Gehirn passiert",           sprache: "Alle",    saeule: "Sprachtipps" },
  { thema: "Evidenzbasiertes Lernen: Was wirklich funktioniert",          sprache: "Alle",    saeule: "Sprachtipps" },
];

console.log(`\n📝 Lege ${entries.length} Backlog-Einträge in Notion an…\n`);

for (const e of entries) {
  try {
    await notionFetch("/pages", "POST", {
      parent: { type: "data_source_id", data_source_id: DATA_SOURCE_ID },
      properties: {
        "Thema":   { title: [{ text: { content: e.thema } }] },
        "Status":  { select: { name: "Backlog" } },
        "Sprache": { select: { name: e.sprache } },
        "Säule":   { select: { name: e.saeule } },
      },
    });
    console.log(`   ✓ ${e.thema}`);
  } catch (err) {
    console.error(`   ✗ ${e.thema}: ${err.message}`);
  }
}

console.log("\nFertig.\n");
