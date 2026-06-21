/**
 * build-logo.mjs — baut die kanonische ConjuExpert-Wortmarke als SELBST-TRAGENDE
 * SVG: Wellen-Icon (favicon.svg) + Schriftzug in echten Space-Grotesk-Pfaden
 * (kein Font-Abhängigkeit mehr). "Conju" #e71583, "Expert" Verlauf #0a84ff→#a557ff.
 *
 *   node scripts/_brand/build-logo.mjs
 */
import * as fontkit from "fontkit";
import { decompress } from "wawoff2";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CANDIDATES = [
  "fonts/V8mDoQDjQSkFtoMM3T6r8E7mPb94C-s0.woff2",
  "fonts/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2",
];

const TEXT_A = "Conju", TEXT_B = "Expert";
const LS_EM = -0.02; // letter-spacing wie .brand-name
// Balken-Spanne aus dem Icon-Transform translate(8,9) scale(1.7): oben 17.5, unten 54.9
const ICON_TOP = 17.5, ICON_BOTTOM = 54.9;

async function openWithGlyphs() {
  for (const rel of CANDIDATES) {
    // woff2 → TTF dekomprimieren (variabler Glyph-Zugriff klappt nur auf TTF)
    const ttf = Buffer.from(await decompress(readFileSync(join(ROOT, rel))));
    const f = fontkit.create(ttf);
    const probe = (TEXT_A + TEXT_B).split("").every((ch) => f.hasGlyphForCodePoint(ch.codePointAt(0)));
    if (probe) return f;
  }
  throw new Error("Keine woff2 enthält alle Buchstaben von ConjuExpert");
}

const base = await openWithGlyphs();
const upm = base.unitsPerEm;
// Wortmarke auf Icon-Höhe ziehen: Cap-Height = Balken-Spanne, Grundlinie = Balken-Unterkante.
const capH = base.capHeight || 700;
const SIZE = (ICON_BOTTOM - ICON_TOP) / (capH / upm);
const X0 = 72, BASELINE = ICON_BOTTOM;
const s = SIZE / upm;
const lsUnits = LS_EM * upm;

// Pfade einer Textfolge bei gegebenem Gewicht erzeugen; gibt {paths[], width(px)} ab penX-Start.
function runPaths(text, wght, startPenUnits) {
  // Layout auf der Basis-Font (cmap vorhanden); Pfade/Advances aus der Gewichts-Variante.
  const fvar = typeof base.getVariation === "function" ? base.getVariation({ wght }) : base;
  const run = base.layout(text);
  let pen = startPenUnits;
  const paths = [];
  run.glyphs.forEach((g) => {
    const vg = fvar.getGlyph(g.id);
    const x = X0 + pen * s;
    const d = vg.path.toSVG();
    if (d && d.trim()) paths.push({ d, x });
    pen += vg.advanceWidth + lsUnits;
  });
  return { paths, penEnd: pen };
}

const a = runPaths(TEXT_A, 600, 0);
const b = runPaths(TEXT_B, 700, a.penEnd);
const totalW = X0 + b.penEnd * s + 10; // rechtes Padding
const W = Math.ceil(totalW);
// Vertikale Bounding-Box knapp um Icon + Schrift (inkl. Unterlängen) legen.
const descentPx = Math.abs(base.descent || 200) * s;
const PAD = 6;
const vbY = +(ICON_TOP - PAD).toFixed(2);
const vbH = +((Math.max(ICON_BOTTOM, BASELINE + descentPx) + PAD) - vbY).toFixed(2);

const tf = (x) => `translate(${x.toFixed(2)}, ${BASELINE}) scale(${s.toFixed(5)}, ${(-s).toFixed(5)})`;
const aPaths = a.paths.map((p) => `  <path transform="${tf(p.x)}" d="${p.d}" fill="#e71583"/>`).join("\n");
const bPaths = b.paths.map((p) => `  <path transform="${tf(p.x)}" d="${p.d}" fill="url(#ceExpert)"/>`).join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${vbY} ${W} ${vbH}" width="${W}" height="${vbH}" role="img" aria-label="ConjuExpert">
  <defs>
    <linearGradient id="ceExpert" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0a84ff"/>
      <stop offset="1" stop-color="#a557ff"/>
    </linearGradient>
  </defs>
  <!-- Wellen-Icon (identisch zu favicon.svg, ohne Hintergrund) -->
  <g transform="translate(8,9) scale(1.7)">
    <rect x="2.5"  y="16" width="3" height="11" rx="1.5" fill="#ff3b5c"/>
    <rect x="6.5"  y="12" width="3" height="15" rx="1.5" fill="#ff7a18"/>
    <rect x="10.5" y="8"  width="3" height="19" rx="1.5" fill="#ffc400"/>
    <rect x="14.5" y="5"  width="3" height="22" rx="1.5" fill="#34c759"/>
    <rect x="18.5" y="8"  width="3" height="19" rx="1.5" fill="#00bcd4"/>
    <rect x="22.5" y="12" width="3" height="15" rx="1.5" fill="#0a84ff"/>
    <rect x="26.5" y="16" width="3" height="11" rx="1.5" fill="#a557ff"/>
  </g>
  <!-- Wortmarke (Space Grotesk, in Pfade umgewandelt) -->
${aPaths}
${bPaths}
</svg>
`;

writeFileSync(join(ROOT, "logo-full.svg"), svg, "utf8");
console.log(`✅ logo-full.svg geschrieben — viewBox 0 ${vbY} ${W} ${vbH}, Font: ${base.familyName}, SIZE ${SIZE.toFixed(1)}px`);
