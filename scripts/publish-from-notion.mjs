#!/usr/bin/env node
/**
 * publish-from-notion.mjs  —  generischer, meta-block-getriebener Produktionspfad
 *
 * Ablauf (siehe Schritt-2-Spezifikation):
 *   1. Notion-Tracker-DB nach Status=="Freigegeben" abfragen.
 *   2. Sortieren: Nummer aufsteigend, dann Hubs vor Spokes innerhalb des Clusters.
 *   3. Pro Eintrag den verlinkten Entwurf (Feld "Entwurf (Notion)") laden.
 *   4. Meta-Block aus den führenden Draft-Blöcken parsen + validieren
 *      (ungültig → WARNEN + ÜBERSPRINGEN).
 *   5. FAQ + Content aus den Blöcken trennen (beide Notion-Formate).
 *   6. Zwei-Pass-Rendern: erst alle gültigen Slugs sammeln (→ publishedSlugs),
 *      dann rendern (Links nur auf published Slugs).
 *   7. clusters.js upserten (Verb-Cluster/GLOBAL_PILLAR unangetastet).
 *   8. blog/<slug>/index.html schreiben.
 *   9. sitemap.xml mergen (dedupe).
 *  10. Writeback (GATED via WRITEBACK=1): Live-URL/Datum/Status setzen,
 *      nur bei Erfolg, nur wenn Status noch "Freigegeben", idempotent.
 *
 * Flags:  --dry-run  → keine File-Writes, kein Writeback; nur Plan ausgeben.
 *
 * KRITISCH: Ohne NOTION_API_KEY ist der Live-Pfad nicht lauffähig. In dieser
 * Umgebung dient --dry-run + Unit-Tests (scripts/_preview/test-pipeline.mjs)
 * zur Verifikation; der echte Lauf passiert in CI.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  fetchPage,
  fetchBlocks,
  nFetch,
  today,
} from "./notion-to-html.mjs";

import { parseMetaBlock, validateMeta, cleanMetaDescription } from "./lib/meta-block.mjs";
import { normalizeFaq } from "./lib/faq.mjs";
import { renderArticle } from "./lib/render-article.mjs";
import { auditRenderedHtml } from "./lib/render-guard.mjs";
import { lintRenderedHtml, hardErrors } from "./lib/standard-lint.mjs";
import { blocksToMetaText, extractFaqAndContent } from "./lib/notion-adapt.mjs";
import {
  upsertClusters,
  mergeSitemap,
  metasToClusters,
} from "./lib/clusters-upsert.mjs";
import {
  upsertBlogCards,
  buildCardFromArticle,
  reconcileBlogCardsFromClusters,
} from "./lib/blog-index.mjs";
import { estimateReadTime, blocksToHtml } from "./notion-to-html.mjs";

/* ─── Konstanten / Flags ─────────────────────────────────────────────────── */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARGS = process.argv.slice(2);
const DRY_RUN = ARGS.includes("--dry-run");
const WRITEBACK = process.env.WRITEBACK === "1";
// Gold-Standard-Linter: standardmäßig nur melden; =1 blockt harte CI/Stil-Fehler.
const STANDARD_LINT_STRICT = process.env.STANDARD_LINT_STRICT === "1";

// Handgebaute Artikel: NIEMALS von der Pipeline (über)schreiben. Diese Seiten
// werden von Hand gepflegt; die Engine lässt sie unangetastet.
const PROTECTED_SLUGS = new Set([
  "/blog/unsere-geschichte",
  "/blog/karten-quiz-ki-saetze",
  "/blog/subjuntivo-learn-tab",
]);
const DB_ID = "f78defbe1d0543309b443fc134ad9127";
// Echte Tabelle des Trackers. Der DB hängt versehentlich eine 2. (leere) Data Source an,
// daher /databases/{id}/query nicht nutzbar — wir fragen die Data Source direkt ab.
const DATA_SOURCE_ID = "675fdfec-f644-4fd4-9f7e-340b85966013";
const NOTION_VERSION = "2022-06-28";
// data_sources-API (Multi-Source-DBs) gibt es erst ab dieser Version — nur für die Query.
const NOTION_VERSION_DS = "2025-09-03";
const BASE_LIVE = "https://conjuexpert.app";

const CLUSTERS_PATH = join(ROOT, "src/data/clusters.js");
const SITEMAP_PATH = join(ROOT, "sitemap.xml");
const BLOG_INDEX_PATH = join(ROOT, "blog/index.html");

