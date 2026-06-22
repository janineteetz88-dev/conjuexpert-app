#!/usr/bin/env node
/**
 * migrate-notion-tracker.mjs  —  Einmalige Datenbank-Migration
 *
 * Was dieses Skript tut:
 *   1. Neue Felder anlegen   : Typ (select), Cluster (select), Slug (rich_text)
 *   2. Felder umbenennen     : Link → Live-Link, Notion-Seite → Notion-Quelle
 *   3. Feld löschen          : Blog-Link
 *   4. Alle Seiten befüllen  : Typ, Cluster, Slug anhand von clusters.js
 *
 * Was manuell in Notion erledigt werden muss (API unterstützt keine Views):
 *   - Pipeline    : Board-Ansicht, gruppiert nach Status
 *   - Live        : Tabellen-Ansicht, Filter: Status = "Veröffentlicht"
 *   - Struktur    : Board-Ansicht, gruppiert nach Typ
 *   - Wartet auf dich : Tabellen-Ansicht, Filter: Status = "Wartet auf mich"
 *
 * Aufruf:
 *   NOTION_API_KEY=secret_xxx node scripts/migrate-notion-tracker.mjs
 *   NOTION_API_KEY=secret_xxx node scripts/migrate-notion-tracker.mjs --dry-run
 */

import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT   = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARGS   = process.argv.slice(2);
const DRY    = ARGS.includes("--dry-run");
const DB_ID  = "f78defbe1d0543309b443fc134ad9127";
// Echte Tabelle des Trackers. Dem DB hängt versehentlich eine 2. (leere) Data
// Source an → /databases-Operationen geben 400 multiple_data_sources. Wir
// adressieren daher direkt die Data Source (Notion-Version 2025-09-03).
const DATA_SOURCE_ID = "675fdfec-f644-4fd4-9f7e-340b85966013";
const NOTION = "2025-09-03";

/* ─── Notion REST helper ────────────────────────────────────────────────── */

const KEY = process.env.NOTION_API_KEY;
if (!KEY) {
  console.error("❌  NOTION_API_KEY nicht gesetzt.");
  console.error("    export NOTION_API_KEY=secret_xxx && node scripts/migrate-notion-tracker.mjs");
  process.exit(1);
}

async function api(path, method = "GET", body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Notion-Version": NOTION,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://api.notion.com/v1${path}`, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Notion ${res.status} ${method} ${path}: ${txt}`);
  }
  return res.json();
}

async function allPages() {
  const pages = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const data = await api(`/data_sources/${DATA_SOURCE_ID}/query`, "POST", body);
    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return pages;
}

/* ─── Cluster-Daten einlesen ─────────────────────────────────────────────── */

const { clusters, GLOBAL_PILLAR } = await import(join(ROOT, "src/data/clusters.js"));

// Slug → { typ, cluster } Lookup aufbauen
const SLUG_MAP = new Map();

SLUG_MAP.set(GLOBAL_PILLAR.slug.replace(/\/$/, ""), { typ: "Pillar", cluster: "" });

for (const c of clusters) {
  SLUG_MAP.set(c.hub.slug.replace(/\/$/, ""), { typ: "Hub", cluster: c.label });
  for (const spoke of c.spokes) {
    SLUG_MAP.set(spoke.slug.replace(/\/$/, ""), { typ: "Spoke", cluster: c.label });
  }
}

function resolveSlug(url) {
  if (!url) return null;
  try {
    const path = new URL(url).pathname.replace(/\/$/, "");
    if (SLUG_MAP.has(path)) return { slug: path, ...SLUG_MAP.get(path) };
    // Blog-Artikel die nicht in clusters.js sind
    if (path.startsWith("/blog/")) return { slug: path, typ: "Blog", cluster: "" };
    return { slug: path, typ: "Blog", cluster: "" };
  } catch {
    return null;
  }
}

/* ─── Schritt 1: Schema-Änderungen ──────────────────────────────────────── */

console.log(`\n🔧  Notion Tracker Migration (${new Date().toISOString().slice(0, 10)})`);
console.log(DRY ? "    Modus: Dry-run — kein Schreibzugriff\n" : "    Modus: Live\n");

const db = await api(`/data_sources/${DATA_SOURCE_ID}`);
const existingProps = Object.keys(db.properties);
console.log(`📋  Vorhandene Felder: ${existingProps.join(", ")}\n`);

const schemaChanges = {};

// Neue Felder anlegen (nur wenn noch nicht vorhanden)
if (!existingProps.includes("Typ")) {
  schemaChanges["Typ"] = {
    select: {
      options: [
        { name: "Pillar", color: "yellow" },
        { name: "Hub",    color: "blue"   },
        { name: "Spoke",  color: "green"  },
        { name: "Blog",   color: "gray"   },
      ],
    },
  };
  console.log("   + Feld anlegen: Typ (select)");
}

