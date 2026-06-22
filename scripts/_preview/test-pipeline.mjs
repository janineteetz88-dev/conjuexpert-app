/**
 * test-pipeline.mjs  —  LOKALE UNIT-TESTS (ohne Notion-API / ohne Key)
 *
 * Verifiziert die reinen Funktionen der Schritt-2-Pipeline anhand der Fixtures.
 * Die Fixtures (Markdown) werden in Notion-ähnliche Block-Shapes übersetzt
 * (inkl. toggle- UND ▸-Bullet-FAQ), um den Produktionspfad
 * (blocksToMetaText → parseMetaBlock → extractFaqAndContent → normalizeFaq)
 * realistisch durchzuspielen.
 *
 * Aufruf:  node scripts/_preview/test-pipeline.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseMetaBlock, validateMeta } from "../lib/meta-block.mjs";
import { normalizeFaq } from "../lib/faq.mjs";
import { slugifyHeading, addHeadingIdsAndToc, extractKeyTakeaways } from "../lib/geo-blocks.mjs";
import { blocksToMetaText, extractFaqAndContent } from "../lib/notion-adapt.mjs";
import {
  mergeClusterArrays,
  renderClustersFile,
  upsertClusters,
  mergeSitemap,
  metasToClusters,
} from "../lib/clusters-upsert.mjs";
import { sortArticles, publishedBlogToday } from "../publish-from-notion.mjs";
import {
  upsertBlogCards,
  catFromMeta,
  catFromCluster,
  thumbForCard,
  shortenSummary,
  reconcileBlogCardsFromClusters,
  hasCardForHref,
  extractMetaDescription,
} from "../lib/blog-index.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

/* ─── Mini-Test-Framework ────────────────────────────────────────────────── */

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    passed++;
  } else {
    failed++;
    failures.push(msg);
    console.error(`  ✗ ${msg}`);
  }
}
function eq(a, b, msg) {
  assert(a === b, `${msg} (erwartet ${JSON.stringify(b)}, war ${JSON.stringify(a)})`);
}

/* ─── Markdown-Fixture → Notion-Block-Shapes ─────────────────────────────── */
/*
 * Deckt die in den Fixtures vorkommenden Konstrukte ab, inkl. beider FAQ-Formate:
 *   - "**Meta…**"-Header (paragraph) + "- …"-Bullets (bulleted_list_item)
 *   - ## / ### Headings, Absätze, <callout>, > quote, - bullet
 *   - FAQ: <details><summary>**Q**</summary>A</details>  → toggle + _children
 *   - FAQ: "- ▸ **Q**" + eingerückte Antwort            → bulleted_list_item + _children
 *   - inline **bold**, *italic*, `code`, [text](url)
 */

function plain(t) {
  return { plain_text: t, annotations: {}, href: null };
}
function annotated(t, ann) {
  return { plain_text: t, annotations: ann, href: null };
}

function inlineToRichText(text) {
  const out = [];
  const re = /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(plain(text.slice(last, m.index)));
    const tok = m[0];
    if (tok.startsWith("`")) out.push(annotated(tok.slice(1, -1), { code: true }));
    else if (tok.startsWith("[")) {
      const lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      out.push({ plain_text: lm[1], annotations: {}, href: lm[2] });
    } else if (tok.startsWith("**")) out.push(annotated(tok.slice(2, -2), { bold: true }));
    else out.push(annotated(tok.slice(1, -1), { italic: true }));
    last = re.lastIndex;
  }
  if (last < text.length) out.push(plain(text.slice(last)));
  return out.filter((t) => t.plain_text !== "");
}

