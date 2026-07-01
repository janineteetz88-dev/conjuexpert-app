/**
 * thumb-gen.mjs
 *
 * Erzeugt pro Blog-Artikel ein EINDEUTIGES Lifestyle-Thumbnail als flache
 * Vektor-Illustration (Strand, Schreibtisch, Garten, Zuhause, Café, Party,
 * Berge, Park, Dachterrasse). Portrait 288×512 (Kachel zeigt 142×252).
 *
 * Jede Karte bekommt eine andere (Szene × Stimmung)-Kombination → nie zwei
 * gleiche Bilder. Reine String-Funktion, keine externen Assets → testbar.
 */

/* ─── Stimmungen (Himmel-Verlauf + Sonne/Akzent) ─────────────────────────── */
const MOODS = [
  { sky: ["#bfe9ff", "#eaf7ff"], sun: "#ffd23f", warm: "#ffe6a3" }, // Tag
  { sky: ["#ffd6a5", "#ff9a8b"], sun: "#ff7b54", warm: "#ffd0b0" }, // Sonnenuntergang
  { sky: ["#7b6cf6", "#c3a5f0"], sun: "#ffe08a", warm: "#b9a7ef" }, // Dämmerung
  { sky: ["#c8f4dd", "#eafff4"], sun: "#ffd23f", warm: "#bff0d6" }, // Frisch
  { sky: ["#a5d8ff", "#d5efff"], sun: "#ffcf4d", warm: "#ffe3a8" }, // Klar
];

