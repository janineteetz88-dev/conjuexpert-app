/**
 * clusters-upsert.mjs
 *
 * Reine String-Transformationen für:
 *   upsertClusters(srcText, derivedClusters)  → neuer clusters.js-Quelltext
 *   mergeSitemap(srcXml, slugs, today)         → neuer sitemap.xml-Text
 *
 * Idempotent. Bestehende (nicht aus Meta-Blöcken abgeleitete) Cluster und
 * GLOBAL_PILLAR bleiben unangetastet.
 *
 * derivedClusters: Array von
 *   { id, label, lang, color, hub: {slug,title,live}|null, spokes: [{slug,title,live}] }
 */

/* ─── clusters.js parsen (nur die exportierte Array-Struktur) ─────────────── */

// Wir parsen das `export const clusters = [ ... ];` Array per dynamischem Import
// im Aufrufer (er hat schon `clusters` geladen). Hier arbeiten wir rein
// textuell auf dem Quelltext, um Formatierung/Kommentare zu erhalten.

function serializeSpoke(s, indent) {
  return `${indent}{ slug: ${JSON.stringify(s.slug)}, title: ${JSON.stringify(s.title)}, live: ${s.live ? "true" : "false"} },`;
}

function serializeCluster(c, indent) {
  const i1 = indent;
  const i2 = indent + "  ";
  const i3 = indent + "    ";
  const lines = [];
  lines.push(`${i1}{`);
  lines.push(`${i2}id: ${JSON.stringify(c.id)},`);
  lines.push(`${i2}lang: ${JSON.stringify(c.lang || "de")},`);
  lines.push(`${i2}label: ${JSON.stringify(c.label || "Methodik")},`);
  lines.push(`${i2}color: ${JSON.stringify(c.color || "#34c759")},`);
  if (c.hub) {
    lines.push(`${i2}hub: {`);
    lines.push(`${i3}slug: ${JSON.stringify(c.hub.slug)},`);
    lines.push(`${i3}title: ${JSON.stringify(c.hub.title)},`);
    lines.push(`${i3}live: ${c.hub.live ? "true" : "false"},`);
    lines.push(`${i2}},`);
  } else {
    lines.push(`${i2}hub: null,`);
  }
  lines.push(`${i2}spokes: [`);
  for (const s of c.spokes || []) {
    lines.push(serializeSpoke(s, i3));
  }
  lines.push(`${i2}],`);
  if (c.verbPages) lines.push(`${i2}verbPages: ${JSON.stringify(c.verbPages)},`);
  lines.push(`${i1}},`);
  return lines.join("\n");
}

/**
 * Upsert auf Basis der bereits geladenen `existingClusters` (Array) +
 * `derivedClusters` (Array). Liefert das neue, vollständige Cluster-Array
 * (existierende Cluster erhalten, abgeleitete per id ersetzt/ergänzt).
 */
// Merge eines abgeleiteten Clusters in einen bestehenden, OHNE bestehende
// Daten zu zerstören: Spokes per slug upserten (live darf hochgezogen werden),
// Hub nur ersetzen wenn der abgeleitete einen Hub liefert. verbPages/Farben des
// Bestehenden bleiben, sofern der abgeleitete sie nicht explizit setzt.
function mergeOneCluster(existing, derived) {
  const merged = { ...existing };

  // Spokes per slug upserten.
  const spokes = (existing.spokes || []).map((s) => ({ ...s }));
  const bySlug = new Map(spokes.map((s, i) => [s.slug, i]));
  for (const ds of derived.spokes || []) {
    if (bySlug.has(ds.slug)) {
      const i = bySlug.get(ds.slug);
      spokes[i] = {
        ...spokes[i],
        title: ds.title || spokes[i].title,
        // live nur hochziehen, nie zurücknehmen
        live: spokes[i].live || ds.live,
      };
    } else {
      spokes.push(ds);
      bySlug.set(ds.slug, spokes.length - 1);
    }
  }
  merged.spokes = spokes;

  // Hub: nur ersetzen/ergänzen, wenn der abgeleitete einen hat.
  if (derived.hub) {
    if (existing.hub) {
      merged.hub = { ...existing.hub, ...derived.hub, live: existing.hub.live || derived.hub.live };
    } else {
      merged.hub = derived.hub;
    }
  }

  return merged;
}

export function mergeClusterArrays(existingClusters, derivedClusters) {
  const out = (existingClusters || []).map((c) => ({ ...c }));
  const byId = new Map(out.map((c, idx) => [c.id, idx]));

  for (const d of derivedClusters || []) {
    if (byId.has(d.id)) {
      // Kollision mit bestehendem Cluster → mergen, NICHT ersetzen.
      out[byId.get(d.id)] = mergeOneCluster(out[byId.get(d.id)], d);
    } else {
      out.push(d);
      byId.set(d.id, out.length - 1);
    }
  }
  return out;
}

/**
 * Ersetzt den `export const clusters = [ ... ];`-Block im Quelltext durch die
 * serialisierte Form von `clusterArray`. GLOBAL_PILLAR & alles andere bleibt.
 */