const KEY = process.env.NOTION_API_KEY;

/* ─── kleine Logger ──────────────────────────────────────────────────────── */

const log = (...a) => console.log(...a);
const warn = (...a) => console.warn("⚠️ ", ...a);

/* ─── Notion: Tracker-Query (POST, daher eigener Helfer mit Body) ────────── */

async function notionQuery(path, method, body, version = NOTION_VERSION) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Notion-Version": version,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://api.notion.com/v1${path}`, opts);
  if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text()}`);
  return res.json();
}

async function getFreigegebene() {
  // REFRESH_ALL=1: zusätzlich bereits veröffentlichte Artikel laden, damit ein
  // Template-/Render-Update auf ALLE Live-Artikel angewandt wird (idempotenter
  // Refresh, budget-frei; Writeback lässt "Veröffentlicht" unangetastet).
  const refreshAll = process.env.REFRESH_ALL === "1";
  const statusFilter = refreshAll
    ? {
        or: [
          { property: "Status", select: { equals: "Freigegeben" } },
          { property: "Status", select: { equals: "Veröffentlicht" } },
        ],
      }
    : { property: "Status", select: { equals: "Freigegeben" } };
  const entries = [];
  let cursor;
  do {
    const body = {
      page_size: 100,
      filter: statusFilter,
    };
    if (cursor) body.start_cursor = cursor;
    const data = await notionQuery(`/data_sources/${DATA_SOURCE_ID}/query`, "POST", body, NOTION_VERSION_DS);
    entries.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return entries;
}

/* ─── Tracker-Eintrag-Parsing (defensiv, mit Fallback-Feldnamen) ─────────── */

function prop(page, names) {
  for (const n of names) {
    if (page.properties && page.properties[n] !== undefined) return page.properties[n];
  }
  return undefined;
}

function readTitle(page) {
  const p = prop(page, ["Thema", "Titel", "Name"]);
  return p?.title?.[0]?.plain_text || "";
}

function readStatus(page) {
  const p = prop(page, ["Status"]);
  return p?.select?.name || p?.status?.name || "";
}

function readNummer(page) {
  const p = prop(page, ["Nummer", "Nr", "Nr."]);
  if (!p) return Number.POSITIVE_INFINITY;
  if (typeof p.number === "number") return p.number;
  // evtl. als Text/Title
  const txt = p.rich_text?.[0]?.plain_text || p.title?.[0]?.plain_text || "";
  const n = parseFloat(txt);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

function readDraftUrl(page) {
  const p = prop(page, ["Entwurf (Notion)", "Entwurf", "Draft", "Notion-Quelle"]);
  return p?.url || p?.rich_text?.[0]?.plain_text || "";
}

// Notion-Page-ID (32 hex) aus einer URL ziehen.
function extractPageId(url) {
  if (!url) return null;
  const m = String(url).match(/([0-9a-f]{32})(?:[?#].*)?$/i);
  if (m) return m[1];
  // mit Bindestrichen (UUID)
  const m2 = String(url).match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (m2) return m2[1].replace(/-/g, "");
  return null;
}

/* ─── Page-Titel des Entwurfs lesen ──────────────────────────────────────── */

// Entfernt führende Arbeits-Marker aus Entwurfstiteln (z. B. "✍️ [Entwurf] …"),
// damit sie nicht als H1/Title in den Live-Artikel leaken.
function sanitizeTitle(s) {
  let t = String(s || "");
  t = t.replace(/^(?:[\u{1F000}-\u{1FAFF}\u{2190}-\u{27BF}\u{2B00}-\u{2BFF}️‍\s]|\[[^\]]*\])+/u, "");
  return t.replace(/\s{2,}/g, " ").trim();
}

function readDraftTitle(draftPage, fallback) {
  const props = draftPage?.properties || {};
  for (const key of Object.keys(props)) {
    if (props[key]?.type === "title" && props[key].title?.length) {
      return sanitizeTitle(props[key].title.map((t) => t.plain_text).join(""));
    }
  }
  return sanitizeTitle(fallback);
}

/* ─── Slug-Helfer ────────────────────────────────────────────────────────── */

function slugDir(slug) {
  // "/blog/foo" → ROOT/blog/foo
  return join(ROOT, slug.replace(/^\//, ""));
}

function htmlExists(slug) {
  return existsSync(join(slugDir(slug), "index.html"));
}

/* ─── Bereits live veröffentlichte Slugs (aus dem Dateisystem) ───────────── */

function livePublishedSlugs(metas) {
  const set = new Set();
  for (const m of metas) {
    if (m.meta?.slug && htmlExists(m.meta.slug)) set.add(m.meta.slug);
  }
  return set;
}

/* ─── Tageslimit: wie viele Blog-Artikel wurden HEUTE bereits live geschaltet ─
   Quelle: sitemap.xml — mergeSitemap setzt lastmod=heute NUR bei neu ergänzten
   Slugs (bestehende bleiben), daher ist <loc>/blog/…</loc> + <lastmod>heute</lastmod>
   ein stabiler Tages-Zähler über alle stündlichen Läufe hinweg. */
export function publishedBlogToday(sitemapXml, todayStr) {
  const re = /<loc>https:\/\/conjuexpert\.app\/blog\/[^<]+<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g;
  let n = 0, m;
  while ((m = re.exec(sitemapXml)) !== null) {
    if (m[1].trim() === todayStr) n++;
  }
  return n;
}

/* ─── Sortierung: Nummer ↑, dann Hub vor Spoke im selben Cluster ─────────── */

export function sortArticles(items) {
  return items.slice().sort((a, b) => {
    if (a.nummer !== b.nummer) return a.nummer - b.nummer;
    // gleicher Cluster: Hub vor Spoke
    const sameCluster = (a.meta?.cluster || "") === (b.meta?.cluster || "");
    if (sameCluster) {
      const rank = (t) => (t === "hub" ? 0 : 1);
      const ra = rank(a.meta?.typ);
      const rb = rank(b.meta?.typ);
      if (ra !== rb) return ra - rb;
    }
    return 0;
  });
}

/* ─── Hauptlauf ──────────────────────────────────────────────────────────── */

async function main() {
  log(`\n🚀  publish-from-notion (${today()})`);
  log(`    Modus: ${DRY_RUN ? "DRY-RUN" : "LIVE"} · Writeback: ${WRITEBACK ? "AN (WRITEBACK=1)" : "AUS"}\n`);

  if (!KEY) {
    warn("NOTION_API_KEY nicht gesetzt — Live-API-Pfad hier nicht lauffähig.");
    warn("Für lokale Verifikation: node scripts/_preview/test-pipeline.mjs");
    log("\nAbbruch (kein Key).\n");
    return;
  }

  // 1) Freigegebene Tracker-Einträge.
  let tracker;
  try {
    tracker = await getFreigegebene();
  } catch (e) {
    console.error(`❌  Notion-Abfrage fehlgeschlagen: ${e.message}`);
    process.exit(1);
  }
  log(`📋  Freigegeben: ${tracker.length}`);

  // 2) Pro Eintrag Entwurf laden + Meta parsen (PASS 1: sammeln/validieren).
  const articles = []; // { trackerPage, title, meta, contentBlocks, faqItems, nummer, draftId }
  for (const page of tracker) {
    const trackerTitle = readTitle(page);
    const nummer = readNummer(page);
    const draftUrl = readDraftUrl(page);
    const draftId = extractPageId(draftUrl);

    if (!draftId) {
      warn(`Übersprungen (kein Entwurf-Link): "${trackerTitle || page.id}"`);
      continue;
    }

    let draftPage, blocks;
    try {
      draftPage = await fetchPage(draftId, KEY);
      blocks = await fetchBlocks(draftId, KEY);
    } catch (e) {
      warn(`Entwurf nicht ladbar (${draftId}): ${e.message}`);
      continue;
    }

    const metaText = blocksToMetaText(blocks);
    const meta = parseMetaBlock(metaText);
    if (PROTECTED_SLUGS.has(meta.slug)) {
      log(`    🔒 geschützt (handgebaut) → NICHT angefasst: ${meta.slug}`);
      continue;
    }
    const v = validateMeta(meta);
    // Meta-Description ist NICHT mehr allein ein Ausschlussgrund: fehlt NUR sie,
    // Warnung loggen + Fallback (Titel) nutzen statt den Artikel zu überspringen.
    const hardErrors = v.errors.filter((e) => !/Meta-Description/i.test(e));
    if (hardErrors.length) {
      warn(`Meta ungültig → ÜBERSPRUNGEN: "${trackerTitle}" — ${hardErrors.join("; ")}`);
      continue;
    }
    if (!meta.metaDescription || !String(meta.metaDescription).trim()) {
      meta.metaDescription = cleanMetaDescription(trackerTitle);
      warn(`Meta-Description fehlte → Fallback (Titel) genutzt: "${trackerTitle}"`);
    }

    const { contentBlocks, faqBlocks } = extractFaqAndContent(blocks);
    const faqItems = normalizeFaq(faqBlocks);
    const title = readDraftTitle(draftPage, meta.keyword || trackerTitle);

    articles.push({
      trackerPage: page,
      trackerTitle,
      title,
      meta,
      contentBlocks,
      faqItems,
      nummer,
      draftId,
    });
  }

  // Sortieren.
  const sorted = sortArticles(articles);

  // Tageslimit: max. N NEUE Artikel pro Kalendertag online schalten.
  // Bereits live geschaltete (HTML existiert) werden weiterhin aktualisiert
  // (Refresh, idempotent) und zählen NICHT gegen das Tagesbudget.
  const MAX_PER_DAY = Number(process.env.MAX_PER_DAY) || 3;
  const sitemapNow = existsSync(SITEMAP_PATH) ? readFileSync(SITEMAP_PATH, "utf8") : "";
  const alreadyToday = publishedBlogToday(sitemapNow, today());
  const budget = Math.max(0, MAX_PER_DAY - alreadyToday);
  const alreadyLive = sorted.filter((a) => htmlExists(a.meta.slug));
  const newOnes = sorted.filter((a) => !htmlExists(a.meta.slug));
  const newToPublish = newOnes.slice(0, budget);
  const deferred = newOnes.slice(budget);
  const toPublish = sortArticles([...alreadyLive, ...newToPublish]);
  if (deferred.length) {
    log(`\n⏳  Tageslimit ${MAX_PER_DAY}/Tag erreicht (heute schon ${alreadyToday} online) → ${deferred.length} verschoben: ${deferred.map((a) => a.meta.slug).join(", ")}`);
  }

  // publishedSlugs = bereits live ∪ in DIESEM Lauf gerenderte (verschobene NICHT → keine 404-Links).
  const published = livePublishedSlugs(sorted);
  for (const a of toPublish) published.add(a.meta.slug);

  // allArticles: slug → { title }
  const allArticles = {};
  for (const a of toPublish) allArticles[a.meta.slug] = { title: a.title };

  log(`\n📝  Plan (Reihenfolge nach Nummer, Hub-first):`);
  for (const a of toPublish) {
    log(`    #${a.nummer === Infinity ? "?" : a.nummer} [${a.meta.typ || "?"}] ${a.meta.slug}  "${a.title}"  → blog/${a.meta.slug.replace(/^\/blog\//, "")}/index.html`);
  }
  if (!toPublish.length) {
    log("    (nichts zu rendern)");
  }

  // PASS 2: Rendern + schreiben.
  const renderedSlugs = [];
  const deployed = []; // { article, slug } für Writeback
  const guardFailures = [];
  for (const a of toPublish) {
    let html;
    try {
      html = renderArticle({
        meta: a.meta,
        title: a.title,
        contentBlocks: a.contentBlocks,
        faqItems: a.faqItems,
        publishedSlugs: published,
        allArticles,
      });
    } catch (e) {
      warn(`Render fehlgeschlagen für ${a.meta.slug}: ${e.message}`);
      continue;
    }

    // Render-Guard: kaputtes HTML wird NIE geschrieben/veröffentlicht.
    const problems = auditRenderedHtml(html, { slug: a.meta.slug });
    if (problems.length) {
      guardFailures.push(a.meta.slug);
      warn(`Render-Guard FEHLER → NICHT veröffentlicht: ${a.meta.slug}`);
      for (const p of problems) warn(`        • ${p}`);
      continue;
    }

    // Gold-Standard-Linter (CI/Stil): meldet redaktionelle Verstöße. Standard
    // = nur melden (Rollout). Mit STANDARD_LINT_STRICT=1 blocken harte Fehler
    // die Veröffentlichung (analog Render-Guard) — für den Scharf-Betrieb.
    const lint = lintRenderedHtml(html, { meta: a.meta });
    const lintHard = hardErrors(lint);
    if (lint.length) {
      warn(`Gold-Standard: ${lintHard.length} Fehler, ${lint.length - lintHard.length} Warnungen — ${a.meta.slug}`);
      for (const f of lint) warn(`        • [${f.level}] ${f.code}: ${f.msg}`);
    }
    if (STANDARD_LINT_STRICT && lintHard.length) {
      guardFailures.push(a.meta.slug);
      warn(`Gold-Standard STRICT → NICHT veröffentlicht: ${a.meta.slug}`);
      continue;
    }

    const outDir = slugDir(a.meta.slug);
    const outFile = join(outDir, "index.html");
    if (DRY_RUN) {
      log(`    (dry-run) würde schreiben: ${outFile} (${html.length} bytes)`);
    } else {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outFile, html, "utf8");
      log(`    ✓ geschrieben: ${a.meta.slug}/index.html`);
    }
    renderedSlugs.push(a.meta.slug);
    deployed.push({ article: a, slug: a.meta.slug });
  }

  // 7) clusters.js upserten.
  const derived = metasToClusters(
    toPublish.map((a) => ({ meta: a.meta, title: a.title, live: true }))
  );
  if (derived.length) {
    const { clusters: existing } = await import(CLUSTERS_PATH + `?t=${Date.now()}`);
    const src = readFileSync(CLUSTERS_PATH, "utf8");
    const next = upsertClusters(src, existing, derived);
    if (DRY_RUN) {
      log(`\n🗂️   (dry-run) clusters.js Upsert: ${derived.length} Cluster (${derived.map((c) => c.id).join(", ")})`);
    } else if (next !== src) {
      writeFileSync(CLUSTERS_PATH, next, "utf8");
      log(`\n🗂️   clusters.js aktualisiert: ${derived.map((c) => c.id).join(", ")}`);
    } else {
      log(`\n🗂️   clusters.js unverändert (idempotent)`);
    }
  }

  // 9) sitemap.xml mergen.
  if (renderedSlugs.length) {
    const srcMap = readFileSync(SITEMAP_PATH, "utf8");
    const nextMap = mergeSitemap(srcMap, renderedSlugs, today());
    const added = (nextMap.match(/<loc>/g) || []).length - (srcMap.match(/<loc>/g) || []).length;
    if (DRY_RUN) {
      log(`\n🗺️   (dry-run) sitemap.xml: ${added} neue <url> (von ${renderedSlugs.length} Slugs, Rest bereits vorhanden)`);
    } else if (nextMap !== srcMap) {
      writeFileSync(SITEMAP_PATH, nextMap, "utf8");
      log(`\n🗺️   sitemap.xml: ${added} neue <url> ergänzt`);
    } else {
      log(`\n🗺️   sitemap.xml unverändert (alle Slugs bereits vorhanden)`);
    }
  }

  // 9b) /blog-Startseite (blog/index.html):
  //     (a) Karten der in DIESEM Lauf gerenderten Artikel einsortieren/aktualisieren,
  //     (b) anschließend aus clusters.js REKONZILIEREN (Backfill: alle live-Artikel,
  //         die noch KEINE Karte haben, werden ergänzt — bestehende bleiben unangetastet).
  //     Reihenfolge so, dass am Ende EIN konsistenter blog/index.html geschrieben wird.
  {
    const srcIdx = readFileSync(BLOG_INDEX_PATH, "utf8");
    let nextIdx = srcIdx;

    // (a) Karten der gerade gerenderten Artikel.
    const cards = deployed.map(({ article }) => {
      // Lesezeit aus dem gerenderten Content (gleiche Heuristik wie der Artikel).
      const contentHtml = blocksToHtml(article.contentBlocks || []);
      const readMin = estimateReadTime(contentHtml);
      return buildCardFromArticle({
        meta: article.meta,
        title: article.title,
        readMin,
      });
    });
    const byCat = (c) => cards.filter((k) => k.cat === c).map((k) => k.slug).join(", ") || "–";
    const renderedSummary = `learn: ${byCat("learn")}; gram: ${byCat("gram")}; prod: ${byCat("prod")}`;

    if (cards.length) {
      if (DRY_RUN) {
        log(`\n🏠  (dry-run) /blog: würde ${cards.length} Karten einfügen/aktualisieren (${renderedSummary})`);
      } else {
        nextIdx = upsertBlogCards(nextIdx, cards);
      }
    }

    // (b) Reconcile aus clusters.js (Backfill bereits live veröffentlichter Artikel).
    const { clusters, GLOBAL_PILLAR } = await import(CLUSTERS_PATH + `?t=${Date.now()}`);
    const recOpts = {
      readArticleHtml: (slug) => {
        const p = join(slugDir(slug), "index.html");
        return existsSync(p) ? readFileSync(p, "utf8") : null;
      },
      articleHtmlExists: (slug) => htmlExists(slug),
    };

    if (DRY_RUN) {
      // Dry-Run gegen die (potentiell schon mit gerenderten Karten ergänzte)
      // In-Memory-Variante simulieren, damit die Zählung realistisch ist.
      const simBase = upsertBlogCards(srcIdx, cards);
      const rec = reconcileBlogCardsFromClusters(simBase, { clusters, GLOBAL_PILLAR }, recOpts);
      log(`\n🏠  (dry-run) /blog reconcile: würde ${rec.added.length} fehlende Karten ergänzen (${rec.summary})`);
    } else {
      const rec = reconcileBlogCardsFromClusters(nextIdx, { clusters, GLOBAL_PILLAR }, recOpts);
      nextIdx = rec.html;

      if (nextIdx !== srcIdx) {
        writeFileSync(BLOG_INDEX_PATH, nextIdx, "utf8");
        const parts = [];
        if (cards.length) parts.push(`${cards.length} gerenderte Karten (${renderedSummary})`);
        if (rec.added.length) parts.push(`${rec.added.length} reconcile-Karten (${rec.summary})`);
        log(`\n🏠  blog/index.html aktualisiert: ${parts.join("; ") || "—"}`);
      } else {
        log(`\n🏠  blog/index.html unverändert (idempotent)`);
      }
    }
  }

  // 10) Writeback (GATED).
  log(`\n✍️   Writeback:`);
  if (!WRITEBACK) {
    log(`    writeback skipped (WRITEBACK != 1)`);
  } else if (DRY_RUN) {
    for (const d of deployed) {
      log(`    (dry-run) würde setzen: ${d.slug} → Live-URL=${BASE_LIVE}${d.slug}/, Veröffentlicht am=${today()}, Status=Veröffentlicht`);
    }
  } else {
    for (const d of deployed) {
      const page = d.article.trackerPage;
      // Idempotenz + Sicherheit: aktuellen Status frisch prüfen.
      let fresh;
      try {
        fresh = await fetchPage(page.id, KEY);
      } catch (e) {
        warn(`Writeback-Statusprüfung fehlgeschlagen für ${d.slug}: ${e.message}`);
        continue;
      }
      const status = readStatus(fresh);
      if (status === "Veröffentlicht") {
        log(`    ⏭  bereits Veröffentlicht: ${d.slug}`);
        continue;
      }
      if (status !== "Freigegeben") {
        warn(`Status ist "${status}" (nicht "Freigegeben") → kein Writeback: ${d.slug}`);
        continue;
      }
      try {
        await notionQuery(`/pages/${page.id}`, "PATCH", {
          properties: {
            "Live-URL": { url: `${BASE_LIVE}${d.slug}/` },
            "Veröffentlicht am": { date: { start: today() } },
            "Status": { select: { name: "Veröffentlicht" } },
            // Frisch über diese Pipeline veröffentlicht ⇒ ist auf neuem Standard.
            "Auf neuem Standard": { checkbox: true },
          },
        });
        log(`    ✓ ${d.slug} → Veröffentlicht`);
      } catch (e) {
        warn(`Writeback fehlgeschlagen für ${d.slug}: ${e.message}`);
      }
    }
  }

  log(`\n✅  Fertig. Gerendert: ${renderedSlugs.length}/${toPublish.length}` + (deferred.length ? ` · verschoben (Tageslimit): ${deferred.length}` : "") + `\n`);

  if (guardFailures.length) {
    console.error(
      `❌  Render-Guard: ${guardFailures.length} Artikel mit Struktur-/Chrome-Fehlern → NICHT veröffentlicht:\n   - ${guardFailures.join("\n   - ")}\n   Lauf schlägt fehl. Bitte Template/Inhalt prüfen.`
    );
    process.exit(1);
  }
}

// Nur ausführen, wenn direkt gestartet (nicht bei `import` aus den Unit-Tests).
const INVOKED_DIRECTLY =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (INVOKED_DIRECTLY) {
  main().catch((e) => {
    console.error("❌  Unerwarteter Fehler:", e);
    process.exit(1);
  });
}
