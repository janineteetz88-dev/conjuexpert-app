/**
 * sources.mjs
 *
 * Rendert den „Quellen"-Abschnitt am Artikelende.
 *
 * Ablauf:
 *   1. Scannt den gerenderten HTML-String nach Inline-Zitaten im Format (Autor, Jahr)
 *      bzw. (Autor, o. D.).
 *   2. Schlägt jeden Fund im geprüften Pool (sources-pool.json) nach.
 *   3. Unbekannte Zitate → Konsolen-Warnung, kein Raten.
 *   4. Erzeugt eine <ol class="sources">-Liste; fehlen Treffer, wird nichts gerendert.
 *
 * Quelle der Wahrheit für pool-Einträge: Notion „Quellen zu Sprache Lernen".
 * Pool-Update: sources-pool.json manuell oder per Sync-Skript aktualisieren.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const POOL_PATH = join(dirname(fileURLToPath(import.meta.url)), "sources-pool.json");

let _pool;
function getPool() {
  if (!_pool) {
    _pool = JSON.parse(readFileSync(POOL_PATH, "utf8"));
  }
  return _pool;
}

// Matches "(Autor, 2024)" or "(Autor et al., 2024)" or "(Autor, o. D.)" etc.
// Captures the key inside the parentheses.
const CITE_RE = /\(([^()]{2,100}(?:, \d{4}|, o\. D\.))\)/g;

export function renderSourcesSection(text) {
  const pool = getPool();
  const seen = new Set();
  const items = [];

  CITE_RE.lastIndex = 0;
  let m;
  while ((m = CITE_RE.exec(String(text || ""))) !== null) {
    const key = m[1].trim();
    if (seen.has(key)) continue;
    seen.add(key);

    if (pool[key]) {
      items.push(pool[key]);
    } else {
      console.warn(`[sources] Unbekannte Zitation: "${key}" — nicht im Pool, wird übersprungen.`);
    }
  }

  if (!items.length) return "";

  const listItems = items.map((t) => `          <li>${t}</li>`).join("\n");
  return `
        <h2 id="quellen">Quellen</h2>
        <ol class="sources">
${listItems}
        </ol>`;
}