export function renderClustersFile(srcText, clusterArray) {
  const marker = "export const clusters = [";
  const startIdx = srcText.indexOf(marker);
  if (startIdx === -1) {
    throw new Error("clusters.js: 'export const clusters = [' nicht gefunden");
  }
  // Finde das passende schließende "];" durch Klammer-Zählung ab der "["
  const arrOpen = srcText.indexOf("[", startIdx);
  let depth = 0;
  let endIdx = -1;
  for (let i = arrOpen; i < srcText.length; i++) {
    const ch = srcText[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) throw new Error("clusters.js: Array-Ende nicht gefunden");

  // Optionales Semikolon nach ]
  let after = endIdx + 1;
  if (srcText[after] === ";") after++;

  const body = clusterArray.map((c) => serializeCluster(c, "  ")).join("\n");
  const replacement = `export const clusters = [\n${body}\n];`;

  return srcText.slice(0, startIdx) + replacement + srcText.slice(after);
}

/**
 * Bequemlichkeits-Wrapper: existierendes Array + abgeleitete → neuer Quelltext.
 */
export function upsertClusters(srcText, existingClusters, derivedClusters) {
  const merged = mergeClusterArrays(existingClusters, derivedClusters);
  return renderClustersFile(srcText, merged);
}

/* ─── sitemap.xml: neue Blog-URLs ergänzen (dedupe) ───────────────────────── */

function blogLoc(slug) {
  // slug: "/blog/foo" → "https://conjuexpert.app/blog/foo/"
  const clean = String(slug || "").replace(/\/+$/, "");
  return `https://conjuexpert.app${clean}/`;
}

/**
 * Fügt fehlende Blog-URLs vor </urlset> ein. Dedupe per <loc>. lastmod=today.
 * Format/Priority/changefreq wie bestehende Blog-Einträge.
 */
export function mergeSitemap(srcXml, slugs, today) {
  let xml = String(srcXml);
  const closeTag = "</urlset>";
  const closeIdx = xml.lastIndexOf(closeTag);
  if (closeIdx === -1) throw new Error("sitemap.xml: </urlset> nicht gefunden");

  const existingLocs = new Set(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
  );

  const toAdd = [];
  for (const slug of slugs || []) {
    const loc = blogLoc(slug);
    if (existingLocs.has(loc)) continue;
    existingLocs.add(loc); // dedupe auch innerhalb der neuen Liste
    toAdd.push(loc);
  }
  if (!toAdd.length) return xml;

  const entries = toAdd
    .map(
      (loc) =>
        `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`
    )
    .join("");

  return xml.slice(0, closeIdx) + entries + xml.slice(closeIdx);
}

/* ─── Meta-Blöcke → derivedClusters ──────────────────────────────────────── */

const LANG_BY_NAME = {
  spanisch: { lang: "es", label: "Spanisch", color: "#ff9f0a" },
  deutsch: { lang: "de", label: "Deutsch", color: "#ff3b5c" },
  französisch: { lang: "fr", label: "Französisch", color: "#a557ff" },
  franzoesisch: { lang: "fr", label: "Französisch", color: "#a557ff" },
  englisch: { lang: "en", label: "Englisch", color: "#0a84ff" },
  niederländisch: { lang: "nl", label: "Niederländisch", color: "#30c95a" },
  niederlaendisch: { lang: "nl", label: "Niederländisch", color: "#30c95a" },
};

const METHODIK = { lang: "de", label: "Methodik", color: "#34c759" };

function clusterIdFromMeta(meta) {
  // meta.cluster z. B. "methodik / sprachen-lernen" oder "lernmethode"
  const raw = String(meta.cluster || "").trim().toLowerCase();
  const slugified = raw
    .replace(/[\s/]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slugified || "methodik";
}

function langInfoFromMeta(meta) {
  const s = String(meta.sprache || "").trim().toLowerCase();
  if (s && LANG_BY_NAME[s]) return LANG_BY_NAME[s];
  return METHODIK;
}

/**
 * Aus einer Liste { meta, title, live } → derivedClusters.
 * Gruppiert nach cluster-id; Hub = typ==='hub'; Spokes darunter.
 */
export function metasToClusters(articleMetas) {
  const groups = new Map(); // id → { id, lang, label, color, hub, spokes[] }

  for (const a of articleMetas || []) {
    const meta = a.meta;
    if (!meta || !meta.slug) continue;
    const id = clusterIdFromMeta(meta);
    if (!groups.has(id)) {
      const li = langInfoFromMeta(meta);
      groups.set(id, {
        id,
        lang: li.lang,
        label: li.label,
        color: li.color,
        hub: null,
        spokes: [],
      });
    }
    const g = groups.get(id);
    const entry = { slug: meta.slug, title: a.title || meta.slug, live: !!a.live };
    if (meta.typ === "hub") {
      g.hub = entry;
    } else {
      g.spokes.push(entry);
    }
  }

  return [...groups.values()];
}
