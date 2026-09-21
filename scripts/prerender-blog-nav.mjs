#!/usr/bin/env node
/**
 * prerender-blog-nav.mjs
 *
 * Generiert statisches HTML für Breadcrumb + RelatedCards aus clusters.js
 * und schreibt es direkt in die Blog-Artikel-HTML-Dateien.
 *
 * Aufruf: node scripts/prerender-blog-nav.mjs blog/subjuntivo-spanisch/index.html ...
 *
 * Idempotent: verwendet HTML-Kommentar-Marker als Anker:
 *   <!-- CLUSTER:CRUMBS -->...<div class="crumbs">...</div><!-- /CLUSTER:CRUMBS -->
 *   <!-- CLUSTER:RELATED -->...<section class="block related">...</section><!-- /CLUSTER:RELATED -->
 *
 * Auf dem ersten Durchlauf werden die Marker automatisch um die
 * bestehenden Elemente gesetzt.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// clusters.js direkt importieren (Node ESM)
const { clusters, GLOBAL_PILLAR, findPage } = await import(
  join(ROOT, "src/data/clusters.js")
);

/* ─── HTML-Generatoren ───────────────────────────────────────────────────── */

function esc(s) {
  return String(s || "").replace(/[<>&"]/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;",
  })[c]);
}

function sep() {
  return '<span aria-hidden="true">›</span>';
}

function generateCrumbs(type, cluster, spoke) {
  const items = [];

  items.push(`<a href="/blog/">Blog</a>`);

  if (type === "globalPillar") {
    items.push(`<span class="cat gram"><span class="d"></span>${esc(GLOBAL_PILLAR.title)}</span>`);

  } else if (type === "hub" && cluster) {
    items.push(`<a href="${GLOBAL_PILLAR.slug}/">${esc(GLOBAL_PILLAR.title)}</a>`);
    items.push(`<span class="cat gram"><span class="d"></span>${esc(cluster.hub.title)}</span>`);

  } else if (type === "spoke" && cluster && spoke) {
    items.push(`<a href="${GLOBAL_PILLAR.slug}/">${esc(GLOBAL_PILLAR.title)}</a>`);
    if (cluster.hub && cluster.hub.live) {
      items.push(`<a href="${cluster.hub.slug}/">${esc(cluster.hub.title)}</a>`);
    }
    items.push(`<span class="cat gram"><span class="d"></span>${esc(spoke.title)}</span>`);
  }

  const inner = items.map((item, i) => (i === 0 ? item : `${sep()}\n          ${item}`)).join("\n          ");
  return `<div class="crumbs">\n          ${inner}\n        </div>`;
}

function generateRelated(cluster, currentSpoke) {
  const live = cluster.spokes.filter((s) => s.live);
  const idx = live.findIndex((s) => s.slug === currentSpoke.slug);
  let cards;
  if (idx === -1 || live.length <= 4) {
    cards = live.filter((s) => s.slug !== currentSpoke.slug).slice(0, 3);
  } else {
    // Rotierend: die 3 auf den aktuellen Spoke folgenden Geschwister (mit
    // Umbruch ans Listenende) — so bekommt JEDER Spoke eingehende
    // Weiterlesen-Links, nicht nur die ersten drei der Liste.
    cards = [1, 2, 3].map((k) => live[(idx + k) % live.length]);
  }
  if (cards.length === 0) return null;

  const color = cluster.color;
  const langUC = cluster.lang.toUpperCase();

  const cardHTML = cards
    .map(
      (card) => `
          <a class="post" href="${card.slug}/">
            <div class="thumb" style="position:relative;overflow:hidden">
              <div class="glow" style="background:linear-gradient(140deg,${color},${darken(color)});position:absolute;inset:0;border-radius:inherit"></div>
              <span class="verb" style="position:relative;z-index:1;color:#fff;font-size:13px;font-weight:700;letter-spacing:.05em;padding:6px 10px;background:rgba(0,0,0,.18);border-radius:8px;margin:auto">${langUC}</span>
            </div>
            <div class="body">
              <span class="cat gram"><span class="d"></span>Grammatik</span>
              <h3>${esc(card.title)}</h3>
              <div class="pmeta"><span>${langUC}</span></div>
            </div>
          </a>`
    )
    .join("");

  return `<section class="block related" style="padding:54px 0 0">
      <div class="wrap">
        <span class="sec-tag">Weiterlesen</span>
        <div class="pair" style="margin-top:18px">${cardHTML}
        </div>
      </div>
    </section>`;
}