function fixtureToBlocks(md) {
  const text = md.replace(/<\/content>\s*$/i, "").trimEnd();
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let i = 0;
  let paraBuf = [];

  const flushPara = () => {
    const t = paraBuf.join(" ").trim();
    if (t) blocks.push({ type: "paragraph", paragraph: { rich_text: inlineToRichText(t) } });
    paraBuf = [];
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") { flushPara(); i++; continue; }

    // <details> … </details>  → toggle-Block mit _children (FAQ-Format 1)
    if (/^<details[\s>]/i.test(trimmed)) {
      flushPara();
      // sammle bis </details>
      const inner = [];
      i++;
      while (i < lines.length && !/<\/details>/i.test(lines[i])) { inner.push(lines[i]); i++; }
      if (i < lines.length) i++; // </details>
      const innerText = inner.join("\n");
      const sumM = innerText.match(/<summary>([\s\S]*?)<\/summary>/i);
      const qRaw = sumM ? sumM[1] : "";
      const q = qRaw.replace(/^\*\*/, "").replace(/\*\*$/, "").trim();
      const aRaw = innerText.replace(/<summary>[\s\S]*?<\/summary>/i, "").trim();
      blocks.push({
        type: "toggle",
        toggle: { rich_text: inlineToRichText(q) },
        _children: aRaw
          ? [{ type: "paragraph", paragraph: { rich_text: inlineToRichText(aRaw.replace(/\n/g, " ")) } }]
          : [],
      });
      continue;
    }

    // "- ▸ **Q**" + eingerückte Antwortzeile(n)  → bulleted_list_item + _children (FAQ-Format 2)
    if (/^[-*]\s+▸/.test(trimmed)) {
      flushPara();
      const qLine = trimmed.replace(/^[-*]\s+/, ""); // "▸ **Q**"
      // Folgezeilen, die eingerückt sind (mit Tab/Spaces) ODER keine neue Bullet sind = Antwort
      i++;
      const ansBuf = [];
      while (i < lines.length) {
        const l = lines[i];
        if (l.trim() === "") break;
        if (/^[-*]\s+▸/.test(l.trim())) break;
        ansBuf.push(l.trim());
        i++;
      }
      const rt = inlineToRichText(qLine); // enthält "▸ " + bold-Frage
      blocks.push({
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: rt },
        _children: ansBuf.length
          ? [{ type: "paragraph", paragraph: { rich_text: inlineToRichText(ansBuf.join(" ")) } }]
          : [],
      });
      continue;
    }

    if (/^###\s+/.test(trimmed)) {
      flushPara();
      blocks.push({ type: "heading_3", heading_3: { rich_text: inlineToRichText(trimmed.replace(/^###\s+/, "")) } });
      i++; continue;
    }
    if (/^##\s+/.test(trimmed)) {
      flushPara();
      blocks.push({ type: "heading_2", heading_2: { rich_text: inlineToRichText(trimmed.replace(/^##\s+/, "")) } });
      i++; continue;
    }

    if (/^<callout/i.test(trimmed)) {
      flushPara();
      const buf = [];
      const startRest = trimmed.replace(/^<callout[^>]*>/i, "");
      if (!/<\/callout>/i.test(trimmed)) {
        if (startRest.trim()) buf.push(startRest.trim());
        i++;
        while (i < lines.length && !/<\/callout>/i.test(lines[i])) { buf.push(lines[i]); i++; }
        if (i < lines.length) { const end = lines[i].replace(/<\/callout>.*$/i, ""); if (end.trim()) buf.push(end); i++; }
      } else { buf.push(startRest.replace(/<\/callout>.*$/i, "")); i++; }
      blocks.push({ type: "callout", callout: { rich_text: inlineToRichText(buf.join("\n").trim().replace(/\n/g, " ")) }, _children: [] });
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      flushPara();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) { buf.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
      blocks.push({ type: "quote", quote: { rich_text: inlineToRichText(buf.join(" ").trim()) } });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushPara();
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim()) && !/^[-*]\s+▸/.test(lines[i].trim())) {
        blocks.push({ type: "bulleted_list_item", bulleted_list_item: { rich_text: inlineToRichText(lines[i].trim().replace(/^[-*]\s+/, "")) } });
        i++;
      }
      continue;
    }

    paraBuf.push(trimmed);
    i++;
  }
  flushPara();
  return blocks;
}

/* ─── Tests ──────────────────────────────────────────────────────────────── */

const hubMd = readFileSync(join(__dirname, "hub-sprachen-lernen.md"), "utf8");
const spokeMd = readFileSync(join(__dirname, "spoke-lernmythen.md"), "utf8");

const hubBlocks = fixtureToBlocks(hubMd);
const spokeBlocks = fixtureToBlocks(spokeMd);

/* Test 1: parseMetaBlock + validateMeta über die Block-Adapter (Hub & Spoke) */
console.log("\n[1] parseMetaBlock + validateMeta (über blocksToMetaText)");
{
  const hubMeta = parseMetaBlock(blocksToMetaText(hubBlocks));
  const hubV = validateMeta(hubMeta);
  eq(hubMeta.slug, "/blog/sprachen-lernen", "Hub: slug");
  eq(hubMeta.typ, "hub", "Hub: typ");
  eq(hubMeta.pillarUp, "/blog/verben-konjugieren-lernen", "Hub: pillarUp");
  assert(hubMeta.cluster && hubMeta.cluster.length > 0, "Hub: cluster gesetzt");
  assert(hubMeta.metaDescription && hubMeta.metaDescription.length > 20, "Hub: metaDescription gesetzt");
  assert(hubMeta.downOrSiblings.length >= 5, `Hub: Spokes-Liste (war ${hubMeta.downOrSiblings.length})`);
  assert(hubV.ok, `Hub: validateMeta ok (${hubV.errors.join("; ")})`);

  const spokeMeta = parseMetaBlock(blocksToMetaText(spokeBlocks));
  const spokeV = validateMeta(spokeMeta);
  eq(spokeMeta.slug, "/blog/lernmythen-sprachenlernen", "Spoke: slug");
  eq(spokeMeta.typ, "spoke", "Spoke: typ");
  eq(spokeMeta.pillarUp, "/blog/sprachen-lernen", "Spoke: pillarUp");
  assert(spokeV.ok, `Spoke: validateMeta ok (${spokeV.errors.join("; ")})`);
}

/* Test 2: kaputter Meta-Block → Validierungsfehler */
console.log("[2] kaputter Meta-Block → validateMeta-Fehler");
{
  const broken = `**Meta (für Blog-Engine & Freigabe)**
- **Typ:** Spoke · **Säule:** Anwendung
- **Keyword:** Irgendwas`;
  const m = parseMetaBlock(broken);
  const v = validateMeta(m);
  assert(!v.ok, "kaputter Block: validateMeta NICHT ok");
  assert(v.errors.some((e) => /Slug/i.test(e)), "Fehler nennt Slug");
  assert(v.errors.some((e) => /Cluster/i.test(e)), "Fehler nennt Cluster");
  assert(v.errors.some((e) => /Description/i.test(e)), "Fehler nennt Meta-Description");
}

/* Test 3: normalizeFaq auf BEIDEN Formaten → gleiche Struktur */
console.log("[3] normalizeFaq: toggle (Hub) & ▸-Bullet (Spoke)");
{
  const { faqBlocks: hubFaq } = extractFaqAndContent(hubBlocks);
  const { faqBlocks: spokeFaq } = extractFaqAndContent(spokeBlocks);

  assert(hubFaq.every((b) => b.type === "toggle"), "Hub-FAQ sind toggle-Blöcke");
  assert(spokeFaq.every((b) => b.type === "bulleted_list_item"), "Spoke-FAQ sind bulleted_list_item-Blöcke");

  const hubItems = normalizeFaq(hubFaq);
  const spokeItems = normalizeFaq(spokeFaq);

  eq(hubItems.length, 4, "Hub: 4 FAQ-Items");
  eq(spokeItems.length, 3, "Spoke: 3 FAQ-Items");

  for (const set of [["Hub", hubItems], ["Spoke", spokeItems]]) {
    const [label, items] = set;
    for (const it of items) {
      assert(typeof it.q === "string" && it.q.length > 3, `${label}: q vorhanden`);
      assert(!/^▸/.test(it.q), `${label}: q ohne ▸-Marker ("${it.q.slice(0, 20)}")`);
      assert(!/^\*\*/.test(it.q), `${label}: q ohne **-Marker`);
      assert(typeof it.a_html === "string" && it.a_html.length > 10, `${label}: a_html vorhanden`);
      assert(typeof it.a_text === "string" && it.a_text.length > 10, `${label}: a_text vorhanden`);
    }
  }
  // gleiche Schlüssel-Struktur
  const keys = (o) => Object.keys(o).sort().join(",");
  eq(keys(hubItems[0]), keys(spokeItems[0]), "gleiche Item-Struktur (Keys)");
}

/* Test 4: extractFaqAndContent entfernt Meta-Block + FAQ-Heading aus Content */
console.log("[4] extractFaqAndContent: Meta + FAQ aus Content entfernt");
{
  const { contentBlocks, faqBlocks } = extractFaqAndContent(hubBlocks);
  // kein Meta-Header mehr im Content
  const hasMeta = contentBlocks.some((b) =>
    b.type === "paragraph" && (b.paragraph.rich_text || []).map((t) => t.plain_text).join("").includes("Meta (für Blog-Engine")
  );
  assert(!hasMeta, "Content enthält keinen Meta-Block mehr");
  // keine FAQ-Heading mehr
  const hasFaqH = contentBlocks.some((b) =>
    (b.type === "heading_2" || b.type === "heading_3") &&
    /FAQ/i.test((b.heading_2?.rich_text || b.heading_3?.rich_text || []).map((t) => t.plain_text).join(""))
  );
  assert(!hasFaqH, "Content enthält keine FAQ-Heading mehr");
  // keine toggle im Content
  assert(!contentBlocks.some((b) => b.type === "toggle"), "Content enthält keine toggle (FAQ) mehr");
  assert(faqBlocks.length === 4, "4 FAQ-Blöcke abgetrennt");
  // erster Content-Block sollte der erste Callout/Absatz sein
  assert(contentBlocks.length > 5, "Content hat noch substanzielle Blöcke");
}

/* Test 5: clusters.js-Upsert — Verb-Cluster bleiben, Methodik kommt dazu, idempotent */
console.log("[5] clusters.js Upsert (erhalten + ergänzen + idempotent)");
{
  const clustersPath = join(__dirname, "..", "..", "src", "data", "clusters.js");
  const src = readFileSync(clustersPath, "utf8");
  const { clusters: existing, GLOBAL_PILLAR } = await import(clustersPath);

  const hubMeta = parseMetaBlock(blocksToMetaText(hubBlocks));
  const spokeMeta = parseMetaBlock(blocksToMetaText(spokeBlocks));
  const derived = metasToClusters([
    { meta: hubMeta, title: "Sprachen lernen", live: true },
    { meta: spokeMeta, title: "Lernmythen", live: true },
  ]);
  assert(derived.length >= 1, "mindestens ein abgeleiteter Cluster");

  const out1 = upsertClusters(src, existing, derived);

  // Verb-Cluster-IDs müssen erhalten bleiben
  for (const id of ["spanisch-verben", "deutsch-verben", "franzoesisch-verben", "englisch-verben", "niederlaendisch-verben"]) {
    assert(out1.includes(`id: "${id}"`), `Verb-Cluster erhalten: ${id}`);
  }
  // bestehende Verb-Spokes erhalten
  assert(out1.includes("/blog/subjuntivo-spanisch"), "bestehender Spoke erhalten (subjuntivo)");
  assert(out1.includes("/blog/passe-compose-imparfait"), "bestehender Spoke erhalten (passe-compose)");
  // GLOBAL_PILLAR unangetastet
  assert(out1.includes("export const GLOBAL_PILLAR"), "GLOBAL_PILLAR erhalten");
  assert(out1.includes("/blog/verben-konjugieren-lernen"), "GLOBAL_PILLAR-Slug erhalten");
  // Methodik-Cluster + Hub-Slug ergänzt
  assert(out1.includes("/blog/sprachen-lernen"), "Hub-Slug ergänzt");
  assert(out1.includes("/blog/lernmythen-sprachenlernen"), "Spoke-Slug ergänzt");

  // Das Ergebnis muss valides JS sein → re-importierbar via data URL
  const mod1 = await import("data:text/javascript;base64," + Buffer.from(out1).toString("base64"));
  assert(Array.isArray(mod1.clusters), "Ergebnis ist valides JS-Modul (clusters Array)");
  // Delta-robust: nur Cluster zählen, die noch nicht in existing sind (auf main bereits upsertet → 0 neu).
  const newClusterIds = derived.filter((d) => !existing.some((e) => e.id === d.id)).length;
  assert(mod1.clusters.length === existing.length + newClusterIds, `Cluster-Anzahl konsistent (${mod1.clusters.length})`);

  // Idempotenz: nochmal anwenden (auf das schon-gemergte Ergebnis) ändert nichts.
  const out2 = upsertClusters(out1, mod1.clusters, derived);
  eq(out2, out1, "Upsert idempotent (zweiter Lauf identisch)");

  // Nicht-destruktiv bei ID-Kollision: bestehende Verb-Spokes bleiben erhalten,
  // wenn ein abgeleiteter Cluster dieselbe id wie ein Verb-Cluster trägt.
  const collide = [{ id: "spanisch-verben", lang: "es", label: "Spanisch", color: "#ff9f0a", hub: null, spokes: [{ slug: "/blog/neuer-es-spoke", title: "Neu", live: true }] }];
  const merged = mergeClusterArrays(existing, collide);
  const sp = merged.find((c) => c.id === "spanisch-verben");
  eq(merged.filter((c) => c.id === "spanisch-verben").length, 1, "keine doppelte spanisch-verben-id");
  assert(sp.spokes.some((s) => s.slug === "/blog/subjuntivo-spanisch"), "bestehender Verb-Spoke erhalten bei Kollision");
  assert(sp.spokes.some((s) => s.slug === "/blog/neuer-es-spoke"), "neuer Spoke ergänzt bei Kollision");
  eq(sp.hub?.slug, "/blog/spanisch-verben-konjugieren", "Verb-Hub bleibt bei Kollision");
  eq(sp.verbPages, "/konjugation/es/", "verbPages bleibt bei Kollision");
}

/* Test 6: sitemap-Merge — keine Duplikate, valides XML */
console.log("[6] sitemap-Merge (dedupe + valides XML)");
{
  const sitemapPath = join(__dirname, "..", "..", "sitemap.xml");
  const src = readFileSync(sitemapPath, "utf8");
  // Synthetische Test-Slugs (nicht in der echten sitemap.xml), damit der Delta-Check
  // zustands-unabhängig ist; unregelmaessige-* als bereits vorhandene Probe (Dedupe).
  const slugs = ["/blog/test-sitemap-aaa", "/blog/test-sitemap-bbb", "/blog/unregelmaessige-verben-spanisch"];
  const TODAY = "2026-06-18";

  const out1 = mergeSitemap(src, slugs, TODAY);
  // neue Slugs vorhanden
  assert(out1.includes("https://conjuexpert.app/blog/test-sitemap-aaa/"), "neue URL test-sitemap-aaa");
  assert(out1.includes("https://conjuexpert.app/blog/test-sitemap-bbb/"), "neue URL test-sitemap-bbb");
  // bereits vorhandene Slug NICHT dupliziert
  const countUnreg = (out1.match(/blog\/unregelmaessige-verben-spanisch\//g) || []).length;
  // (kommt im <loc> einmal vor — keine zweite Ergänzung)
  const locUnreg = (out1.match(/<loc>https:\/\/conjuexpert\.app\/blog\/unregelmaessige-verben-spanisch\/<\/loc>/g) || []).length;
  eq(locUnreg, 1, "vorhandene URL nicht dupliziert");
  // genau 2 neue <url> ergänzt
  const before = (src.match(/<loc>/g) || []).length;
  const after = (out1.match(/<loc>/g) || []).length;
  eq(after - before, 2, "genau 2 neue <loc>");
  // valides XML: schließt mit </urlset>, lastmod gesetzt
  assert(out1.trimEnd().endsWith("</urlset>"), "XML endet mit </urlset>");
  assert(out1.includes(`<lastmod>${TODAY}</lastmod>`), "lastmod=heute gesetzt");
  // grobe Wohlgeformtheit: gleiche Anzahl <url> wie </url>
  eq((out1.match(/<url>/g) || []).length, (out1.match(/<\/url>/g) || []).length, "<url>/</url> balanciert");

  // Idempotenz
  const out2 = mergeSitemap(out1, slugs, TODAY);
  eq(out2, out1, "sitemap-Merge idempotent");
}

/* Test 7: Sortierung — Nummer aufsteigend, Hub vor Spoke im selben Cluster */
console.log("[7] Sortierung (Nummer ↑, Hub vor Spoke)");
{
  const items = [
    { nummer: 2, meta: { typ: "spoke", cluster: "methodik", slug: "/blog/b" } },
    { nummer: 2, meta: { typ: "hub", cluster: "methodik", slug: "/blog/a" } },
    { nummer: 1, meta: { typ: "spoke", cluster: "x", slug: "/blog/first" } },
    { nummer: 3, meta: { typ: "hub", cluster: "y", slug: "/blog/last" } },
  ];
  const sorted = sortArticles(items);
  eq(sorted[0].meta.slug, "/blog/first", "Nummer 1 zuerst");
  eq(sorted[1].meta.slug, "/blog/a", "gleiche Nummer: Hub vor Spoke");
  eq(sorted[2].meta.slug, "/blog/b", "gleiche Nummer: Spoke danach");
  eq(sorted[3].meta.slug, "/blog/last", "Nummer 3 zuletzt");
}

/* Test 8: upsertBlogCards — richtige Sektion, idempotent, additiv, de-only-EN-Fallback */
console.log("[8] upsertBlogCards (Sektion + idempotent + additiv)");
{
  const indexPath = join(__dirname, "..", "..", "blog", "index.html");
  const src = readFileSync(indexPath, "utf8");

  const countPosts = (h) => (h.match(/<a class="post"/g) || []).length;
  const before = countPosts(src);

  const cards = [
    {
      slug: "/blog/aktiv-erinnern-lernmethode",
      titleDe: "Aktiv erinnern: die Lernmethode, die wirklich hält",
      summaryDe: "So nutzt du Active Recall beim Verben lernen.",
      cat: "learn",
      lang: "all",
      langTag: "5 Sprachen",
      colorVar: "--muted",
      thumb: "learn-1.png",
      readMin: 7,
    },
    {
      slug: "/blog/futur-simple-franzoesisch",
      titleDe: "Futur simple Französisch: Bildung & Ausnahmen",
      summaryDe: "Endungen, unregelmäßige Stämme und ein Merktrick.",
      cat: "gram",
      lang: "fr",
      langTag: "FR",
      colorVar: "--fr",
      thumb: "gram-es-2.png",
      readMin: 6,
    },
    {
      slug: "/blog/app-vergleich-2026",
      titleDe: "Der große Sprachlern-App-Vergleich 2026",
      summaryDe: "Welche App passt zu dir? Ein ehrlicher Überblick.",
      cat: "prod",
      lang: "all",
      langTag: "5 Sprachen",
      colorVar: "--muted",
      thumb: "prod-1.png",
      readMin: 8,
    },
  ];

  const out1 = upsertBlogCards(src, cards);

  // genau 3 neue .post-Karten
  eq(countPosts(out1) - before, 3, "genau 3 neue .post-Karten");

  // bestehende Karten weiterhin vorhanden
  assert(out1.includes('href="/blog/subjuntivo-spanisch/"'), "bestehende Karte erhalten (subjuntivo)");
  assert(out1.includes('href="/blog/unsere-geschichte/"'), "bestehende Karte erhalten (unsere-geschichte)");
  assert(out1.includes('href="/blog/unregelmaessige-verben-spanisch/"'), "bestehende Karte erhalten (unregelmaessige)");

  // hrefs der neuen Karten vorhanden
  assert(out1.includes('href="/blog/aktiv-erinnern-lernmethode/"'), "learn-href vorhanden");
  assert(out1.includes('href="/blog/futur-simple-franzoesisch/"'), "gram-href vorhanden");
  assert(out1.includes('href="/blog/app-vergleich-2026/"'), "prod-href vorhanden");

  // data-cat korrekt gesetzt
  assert(/href="\/blog\/aktiv-erinnern-lernmethode\/" data-cat="learn"/.test(out1), "learn: data-cat=learn");
  assert(/href="\/blog\/futur-simple-franzoesisch\/" data-cat="gram"/.test(out1), "gram: data-cat=gram");
  assert(/href="\/blog\/app-vergleich-2026\/" data-cat="prod"/.test(out1), "prod: data-cat=prod");

  // Karte landet in der RICHTIGEN Sektion:
  // Sektion-Range per id finden und prüfen, dass der href darin liegt.
  function sectionContains(html, id, href) {
    const m = new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>`).exec(html);
    if (!m) return false;
    let pos = m.index + m[0].length;
    let depth = 1;
    const re = /<(\/?)section\b[^>]*>/g;
    re.lastIndex = pos;
    let t, end = html.length;
    while ((t = re.exec(html)) !== null) {
      depth += t[1] === "/" ? -1 : 1;
      if (depth === 0) { end = t.index; break; }
    }
    return html.slice(m.index, end).includes(href);
  }
  assert(sectionContains(out1, "lernen", '/blog/aktiv-erinnern-lernmethode/'), "learn-Karte in #lernen");
  assert(sectionContains(out1, "grammatik", '/blog/futur-simple-franzoesisch/'), "gram-Karte in #grammatik");
  assert(sectionContains(out1, "produkt", '/blog/app-vergleich-2026/'), "prod-Karte in #produkt");
  // negativ: learn-Karte NICHT in #grammatik
  assert(!sectionContains(out1, "grammatik", '/blog/aktiv-erinnern-lernmethode/'), "learn-Karte NICHT in #grammatik");

  // de-only → EN-Fallback (deutscher Text in beiden data-l-Spans)
  assert(
    out1.includes('<span data-l="de">Futur simple Französisch: Bildung &amp; Ausnahmen</span><span data-l="en">Futur simple Französisch: Bildung &amp; Ausnahmen</span>'),
    "de-only-EN-Fallback im h3"
  );

  // Idempotenz: zweimaliges Anwenden = identisch, keine Duplikate
  const out2 = upsertBlogCards(out1, cards);
  eq(out2, out1, "upsertBlogCards idempotent (zweiter Lauf identisch)");
  eq(countPosts(out2), countPosts(out1), "keine Duplikate beim zweiten Lauf");

  // Mapping-Helfer deterministisch
  eq(catFromMeta({ cluster: "methodik / sprachen-lernen" }), "learn", "catFromMeta: methodik → learn");
  eq(catFromMeta({ cluster: "lernmethode" }), "learn", "catFromMeta: lernmethode → learn");
  eq(catFromMeta({ cluster: "spanisch-verben" }), "gram", "catFromMeta: verb-cluster → gram");
  eq(catFromMeta({ cluster: "app-vergleich" }), "prod", "catFromMeta: app-vergleich → prod");

  eq(thumbForCard("learn", "nl", "/blog/x"), "learn-nl.png", "thumb: learn+nl");
  eq(thumbForCard("learn", "de", "/blog/x"), "learn-1.png", "thumb: learn default");
  eq(thumbForCard("gram", "es", "/blog/x"), "gram-es-1.png", "thumb: gram+es");
  eq(thumbForCard("prod", "es", "/blog/x"), "prod-es.png", "thumb: prod+es");
  eq(thumbForCard("prod", null, "/blog/x"), "prod-1.png", "thumb: prod default");

  assert(shortenSummary("a".repeat(200)).length <= 111, "shortenSummary kürzt auf ~110");
  eq(shortenSummary("kurz"), "kurz", "shortenSummary lässt kurze Texte unangetastet");
}

/* Test 9: reconcileBlogCardsFromClusters — Backfill aus clusters.js */
console.log("[9] reconcileBlogCardsFromClusters (Backfill + erhalten + idempotent)");
{
  const indexPath = join(__dirname, "..", "..", "blog", "index.html");
  const src = readFileSync(indexPath, "utf8");

  const countPosts = (h) => (h.match(/<a class="post"/g) || []).length;
  const before = countPosts(src);

  // Synthetisches clusters-Objekt (Methodik-Cluster gibt es auf diesem Branch
  // in clusters.js noch nicht). Enthält bewusst auch einen bereits live
  // kuratierten Spoke (subjuntivo-spanisch), der NICHT angefasst werden darf.
  // Synthetische test-*-Slugs, die garantiert NICHT in der echten blog/index.html
  // vorkommen (sonst koppeln die Asserts an den Live-Stand). subjuntivo-spanisch
  // ist bewusst ein bereits kuratierter Slug (Probe: darf nicht erneut ergänzt werden).
  const clusters = [
    {
      id: "methodik-sprachen-lernen",
      lang: null,
      label: "Methodik",
      hub: { slug: "/blog/test-recon-hub", title: "Test Hub", live: true },
      spokes: [
        { slug: "/blog/test-recon-spoke-a", title: "Lernmythen", live: true },
        { slug: "/blog/test-recon-spoke-b", title: "Aktiv erinnern", live: true },
        { slug: "/blog/test-recon-geplant", title: "Geplant", live: false }, // NICHT live → keine Karte
      ],
    },
    {
      id: "spanisch-verben",
      lang: "es",
      label: "Spanisch",
      hub: { slug: "/blog/test-recon-verb-hub", title: "Spanische Verben", live: false }, // hub nicht live
      spokes: [
        { slug: "/blog/subjuntivo-spanisch", title: "Subjuntivo Spanisch", live: true }, // existiert bereits als Karte!
        { slug: "/blog/test-recon-verb", title: "Pretérito Spanisch", live: true },       // neu → gram
      ],
    },
  ];
  const GLOBAL_PILLAR = { slug: "/blog/test-recon-pillar", title: "Verben konjugieren" };

  const stubHtml = (slug) =>
    `<meta name="description" content="Stub-Beschreibung für ${slug}.">`;
  const recOpts = {
    readArticleHtml: (slug) => stubHtml(slug),
    // 404-Gate: alle synthetischen Artikel "existieren" als HTML, nur der Pillar nicht.
    articleHtmlExists: (slug) => slug !== "/blog/test-recon-pillar",
  };

  const r1 = reconcileBlogCardsFromClusters(src, { clusters, GLOBAL_PILLAR }, recOpts);
  const out1 = r1.html;

  // Erwartet ergänzt: hub (learn), spoke-a (learn), spoke-b (learn), test-recon-verb (gram).
  // NICHT: subjuntivo (existiert), geplant (nicht live), verb-hub (nicht live), pillar (HTML fehlt).
  eq(r1.added.length, 4, "genau 4 fehlende Karten ergänzt");
  eq(countPosts(out1) - before, 4, "genau 4 neue .post-Karten");

  // korrekte Sektion / data-cat / href
  function sectionContains(html, id, href) {
    const m = new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>`).exec(html);
    if (!m) return false;
    let pos = m.index + m[0].length;
    let depth = 1;
    const re = /<(\/?)section\b[^>]*>/g;
    re.lastIndex = pos;
    let t, end = html.length;
    while ((t = re.exec(html)) !== null) {
      depth += t[1] === "/" ? -1 : 1;
      if (depth === 0) { end = t.index; break; }
    }
    return html.slice(m.index, end).includes(href);
  }

  // Methodik-Cluster → learn-Karten in #lernen
  assert(sectionContains(out1, "lernen", "/blog/test-recon-hub/"), "hub → learn in #lernen");
  assert(sectionContains(out1, "lernen", "/blog/test-recon-spoke-a/"), "spoke → learn in #lernen");
  assert(sectionContains(out1, "lernen", "/blog/test-recon-spoke-b/"), "spoke → learn in #lernen");
  assert(/href="\/blog\/test-recon-hub\/" data-cat="learn"/.test(out1), "hub: data-cat=learn");

  // Verb-Cluster (live spoke) → gram in #grammatik
  assert(sectionContains(out1, "grammatik", "/blog/test-recon-verb/"), "verb-spoke → gram in #grammatik");
  assert(/href="\/blog\/test-recon-verb\/" data-cat="gram"/.test(out1), "verb-spoke: data-cat=gram");
  assert(!sectionContains(out1, "lernen", "/blog/test-recon-verb/"), "verb-spoke NICHT in #lernen");

  // bereits existierende Karten unangetastet & NICHT dupliziert
  assert(hasCardForHref(src, "/blog/subjuntivo-spanisch"), "Vorbedingung: subjuntivo-Karte existiert bereits");
  eq(r1.added.filter((a) => a.slug === "/blog/subjuntivo-spanisch").length, 0, "subjuntivo NICHT erneut ergänzt");
  eq((out1.match(/href="\/blog\/subjuntivo-spanisch\/"/g) || []).length,
     (src.match(/href="\/blog\/subjuntivo-spanisch\/"/g) || []).length,
     "subjuntivo-Karte nicht dupliziert");
  // kuratierte Karten bleiben
  assert(out1.includes('href="/blog/unsere-geschichte/"'), "kuratierte Karte erhalten (unsere-geschichte)");

  // nicht-live + nicht-existierender Pillar NICHT ergänzt
  assert(!out1.includes('href="/blog/test-recon-geplant/"'), "nicht-live Spoke nicht ergänzt");
  assert(!out1.includes('href="/blog/test-recon-verb-hub/"'), "nicht-live Hub nicht ergänzt");
  assert(!hasCardForHref(out1, "/blog/test-recon-pillar"), "GLOBAL_PILLAR ohne HTML nicht ergänzt");

  // Beschreibung aus Stub-Meta übernommen (gekürzt)
  assert(out1.includes("Stub-Beschreibung für /blog/test-recon-hub"), "summary aus Meta-Description (Stub)");

  // summary-Log-Format
  assert(/learn: .+; gram: .+; prod: .+/.test(r1.summary), "summary-Format korrekt");

  // GLOBAL_PILLAR ergänzt, WENN HTML existiert
  const r1b = reconcileBlogCardsFromClusters(src, { clusters, GLOBAL_PILLAR }, {
    readArticleHtml: stubHtml,
    articleHtmlExists: () => true,
  });
  assert(hasCardForHref(r1b.html, "/blog/test-recon-pillar"), "GLOBAL_PILLAR ergänzt wenn HTML existiert");

  // Idempotenz: zweimaliges Anwenden = bit-identisch
  const r2 = reconcileBlogCardsFromClusters(out1, { clusters, GLOBAL_PILLAR }, recOpts);
  eq(r2.html, out1, "reconcile idempotent (zweiter Lauf bit-identisch)");
  eq(r2.added.length, 0, "zweiter Lauf ergänzt nichts mehr");
  eq(countPosts(r2.html), countPosts(out1), "keine Duplikate beim zweiten Lauf");

  // Fallback-Beschreibung aus Titel, wenn kein HTML/Meta
  const rFallback = reconcileBlogCardsFromClusters(src, { clusters, GLOBAL_PILLAR }, {
    readArticleHtml: () => null, // kein HTML-Inhalt → Titel-Fallback in der Beschreibung
    articleHtmlExists: (slug) => slug !== "/blog/test-recon-pillar",
  });
  assert(rFallback.html.includes("Lernmythen"), "Fallback-Karte trägt Titel");
  assert(rFallback.added.length === 4, "Fallback: trotzdem 4 Karten ergänzt");

  // catFromCluster-Helfer deterministisch
  eq(catFromCluster({ id: "methodik-sprachen-lernen" }, "/blog/x"), "learn", "catFromCluster: methodik → learn");
  eq(catFromCluster({ id: "x" }, "/blog/aktiv-erinnern-lernmethode"), "learn", "catFromCluster: lernmethode im slug → learn");
  eq(catFromCluster({ id: "spanisch-verben" }, "/blog/preterito-spanisch"), "gram", "catFromCluster: verb → gram");
  eq(catFromCluster({ id: "produkt" }, "/blog/sprachlern-app-vergleich"), "prod", "catFromCluster: app-signal → prod");

  // extractMetaDescription
  eq(extractMetaDescription('<meta name="description" content="Hallo Welt">'), "Hallo Welt", "extractMetaDescription liest content");
  eq(extractMetaDescription("<html>no meta</html>"), "", "extractMetaDescription leer ohne meta");
}

/* Test 10: Tageslimit — publishedBlogToday + Budget-Slicing */
console.log("[10] Tageslimit (publishedBlogToday + Budget)");
{
  const TODAY = "2026-06-18";
  const sm = `<?xml version="1.0"?><urlset>
  <url><loc>https://conjuexpert.app/blog/a/</loc><lastmod>2026-06-18</lastmod></url>
  <url><loc>https://conjuexpert.app/blog/b/</loc><lastmod>2026-06-18</lastmod></url>
  <url><loc>https://conjuexpert.app/blog/c/</loc><lastmod>2026-06-01</lastmod></url>
  <url><loc>https://conjuexpert.app/konjugation/es/hablar/</loc><lastmod>2026-06-18</lastmod></url>
  </urlset>`;
  eq(publishedBlogToday(sm, TODAY), 2, "zählt genau 2 heutige /blog/-Artikel (konjugation/ ignoriert)");
  eq(publishedBlogToday(sm, "2026-06-01"), 1, "zählt 1 für anderes Datum");
  eq(publishedBlogToday("", TODAY), 0, "leere Sitemap → 0");

  // Budget-Slicing wie in main(): budget = max(0, MAX - alreadyToday)
  const MAX = 3;
  const sliceCount = (alreadyToday, newCount) =>
    Math.min(newCount, Math.max(0, MAX - alreadyToday));
  eq(sliceCount(0, 5), 3, "0 heute, 5 neu → 3 online");
  eq(sliceCount(2, 5), 1, "2 heute, 5 neu → 1 online");
  eq(sliceCount(3, 5), 0, "3 heute → 0 weitere");
  eq(sliceCount(10, 5), 0, "10 heute (Backfill) → 0 weitere");
}

/* Test 11: GEO-Bausteine — Heading-IDs/TOC + „Das Wichtigste in Kürze"-Box */
console.log("[11] GEO-Bausteine (TOC + Das-Wichtigste-Box)");
{
  // slugifyHeading: lesbar, akzentfrei, eindeutig
  eq(slugifyHeading("Was ist der Subjuntivo?"), "was-ist-der-subjuntivo", "slug: Satzzeichen weg");
  eq(slugifyHeading("Présent & Passé — Übung"), "present-passe-ubung", "slug: Akzente/Sonderzeichen normalisiert");
  eq(slugifyHeading(""), "abschnitt", "slug: leerer Titel → Fallback");

  // addHeadingIdsAndToc: IDs an jede H2, TOC erst ab 3 Überschriften
  const two = addHeadingIdsAndToc("<h2>Eins</h2><p>x</p><h2>Zwei</h2>", { minToc: 3 });
  assert(/<h2 id="eins">/.test(two.html) && /<h2 id="zwei">/.test(two.html), "2×H2 bekommen IDs");
  eq(two.tocHtml, "", "TOC erst ab minToc (2 < 3 → keins)");

  const three = addHeadingIdsAndToc("<h2>Eins</h2><h2>Zwei</h2><h2>Drei</h2>", { minToc: 3 });
  assert(three.tocHtml.includes('class="toc"'), "3×H2 → TOC erzeugt");
  eq((three.tocHtml.match(/<li>/g) || []).length, 3, "TOC hat 3 Einträge");
  assert(three.tocHtml.includes('href="#eins"'), "TOC verlinkt auf H2-Anker");

  // doppelte Titel → eindeutige IDs (kein doppeltes id="x")
  const dup = addHeadingIdsAndToc("<h2>Beispiel</h2><h2>Beispiel</h2><h2>Beispiel</h2>", { minToc: 3 });
  assert(/id="beispiel"/.test(dup.html) && /id="beispiel-2"/.test(dup.html) && /id="beispiel-3"/.test(dup.html), "doppelte Titel → eindeutige IDs");

  // bestehende ID wird respektiert (FAQ/Quellen behalten ihren Anker)
  const keep = addHeadingIdsAndToc('<h2 id="faq">Häufige Fragen</h2>', { minToc: 1 });
  assert(keep.html.includes('<h2 id="faq">'), "bestehende ID bleibt erhalten");

  // extractKeyTakeaways: markierter Callout → Box (ohne Emoji/„TL;DR"), aus Body entfernt
  const fakeBTH = (bs) => "<ul>" + bs.map((b) => "<li>" + (b.bulleted_list_item?.rich_text || []).map((t) => t.plain_text).join("") + "</li>").join("") + "</ul>";
  const blocks = [
    { type: "callout", callout: { rich_text: [{ plain_text: "🎯 Das Wichtigste in Kürze" }] }, _children: [
      { type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ plain_text: "Punkt eins" }] } },
    ] },
    { type: "paragraph", paragraph: { rich_text: [{ plain_text: "Fließtext" }] } },
  ];
  const ex = extractKeyTakeaways(blocks, fakeBTH);
  assert(ex.boxHtml.includes('class="keytakeaways"'), "Box wird erzeugt");
  assert(ex.boxHtml.includes("Das Wichtigste in Kürze"), "Box trägt feste Überschrift");
  assert(!/🎯/.test(ex.boxHtml), "Box ohne Emoji");
  assert(!/TL;?\s*DR/i.test(ex.boxHtml), "Box ohne TL;DR-Wording");
  assert(ex.boxHtml.includes("Punkt eins"), "Box übernimmt Stichpunkte aus Kindern");
  eq(ex.blocks.length, 1, "markierter Callout aus dem Body entfernt");

  // kein markierter Callout → kein Eingriff
  const noBox = extractKeyTakeaways([{ type: "paragraph", paragraph: { rich_text: [{ plain_text: "nur Text" }] } }], fakeBTH);
  eq(noBox.boxHtml, "", "ohne Trigger keine Box");
  eq(noBox.blocks.length, 1, "ohne Trigger Body unverändert");

  // alternativer Trigger „Kurz gesagt" + Inline-Text statt Kinder
  const inline = extractKeyTakeaways([{ type: "callout", callout: { rich_text: [{ plain_text: "Kurz gesagt: regelmäßig schlägt selten." }] }, _children: [] }], fakeBTH);
  assert(inline.boxHtml.includes("regelmäßig schlägt selten"), "Inline-Trigger-Text landet in der Box");
  assert(!inline.boxHtml.includes("Kurz gesagt"), "Trigger-Label aus Box-Text entfernt");
}

/* ─── Ergebnis ───────────────────────────────────────────────────────────── */

console.log(`\n${failed === 0 ? "✅" : "❌"}  Tests: ${passed} grün, ${failed} rot`);
if (failed > 0) {
  console.log("\nFehlgeschlagen:");
  for (const f of failures) console.log("  - " + f);
  process.exit(1);
}
console.log();
