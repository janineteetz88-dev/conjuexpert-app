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

// Aus einem Wert wie "/blog/a · /blog/b · /blog/c" eine bereinigte Slug-Liste machen.
function splitList(val) {
  return String(val || "")
    .split("·")
    .map((s) => stripBold(s).trim())
    .filter(Boolean);
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
    } else if (L.startsWith("runter") || L.startsWith("seitwärts") || L.startsWith("seitwarts")) {
      // "Runter (Spokes)" (Hub) ODER "Seitwärts (Geschwister)" (Spoke)
      meta.downOrSiblings = splitList(value);
    } else if (L.startsWith("sprache")) {
      meta.sprache = value.trim();
    } else if (L === "keyword") {
      meta.keyword = value.trim();
    } else if (L.startsWith("meta-description") || L.startsWith("meta description") || L.startsWith("metadescription")) {
      meta.metaDescription = value.trim();
    }
    // Unbekannte Labels (z. B. "Status") werden ignoriert.
  }

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
