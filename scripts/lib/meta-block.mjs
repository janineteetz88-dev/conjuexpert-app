/**
 * meta-block.mjs
 *
 * Generischer, datengetriebener Parser für den "Meta (für Blog-Engine & Freigabe)"-Block,
 * der am Anfang jeder Artikel-Fixture / Notion-Seite steht.
 *
 * Es werden KEINE Artikel-Sonderfälle hardcoded — nur Labels werden auf Felder gemappt.
 *
 *   parseMetaBlock(rawText) → meta
 *   validateMeta(meta)      → { ok, errors[] }
 */

const META_HEADER = "**Meta (für Blog-Engine & Freigabe)**";

/* ─── Helpers ───────────────────────────────────────────────────────────── */

// Entfernt umschließende **fett**-Marker und trimmt.
function stripBold(s) {
  return String(s || "")
    .replace(/^\s*\*\*/, "")
    .replace(/\*\*\s*$/, "")
    .trim();
}

// "Hub/Pillar" → "hub", "Spoke" → "spoke"
function normalizeTyp(val) {
  const v = String(val || "").toLowerCase();
  if (v.includes("hub") || v.includes("pillar")) return "hub";
  if (v.includes("spoke")) return "spoke";
  return v.trim() || null;
}

// Aus einem Wert wie "/blog/a · /blog/b" ODER "a, b" eine bereinigte Liste machen.
// (Kanonisch trennt mit " · ", das v2-Format mit ", ".)
function splitList(val) {
  return String(val || "")
    .split(/·|,/)
    .map((s) => stripBold(s).trim())
    .filter(Boolean);
}

// Bare-Slug ("trennbare-verben-deutsch") → "/blog/trennbare-verben-deutsch".
// Bereits absolute Pfade ("/blog/…", "/konjugation/…") bleiben unverändert.
function toBlogSlug(s) {
  const v = stripBold(String(s || "")).trim();
  if (!v) return v;
  if (v.startsWith("/")) return v;
  return "/blog/" + v.replace(/^\/+/, "");
}

// Extrahiert einen Slug aus z. B. "Hoch (Global-Pillar)"-Werten:
// der Wert ist i. d. R. direkt der Slug; wir nehmen das erste /blog/... Token,
// fallen sonst auf den getrimmten Rohwert zurück.
function extractSlug(val) {
  const v = stripBold(val).trim();
  const m = v.match(/\/blog\/[^\s·]+/);
  return m ? m[0] : v || null;
}

/**
 * Eine Bullet-Zeile in Felder zerlegen.
 * Eine Zeile kann mehrere Felder enthalten, getrennt durch " · ":
 *   **Typ:** Spoke · **Cluster:** lernmethode · **Säule:** Anwendung
 * Achtung: " · " trennt auch innerhalb von Slug-Listen — deshalb splitten wir
 * nur an " · " das DIREKT vor einem "**Label:**" steht.
 */
function parseBulletFields(line) {
  // Zeile beginnt mit "- "
  const body = line.replace(/^\s*[-*]\s+/, "");

  // Split nur an " · " gefolgt von einem **Label:**-Muster.
  const parts = body.split(/\s+·\s+(?=\*\*[^*]+:\*\*)/);

  const fields = {};
  for (const part of parts) {
    const m = part.match(/^\*\*([^*]+?):\*\*\s*(.*)$/s);
    if (!m) continue;
    const label = m[1].trim();
    const value = m[2].trim();
    fields[label] = value;
  }
  return fields;
}

/* ─── Parser ─────────────────────────────────────────────────────────────── */