if (!existingProps.includes("Cluster")) {
  schemaChanges["Cluster"] = {
    select: {
      options: [
        { name: "Spanisch",      color: "orange" },
        { name: "Deutsch",       color: "red"    },
        { name: "Französisch",   color: "purple" },
        { name: "Englisch",      color: "blue"   },
        { name: "Niederländisch",color: "green"  },
      ],
    },
  };
  console.log("   + Feld anlegen: Cluster (select)");
}

if (!existingProps.includes("Slug")) {
  schemaChanges["Slug"] = { rich_text: {} };
  console.log("   + Feld anlegen: Slug (rich_text)");
}

// Umbenennen: Link → Live-Link
if (existingProps.includes("Link") && !existingProps.includes("Live-Link")) {
  schemaChanges["Link"] = { name: "Live-Link" };
  console.log("   ✎ Umbenennen: Link → Live-Link");
}

// Umbenennen: Notion-Seite → Notion-Quelle
if (existingProps.includes("Notion-Seite") && !existingProps.includes("Notion-Quelle")) {
  schemaChanges["Notion-Seite"] = { name: "Notion-Quelle" };
  console.log("   ✎ Umbenennen: Notion-Seite → Notion-Quelle");
}

// Blog-Link löschen
if (existingProps.includes("Blog-Link")) {
  schemaChanges["Blog-Link"] = null;
  console.log("   − Feld löschen: Blog-Link");
}

if (Object.keys(schemaChanges).length === 0) {
  console.log("   (keine Schema-Änderungen nötig)");
} else if (!DRY) {
  await api(`/data_sources/${DATA_SOURCE_ID}`, "PATCH", { properties: schemaChanges });
  console.log("   ✓ Schema aktualisiert\n");
} else {
  console.log("   (Dry-run — Schema nicht geändert)\n");
}

/* ─── Schritt 2: Seiten befüllen ─────────────────────────────────────────── */

console.log("📝  Lade alle Seiten…");
const pages = await allPages();
console.log(`    ${pages.length} Seiten gefunden\n`);

// Nach der Umbenennung lautet das Feld "Live-Link"; im Dry-run heißt es noch "Link"
const URL_FIELD = existingProps.includes("Live-Link") ? "Live-Link"
  : (DRY ? "Link" : "Live-Link");

let updated = 0;
let skipped = 0;
let unknown = 0;

for (const page of pages) {
  const props  = page.properties;
  const title  = props["Thema"]?.title?.[0]?.plain_text
               || props["Titel"]?.title?.[0]?.plain_text
               || props["Name"]?.title?.[0]?.plain_text
               || "(kein Titel)";

  // URL aus dem (möglicherweise bereits umbenannten) Feld lesen
  const url = props[URL_FIELD]?.url
           || props["Link"]?.url
           || props["Live-Link"]?.url
           || "";

  const resolved = resolveSlug(url);
  if (!resolved) {
    console.log(`   ⚠  Kein URL-Match: "${title}" (url: "${url}")`);
    unknown++;
    continue;
  }

  // Prüfen ob Felder schon gesetzt sind (Idempotenz)
  const currentTyp     = props["Typ"]?.select?.name     || "";
  const currentCluster = props["Cluster"]?.select?.name || "";
  const currentSlug    = props["Slug"]?.rich_text?.[0]?.plain_text || "";

  if (currentTyp === resolved.typ && currentCluster === resolved.cluster && currentSlug === resolved.slug) {
    skipped++;
    continue;
  }

  console.log(`   → "${title}": Typ=${resolved.typ} Cluster=${resolved.cluster || "—"} Slug=${resolved.slug}`);

  if (!DRY) {
    const patch = {
      Typ: resolved.typ ? { select: { name: resolved.typ } } : { select: null },
      Slug: { rich_text: [{ text: { content: resolved.slug } }] },
    };
    if (resolved.cluster) {
      patch["Cluster"] = { select: { name: resolved.cluster } };
    } else {
      patch["Cluster"] = { select: null };
    }

    try {
      await api(`/pages/${page.id}`, "PATCH", { properties: patch });
      updated++;
    } catch (e) {
      console.error(`      ✗ Fehler: ${e.message}`);
    }
  } else {
    updated++;
  }
}

/* ─── Zusammenfassung ────────────────────────────────────────────────────── */

console.log("\n✅  Migration abgeschlossen:");
console.log(`    Befüllt:        ${updated}`);
console.log(`    Bereits ok:     ${skipped}`);
if (unknown > 0) console.log(`    Ohne URL-Match: ${unknown} (manuell prüfen)`);

if (DRY) {
  console.log("\n    (Dry-run — nichts wurde geändert. Ohne --dry-run erneut aufrufen.)");
}

console.log(`
📌  Noch manuell in Notion anlegen (Views):
    1. Pipeline  → Board-Ansicht, gruppiert nach "Status"
    2. Live      → Tabellen-Ansicht, Filter: Status = "Veröffentlicht"
    3. Struktur  → Board-Ansicht, gruppiert nach "Typ"
    4. Wartet auf dich → Tabellen-Ansicht, Filter: Status = "Wartet auf mich"
`);
