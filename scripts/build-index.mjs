/**
 * Build-Time-Prerendering der React-Blöcke in index.html.
 *
 * Hintergrund: Früher lud index.html @babel/standalone (~700 KB gzip) und
 * übersetzte die beiden <script type="text/babel">-Blöcke bei JEDEM Aufruf
 * im Browser des Besuchers. Das war langsam, besonders auf schwachen Handys.
 *
 * Dieses Skript übersetzt die JSX-Quellen EINMAL vorab (mit exakt demselben
 * @babel/standalone wie zur Laufzeit, presets:['react'] = klassische
 * React.createElement-Transformation) und schreibt das fertige JS direkt in
 * index.html. Kein Babel mehr im Browser → deutlich schneller.
 *
 * Quelle der Wahrheit sind die Dateien in src/blocks/. App-Änderungen dort
 * vornehmen und danach EINFACH ausführen:
 *
 *     npm run build:app
 *
 * Beim allerersten Lauf extrahiert das Skript die noch inline vorhandenen
 * <script type="text/babel">-Blöcke automatisch nach src/blocks/ und ersetzt
 * sie in index.html durch Build-Marker. Ab dann sind die src/blocks-Dateien
 * maßgeblich.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as Babel from "@babel/standalone";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = join(ROOT, "index.html");
const SRC_DIR = join(ROOT, "src", "blocks");

// Reihenfolge ist wichtig: Block A (Tweaks-Panel) wird von Block B (App) genutzt.
const BLOCKS = [
  { id: "tweaks", file: join(SRC_DIR, "tweaks-panel.jsx") },
  { id: "app", file: join(SRC_DIR, "app.jsx") },
];

const BABEL_STANDALONE_RE =
  /[ \t]*<script src="https:\/\/unpkg\.com\/@babel\/standalone@[^"]*"[^>]*><\/script>\r?\n?/;

const OPEN_TAG = '<script type="text/babel">';
const CLOSE_TAG = "</script>";

function transpile(jsx, label) {
  // presets:['react'] entspricht exakt dem, was @babel/standalone zur Laufzeit
  // an den text/babel-Blöcken gemacht hat (klassisches React.createElement).
  const out = Babel.transform(jsx, {
    presets: ["react"],
    compact: false,
    comments: true,
    sourceType: "script", // klassisches Script, KEIN Modul -> geteilter Top-Level-Scope bleibt erhalten
  });
  if (!out || typeof out.code !== "string") {
    throw new Error(`Babel hat für ${label} keinen Code geliefert.`);
  }
  return out.code;
}

function markerStart(id) {
  return `<!-- BUILD:${id} — generiert aus src/blocks/${id === "tweaks" ? "tweaks-panel" : id}.jsx; NICHT direkt hier bearbeiten -->`;
}
function markerEnd(id) {
  return `<!-- /BUILD:${id} -->`;
}

function buildScriptTag(id, code) {
  return `${markerStart(id)}\n<script>\n${code}\n</script>\n${markerEnd(id)}`;
}

/** Erstmaliges Herauslösen der inline-Blöcke + Umbau auf Marker. */
function bootstrap(html) {
  mkdirSync(SRC_DIR, { recursive: true });

  // Block A
  const aStart = html.indexOf(OPEN_TAG);
  if (aStart === -1) throw new Error("Kein <script type=\"text/babel\">-Block gefunden.");
  const aContent = aStart + OPEN_TAG.length;
  const aClose = html.indexOf(CLOSE_TAG, aContent);
  const blockA = html.slice(aContent, aClose);

  // Block B
  const bStart = html.indexOf(OPEN_TAG, aClose);
  if (bStart === -1) throw new Error("Zweiter text/babel-Block nicht gefunden.");
  const bContent = bStart + OPEN_TAG.length;
  const bClose = html.indexOf(CLOSE_TAG, bContent);
  const blockB = html.slice(bContent, bClose);

  writeFileSync(BLOCKS[0].file, blockA.replace(/^\n/, "") + "\n");
  writeFileSync(BLOCKS[1].file, blockB.replace(/^\n/, "") + "\n");
  console.log(`  • src/blocks/tweaks-panel.jsx geschrieben (${blockA.length} Zeichen JSX)`);
  console.log(`  • src/blocks/app.jsx geschrieben (${blockB.length} Zeichen JSX)`);

  // index.html: beide Babel-Blöcke durch Marker (zunächst leer) ersetzen
  const rebuilt =
    html.slice(0, aStart) +
    `${markerStart("tweaks")}\n${markerEnd("tweaks")}` +
    html.slice(aClose + CLOSE_TAG.length, bStart) +
    `${markerStart("app")}\n${markerEnd("app")}` +
    html.slice(bClose + CLOSE_TAG.length);
  return rebuilt;
}

function injectBetweenMarkers(html, id, code) {
  const start = markerStart(id);
  const end = markerEnd(id);
  const s = html.indexOf(start);
  const e = html.indexOf(end, s);
  if (s === -1 || e === -1) {
    throw new Error(`Marker für Block "${id}" nicht in index.html gefunden.`);
  }
  return html.slice(0, s) + buildScriptTag(id, code) + html.slice(e + end.length);
}

function main() {
  let html = readFileSync(INDEX, "utf8");

  // Schutz: index.html nutzt inzwischen /app.js als einziges App-Bundle
  // (Engine + Übersetzungen + UI). Inline-Blöcke wurden entfernt, weil sie mit
  // app.js kollidierten (__TwkCheck doppelt deklariert → #root leer). Ohne
  // Marker/Babel-Blöcke würde der Bootstrap index.html zerstören – daher hier
  // sauber abbrechen statt etwas zu schreiben.
  if (!html.includes(markerStart("tweaks")) && !html.includes(OPEN_TAG)) {
    console.log("Übersprungen: index.html nutzt /app.js als Bundle (keine Inline-Blöcke). app.js direkt bearbeiten.");
    return;
  }

  const hasMarkers = html.includes(markerStart("tweaks"));
  if (!hasMarkers) {
    console.log("Erstlauf: löse inline text/babel-Blöcke heraus …");
    html = bootstrap(html);
  }

  for (const b of BLOCKS) {
    if (!existsSync(b.file)) {
      throw new Error(`Quelldatei fehlt: ${b.file}`);
    }
    const jsx = readFileSync(b.file, "utf8");
    const code = transpile(jsx, b.id);
    html = injectBetweenMarkers(html, b.id, code);
    console.log(`  • Block "${b.id}" transpiliert (${jsx.length} → ${code.length} Zeichen)`);
  }

  // @babel/standalone aus dem Browser entfernen (wird nicht mehr gebraucht).
  if (BABEL_STANDALONE_RE.test(html)) {
    html = html.replace(BABEL_STANDALONE_RE, "");
    console.log("  • @babel/standalone-Script aus index.html entfernt");
  }

  writeFileSync(INDEX, html);
  console.log("✓ index.html neu gebaut.");
}

main();