export function parseMetaBlock(rawText) {
  const text = String(rawText || "");
  const lines = text.split(/\r?\n/);

  // Header finden
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === META_HEADER) {
      start = i;
      break;
    }
  }

  const meta = {
    slug: null,
    typ: null,
    cluster: null,
    saeule: null,
    pillarUp: null,
    downOrSiblings: [],
    sprache: null,
    keyword: null,
    metaDescription: null,
    // v2-Format (Zitat-Block): Pillar/Hub getrennt + relatedVerbs.
    pillar: null,
    hub: null,
    relatedVerbs: [],
  };

  if (start === -1) return meta;

  // Felder einsammeln: ab Header bis zur ersten Leerzeile / Heading / Callout.
  const collected = {};
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Abbruch-Bedingungen (Ende des Meta-Blocks)
    if (trimmed === "") break;
    if (/^#{1,6}\s/.test(trimmed)) break;
    if (/^<callout/i.test(trimmed)) break;
    if (/^>/.test(trimmed)) break;

    if (/^\s*[-*]\s+/.test(line)) {
      Object.assign(collected, parseBulletFields(line));
    }
  }

  // Label → Feld-Mapping (generisch, label-getrieben)
  for (const [label, value] of Object.entries(collected)) {
    const L = label.toLowerCase();

    if (L === "slug") {
      meta.slug = extractSlug(value);
    } else if (L === "typ") {
      meta.typ = normalizeTyp(value);
    } else if (L === "cluster") {
      meta.cluster = value.trim();
    } else if (L.startsWith("säule") || L.startsWith("saeule")) {
      meta.saeule = value.trim();
    } else if (L.startsWith("hoch")) {
      // "Hoch (Global-Pillar)" ODER "Hoch (Pillar/Hub)"
      meta.pillarUp = extractSlug(value);
    } else if (L.startsWith("runter") || L.startsWith("seitwärts") || L.startsWith("seitwarts") || L.startsWith("geschwister")) {
      // "Runter (Spokes)" (Hub) · "Seitwärts (Geschwister)" (Spoke) · v2: "Geschwister"
      meta.downOrSiblings = splitList(value);
    } else if (L === "pillar") {
      // v2: eigenes Pillar-Feld (Global-Pillar des Clusters)
      meta.pillar = extractSlug(value);
    } else if (L === "hub") {
      // v2: eigenes Hub-Feld (Cluster-Überblick)
      meta.hub = extractSlug(value);
    } else if (L.startsWith("relatedverbs") || L === "related verbs") {
      meta.relatedVerbs = splitList(value);
    } else if (L.startsWith("sprache")) {
      meta.sprache = value.trim();
    } else if (L === "keyword") {
      meta.keyword = value.trim();
    } else if (L.startsWith("meta-description") || L.startsWith("meta description") || L.startsWith("metadescription")) {
      meta.metaDescription = value.trim();
    }
    // Unbekannte Labels (z. B. "Status") werden ignoriert.
  }

  // ── v2-Normalisierung (rückwärtskompatibel) ──────────────────────────────
  // Slug ggf. zu absolutem /blog/-Pfad machen.
  if (meta.slug) meta.slug = toBlogSlug(meta.slug);
  // pillarUp aus Pillar/Hub ableiten, falls nicht direkt über "Hoch" gesetzt:
  // Hub → Pillar (eine Ebene hoch), Spoke → Hub (eine Ebene hoch).
  if (!meta.pillarUp) {
    meta.pillarUp = meta.typ === "hub" ? (meta.pillar || meta.hub) : (meta.hub || meta.pillar);
  }
  if (meta.pillarUp) meta.pillarUp = toBlogSlug(meta.pillarUp);
  // Geschwister/Spokes ggf. zu absoluten /blog/-Pfaden normalisieren.
  meta.downOrSiblings = (meta.downOrSiblings || []).map((s) =>
    /^\/konjugation\//.test(s) ? s : toBlogSlug(s)
  );

  return meta;
}

/* ─── Validator (Leitplanke 1) ──────────────────────────────────────────── */

export function validateMeta(meta) {
  const errors = [];
  const m = meta || {};

  if (!m.slug || !String(m.slug).trim()) {
    errors.push("Pflichtfeld fehlt: Slug");
  }
  if (!m.pillarUp || !String(m.pillarUp).trim()) {
    errors.push("Pflichtfeld fehlt: Hoch (Pillar/Hub bzw. Global-Pillar)");
  }
  if (!m.cluster || !String(m.cluster).trim()) {
    errors.push("Pflichtfeld fehlt: Cluster");
  }
  if (!m.metaDescription || !String(m.metaDescription).trim()) {
    errors.push("Pflichtfeld fehlt: Meta-Description");
  }

  return { ok: errors.length === 0, errors };
}