/* ─── kleine Helfer ──────────────────────────────────────────────────────── */
const W = 288, H = 512;
function grad(id, c1, c2, vertical = true) {
  const dir = vertical ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="0"';
  return `<linearGradient id="${id}" ${dir}><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
}

/* ─── Szenen (jede: (m)ood → inner SVG). Flach, wenige Formen. ────────────── */

const SCENES = {
  strand(m, id) {
    return `<defs>${grad(id + "s", m.sky[0], m.sky[1])}</defs>
<rect width="${W}" height="340" fill="url(#${id}s)"/>
<circle cx="212" cy="96" r="46" fill="${m.sun}"/>
<path d="M0 300 Q144 270 288 300 V340 H0 Z" fill="#38b6d6"/>
<rect y="336" width="${W}" height="176" fill="#0e93b8"/>
<path d="M0 336 Q80 316 160 336 T288 336 V420 H0 Z" fill="#f4e3b0"/>
<rect y="410" width="${W}" height="102" fill="#efd79b"/>
<g stroke="#5a3d1e" stroke-width="9" stroke-linecap="round" fill="none"><path d="M74 460 C70 400 66 372 60 348"/></g>
<g fill="#2e9e5b"><path d="M60 344 C24 330 8 344 2 360 C40 350 54 356 60 360 Z"/><path d="M60 344 C96 330 120 342 128 358 C92 348 70 352 60 360 Z"/><path d="M60 342 C52 312 66 292 86 282 C74 314 68 336 62 356 Z"/></g>
<circle cx="150" cy="450" r="20" fill="#ff6b6b"/><rect x="148" y="450" width="4" height="52" fill="#7a4a2a"/>`;
  },
  schreibtisch(m, id) {
    return `<defs>${grad(id + "w", m.warm, "#fff3df")}</defs>
<rect width="${W}" height="${H}" fill="url(#${id}w)"/>
<rect x="34" y="60" width="150" height="112" rx="8" fill="#ffffff" stroke="#e7d6bd" stroke-width="4"/>
<rect x="46" y="74" width="126" height="84" rx="4" fill="${m.sky[0]}"/><circle cx="150" cy="118" r="20" fill="${m.sun}"/>
<rect y="360" width="${W}" height="152" fill="#c98a52"/><rect y="352" width="${W}" height="12" fill="#a9703f"/>
<rect x="150" y="286" width="118" height="76" rx="6" fill="#2b2f38"/><rect x="158" y="294" width="102" height="60" rx="3" fill="#7fd1ff"/>
<rect x="150" y="360" width="118" height="8" fill="#1c2027"/>
<g stroke="#3a3f4a" stroke-width="6" fill="none" stroke-linecap="round"><path d="M60 360 V300 l26 -26"/></g><circle cx="92" cy="266" r="16" fill="${m.sun}"/>
<rect x="30" y="330" width="34" height="30" rx="4" fill="#ff6b6b"/><rect x="34" y="322" width="26" height="10" rx="3" fill="#e85555"/>
<g><rect x="104" y="318" width="24" height="42" rx="4" fill="#e7734d"/><path d="M116 318 C100 300 106 282 116 274 C126 282 132 300 116 318Z" fill="#2e9e5b"/></g>`;
  },
  garten(m, id) {
    return `<defs>${grad(id + "g", m.sky[0], m.sky[1])}</defs>
<rect width="${W}" height="300" fill="url(#${id}g)"/>
<circle cx="70" cy="86" r="40" fill="${m.sun}"/>
<rect y="290" width="${W}" height="222" fill="#5cbb6a"/><path d="M0 290 Q144 262 288 290 V320 H0Z" fill="#78cf83"/>
<g fill="#2f9e57"><circle cx="52" cy="300" r="34"/><circle cx="96" cy="306" r="26"/><circle cx="236" cy="300" r="34"/><circle cx="198" cy="308" r="24"/></g>
<g fill="#ffd23f"><circle cx="150" cy="360" r="7"/><circle cx="120" cy="392" r="7"/><circle cx="182" cy="392" r="7"/><circle cx="150" cy="424" r="7"/></g>
<g fill="#ff6b6b"><circle cx="90" cy="400" r="7"/><circle cx="210" cy="368" r="7"/><circle cx="66" cy="440" r="7"/><circle cx="230" cy="430" r="7"/></g>
<path d="M120 512 Q144 400 168 512 Z" fill="#c98a52"/>`;
  },
  zuhause(m, id) {
    return `<defs>${grad(id + "z", m.sky[0], m.sky[1])}</defs>
<rect width="${W}" height="${H}" fill="#f4ecdd"/>
<rect y="372" width="${W}" height="140" fill="#d8bfa3"/>
<rect x="150" y="70" width="110" height="120" rx="6" fill="#2a2e36"/><rect x="158" y="78" width="94" height="104" fill="url(#${id}z)"/><circle cx="228" cy="112" r="16" fill="${m.sun}"/><path d="M158 150 L200 120 L252 150 V182 H158Z" fill="#6fc27f"/>
<rect x="28" y="300" width="150" height="86" rx="16" fill="#ef7d63"/><rect x="24" y="330" width="26" height="56" rx="8" fill="#e56b52"/><rect x="156" y="330" width="26" height="56" rx="8" fill="#e56b52"/><rect x="52" y="288" width="100" height="34" rx="12" fill="#ff9080"/>
<g><rect x="214" y="330" width="30" height="56" rx="4" fill="#c98a52"/><path d="M229 330 C208 308 214 286 229 276 C244 286 250 308 229 330Z" fill="#2e9e5b"/></g>
<circle cx="90" cy="150" r="8" fill="${m.sun}"/><rect x="88" y="150" width="4" height="60" fill="#b98"/>`;
  },
  cafe(m, id) {
    return `<defs>${grad(id + "c", m.warm, "#fff6ea")}</defs>
<rect width="${W}" height="${H}" fill="url(#${id}c)"/>
<rect x="150" y="60" width="110" height="150" rx="8" fill="#dff0f5"/><rect x="150" y="60" width="110" height="150" rx="8" fill="none" stroke="#caa77e" stroke-width="6"/><line x1="205" y1="60" x2="205" y2="210" stroke="#caa77e" stroke-width="4"/><line x1="150" y1="135" x2="260" y2="135" stroke="#caa77e" stroke-width="4"/>
<rect y="360" width="${W}" height="152" fill="#8a5a34"/><rect y="352" width="${W}" height="12" fill="#6f4526"/>
<g><path d="M96 300 h84 a10 10 0 0 1 -10 60 h-64 a10 10 0 0 1 -10 -60Z" fill="#ffffff"/><path d="M180 312 a22 22 0 0 1 0 40" fill="none" stroke="#ffffff" stroke-width="10"/><rect x="96" y="352" width="84" height="10" fill="#efe7db"/><ellipse cx="138" cy="300" rx="42" ry="9" fill="#c98a52"/></g>
<g stroke="#a06a3a" stroke-width="5" fill="none" stroke-linecap="round"><path d="M120 300 q-6 -22 4 -40"/><path d="M138 300 q0 -24 0 -44"/><path d="M156 300 q6 -22 -4 -40"/></g>
<circle cx="228" cy="250" r="12" fill="${m.sun}"/><rect x="226" y="210" width="4" height="30" fill="#7a5a3a"/>`;
  },
  party(m, id) {
    return `<defs>${grad(id + "p", m.sky[0], m.sky[1])}</defs>
<rect width="${W}" height="${H}" fill="url(#${id}p)"/>
<polyline points="0,60 288,40" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2"/>
<g><path d="M0 58 l22 6 l0 26 l-22 -8Z" fill="#ff6b6b"/><path d="M40 62 l22 4 l0 26 l-22 -6Z" fill="#ffd23f"/><path d="M80 64 l24 3 l0 26 l-24 -5Z" fill="#4dc3ff"/><path d="M124 66 l24 2 l0 26 l-24 -4Z" fill="#7bd88f"/><path d="M170 66 l24 0 l0 26 l-24 -2Z" fill="#ff9f0a"/><path d="M216 64 l24 -2 l0 26 l-24 0Z" fill="#a557ff"/><path d="M262 62 l26 -4 l0 26 l-26 2Z" fill="#ff6b6b"/></g>
<g><g><ellipse cx="86" cy="220" rx="34" ry="42" fill="#ff6b6b"/><line x1="86" y1="262" x2="86" y2="360" stroke="#ffffff" stroke-opacity="0.6" stroke-width="2"/></g><g><ellipse cx="176" cy="250" rx="30" ry="38" fill="#4dc3ff"/><line x1="176" y1="288" x2="176" y2="380" stroke="#ffffff" stroke-opacity="0.6" stroke-width="2"/></g><g><ellipse cx="228" cy="210" rx="28" ry="35" fill="#ffd23f"/><line x1="228" y1="245" x2="228" y2="340" stroke="#ffffff" stroke-opacity="0.6" stroke-width="2"/></g></g>
<g fill="#ffffff" fill-opacity="0.85"><circle cx="40" cy="150" r="4"/><circle cx="250" cy="140" r="4"/><circle cx="120" cy="410" r="4"/><circle cx="60" cy="360" r="4"/><circle cx="210" cy="400" r="4"/><circle cx="150" cy="470" r="4"/></g>
<g fill="#ff9f0a"><rect x="200" y="360" width="7" height="7" transform="rotate(20 203 363)"/><rect x="90" y="300" width="7" height="7" transform="rotate(35 93 303)"/></g>`;
  },
  berge(m, id) {
    return `<defs>${grad(id + "b", m.sky[0], m.sky[1])}</defs>
<rect width="${W}" height="${H}" fill="url(#${id}b)"/>
<circle cx="210" cy="110" r="40" fill="${m.sun}"/>
<path d="M0 300 L90 170 L170 300Z" fill="#6f7f9b"/>
<path d="M120 300 L210 150 L300 300Z" fill="#5b6a86"/>
<path d="M170 210 L210 150 L250 210 L228 214 L210 196 L192 214Z" fill="#ffffff"/>
<path d="M60 226 L90 170 L120 226 L104 228 L90 214 L76 228Z" fill="#ffffff"/>
<rect y="298" width="${W}" height="214" fill="#3f7a52"/><path d="M0 298 Q144 274 288 298 V330 H0Z" fill="#4c9161"/>
<g fill="#2f5f3f"><path d="M70 300 l16 -34 l16 34Z"/><path d="M96 302 l14 -28 l14 28Z"/><path d="M196 300 l16 -34 l16 34Z"/></g>`;
  },
  park(m, id) {
    return `<defs>${grad(id + "k", m.sky[0], m.sky[1])}</defs>
<rect width="${W}" height="320" fill="url(#${id}k)"/>
<circle cx="228" cy="90" r="38" fill="${m.sun}"/>
<rect y="300" width="${W}" height="212" fill="#5cbb6a"/><path d="M0 300 Q144 276 288 300 V340 H0Z" fill="#74cd80"/>
<g><rect x="70" y="200" width="16" height="130" fill="#7a4a2a"/><circle cx="78" cy="180" r="52" fill="#2f9e57"/><circle cx="44" cy="196" r="34" fill="#37ab60"/><circle cx="112" cy="196" r="34" fill="#37ab60"/></g>
<g><rect x="168" y="330" width="96" height="12" rx="3" fill="#b5793f"/><rect x="172" y="342" width="10" height="34" fill="#8a5a2e"/><rect x="250" y="342" width="10" height="34" fill="#8a5a2e"/><rect x="168" y="316" width="96" height="10" rx="3" fill="#c98a52"/></g>
<path d="M120 512 Q150 380 180 512Z" fill="#d9c39a"/>`;
  },
  dachterrasse(m, id) {
    return `<defs>${grad(id + "d", m.sky[0], m.sky[1])}</defs>
<rect width="${W}" height="${H}" fill="url(#${id}d)"/>
<circle cx="70" cy="90" r="34" fill="${m.sun}"/>
<g fill="#8b9bb5" fill-opacity="0.9"><rect x="20" y="250" width="40" height="120"/><rect x="70" y="210" width="46" height="160"/><rect x="128" y="270" width="38" height="100"/><rect x="176" y="230" width="44" height="140"/><rect x="230" y="260" width="40" height="110"/></g>
<g fill="#ffffff" fill-opacity="0.7"><rect x="28" y="266" width="10" height="12"/><rect x="44" y="266" width="10" height="12"/><rect x="80" y="230" width="10" height="12"/><rect x="98" y="230" width="10" height="12"/><rect x="186" y="252" width="10" height="12"/><rect x="240" y="280" width="10" height="12"/></g>
<rect y="370" width="${W}" height="142" fill="#c99a63"/><rect y="362" width="${W}" height="12" fill="#a97c46"/>
<polyline points="10,360 90,340 170,362 250,340 288,356" fill="none" stroke="#7a5a3a" stroke-width="3"/>
<g fill="${m.sun}"><circle cx="60" cy="352" r="6"/><circle cx="120" cy="352" r="6"/><circle cx="180" cy="356" r="6"/><circle cx="240" cy="350" r="6"/></g>
<g><rect x="196" y="322" width="34" height="48" rx="4" fill="#c98a52"/><path d="M213 322 C192 300 198 278 213 268 C228 278 234 300 213 322Z" fill="#2e9e5b"/></g>`;
  },
};

const SCENE_KEYS = ["strand", "schreibtisch", "garten", "zuhause", "cafe", "party", "berge", "park", "dachterrasse"];

function esc(s) {
  return String(s || "").replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

const LANG_TAG = { es: "ES", fr: "FR", en: "EN", nl: "NL", de: "DE" };

/**
 * Baut ein Lifestyle-Szenen-Thumbnail. `index` verteilt (Szene × Stimmung) so,
 * dass aufeinanderfolgende Karten unterschiedlich sind (9 Szenen × 5 Moods = 45
 * eindeutige Kombis).
 *
 * @param {{index:number, langCode?:string, seed?:number}} opts
 */
export function thumbSvg({ index = 0, langCode, seed = 0 } = {}) {
  const i = ((index % 45) + 45) % 45;
  const scene = SCENE_KEYS[i % SCENE_KEYS.length];
  const mood = MOODS[(Math.floor(i / SCENE_KEYS.length) + seed) % MOODS.length];
  const id = `t${index}`;
  const tag = LANG_TAG[langCode] || "";
  const tagEl = tag
    ? `<g><rect x="234" y="470" width="34" height="26" rx="8" fill="#ffffff" fill-opacity="0.85"/><text x="251" y="488" font-family="system-ui,sans-serif" font-size="13" font-weight="800" fill="#1c2027" text-anchor="middle">${esc(tag)}</text></g>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="ConjuExpert Blog">
<defs><clipPath id="${id}r"><rect width="${W}" height="${H}" rx="26"/></clipPath></defs>
<g clip-path="url(#${id}r)">
${SCENES[scene](mood, id)}
<text x="20" y="492" font-family="'Schibsted Grotesk',system-ui,sans-serif" font-size="16" font-weight="800" fill="#ffffff" fill-opacity="0.95">conju<tspan fill-opacity="0.72">expert</tspan></text>
${tagEl}
</g>
</svg>`;
}

/** Dateiname (relativ zu blog/img/) für einen Slug. */
export function thumbFileName(slug) {
  const s = String(slug || "").replace(/^\/?blog\//, "").replace(/\/index\.html$/, "").replace(/\/$/, "");
  const clean = s.split("/").filter(Boolean).pop() || "artikel";
  return `auto/${clean}.svg`;
}

export { SCENE_KEYS, MOODS };