function darken(hex) {
  // Slightly shift hue for gradient end (simple mix toward blue)
  const map = {
    "#ff9f0a": "#ff3b5c",
    "#ff3b5c": "#ff7a18",
    "#a557ff": "#0a84ff",
    "#0a84ff": "#a557ff",
    "#30c95a": "#0a84ff",
  };
  return map[hex] || "#a557ff";
}

/* ─── Marker-basierter Ersatz ─────────────────────────────────────────────── */

const MARKER = {
  crumbs: ["<!-- CLUSTER:CRUMBS -->", "<!-- /CLUSTER:CRUMBS -->"],
  related: ["<!-- CLUSTER:RELATED -->", "<!-- /CLUSTER:RELATED -->"],
};

function wrapWithMarker(html, open, close, generated) {
  const innerPat = new RegExp(
    escapeRe(open) + "[\\s\\S]*?" + escapeRe(close)
  );
  if (innerPat.test(html)) {
    // Marker vorhanden → Inhalt ersetzen
    return html.replace(innerPat, `${open}\n      ${generated}\n      ${close}`);
  }
  // Kein Marker → Muster finden und umwickeln
  return html;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function injectCrumbs(html, generated) {
  const [open, close] = MARKER.crumbs;
  // Falls Marker schon vorhanden: ersetzen
  const markerPat = new RegExp(escapeRe(open) + "[\\s\\S]*?" + escapeRe(close));
  if (markerPat.test(html)) {
    return html.replace(markerPat, `${open}\n        ${generated}\n        ${close}`);
  }
  // Kein Marker: bestehende crumbs-div finden und einwickeln
  const crumPat = /<div class="crumbs">[\s\S]*?<\/div>/;
  if (crumPat.test(html)) {
    return html.replace(crumPat, `${open}\n        ${generated}\n        ${close}`);
  }
  return html;
}

function injectRelated(html, generated) {
  const [open, close] = MARKER.related;
  const markerPat = new RegExp(escapeRe(open) + "[\\s\\S]*?" + escapeRe(close));
  if (markerPat.test(html)) {
    return html.replace(markerPat, `${open}\n    ${generated}\n    ${close}`);
  }
  // Bestehende related-section finden
  const relPat = /<section class="block related"[\s\S]*?<\/section>/;
  if (relPat.test(html)) {
    return html.replace(relPat, `${open}\n    ${generated}\n    ${close}`);
  }
  // Keine related-section: vor </article> einfügen
  return html.replace(
    "</article>",
    `    ${open}\n    ${generated}\n    ${close}\n\n  </article>`
  );
}

/* ─── Hauptschleife ───────────────────────────────────────────────────────── */

const files = process.argv.slice(2);
if (files.length === 0) {
  console.log("Keine Dateien angegeben.");
  process.exit(0);
}

let changed = 0;

for (const file of files) {
  // Slug aus Dateipfad ableiten: blog/foo/index.html → /blog/foo
  const slug = "/" + file.replace(/\/index\.html$/, "").replace(/\/$/, "");

  const { type, cluster, spoke } = findPage(slug);

  if (type === "unknown") {
    // Nicht im Cluster → Breadcrumb unverändert lassen
    continue;
  }

  const fullPath = join(ROOT, file);
  let html = readFileSync(fullPath, "utf8");

  // 1. Breadcrumb
  const crumbsHTML = generateCrumbs(type, cluster, spoke);
  html = injectCrumbs(html, crumbsHTML);

  // 2. RelatedCards (nur für Spokes mit live-Geschwistern)
  if (type === "spoke" && cluster) {
    const relatedHTML = generateRelated(cluster, spoke);
    if (relatedHTML) {
      html = injectRelated(html, relatedHTML);
    }
  }

  writeFileSync(fullPath, html, "utf8");
  console.log(`✓  ${file} – Cluster-Nav injiziert`);
  changed++;
}

if (changed === 0) console.log("Keine Cluster-Artikel verändert.");
