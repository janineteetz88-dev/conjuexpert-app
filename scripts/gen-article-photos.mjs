/**
 * gen-article-photos.mjs
 *
 * Erzeugt pro Blog-Artikel ein EINDEUTIGES Lifestyle-Foto (warmer, editorialer
 * Film-Look — wie die bestehenden Bilder) über die Google-Imagen-API und setzt
 * es als Karten-Thumbnail auf der Blog-Startseite ein. Kein Foto je doppelt.
 *
 * Läuft dort, wo Netz + Key vorhanden sind (GitHub Action / lokal), NICHT in der
 * Claude-Sandbox. Key: Umgebungsvariable GOOGLE_API_KEY.
 *
 *   GOOGLE_API_KEY=… node scripts/gen-article-photos.mjs           # fehlende erzeugen
 *   GOOGLE_API_KEY=… node scripts/gen-article-photos.mjs --force   # alle neu
 *   node scripts/gen-article-photos.mjs --wire-only                # nur HTML verdrahten
 *
 * Idempotent: vorhandene blog/img/auto/<slug>.jpg werden übersprungen (außer --force).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import sharp from "sharp";

const HTML = "blog/index.html";
const OUT_DIR = "blog/img/auto";
const MODEL = process.env.GEN_MODEL || "imagen-3.0-generate-002";
const KEY = process.env.GOOGLE_API_KEY || "";
const FORCE = process.argv.includes("--force");
const WIRE_ONLY = process.argv.includes("--wire-only");

/* ─── Lifestyle-Szenen (photographisch, markenkonform) ───────────────────── */
const SCENES = [
  "a sunlit sandy beach with a white canvas parasol and two wooden deck chairs by a calm blue sea",
  "a cozy café table by a window with a cup of coffee and an open notebook",
  "a tidy home desk near a window with a laptop, a ceramic mug and a small potted plant",
  "a lush green garden with wildflowers and a weathered wooden bench",
  "a leafy park path with a wooden bench and dappled sunlight",
  "a rustic kitchen table with fresh fruit and a linen cloth by a bright window",
  "a reading nook with a stack of books, a folded blanket and a warm lamp",
  "a train window seat overlooking passing green countryside",
  "a rooftop terrace with string lights and potted plants, city skyline behind",
  "a beach towel on warm sand with a straw hat and a halved watermelon",
  "an open sunny balcony with a small bistro table, a book and a glass of lemonade",
  "a quiet home library corner with full bookshelves and a comfy armchair",
  "a wooden pier over calm water with a bicycle leaning against the railing",
  "a countryside picnic blanket in tall grass with a woven basket",
  "a bright bedroom window with sheer curtains, morning coffee on the sill",
  "a harbor promenade with sailboats and a bench in soft afternoon light",
];
const MOODS = [
  "soft morning daylight",
  "warm golden-hour light",
  "bright midday sun",
  "gentle overcast light",
];
const STYLE =
  "Warm editorial 35mm film-style lifestyle photograph. Natural light, muted analog color grade, subtle film grain, shallow depth of field, calm and candid. No text, no watermark, no logos, no visible faces. Vertical composition.";

function promptFor(index) {
  const scene = SCENES[index % SCENES.length];
  const mood = MOODS[Math.floor(index / SCENES.length) % MOODS.length];
  return `${STYLE} Scene: ${scene}, ${mood}.`;
}

/* ─── Google-Imagen-Aufruf → JPEG-Buffer ─────────────────────────────────── */
async function generate(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict`;
  const body = {
    instances: [{ prompt }],
    parameters: { sampleCount: 1, aspectRatio: "9:16", personGeneration: "allow_adult" },
  };
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": KEY },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const json = await res.json();
      const b64 = json?.predictions?.[0]?.bytesBase64Encoded;
      if (!b64) throw new Error(`keine Bilddaten: ${JSON.stringify(json).slice(0, 300)}`);
      return Buffer.from(b64, "base64");
    } catch (e) {
      lastErr = e;
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 2500));
    }
  }
  throw lastErr;
}

/* ─── Karten aus blog/index.html lesen (slug + Titel) ────────────────────── */
function readCards() {
  const html = readFileSync(HTML, "utf8");
  const cards = [];
  const seen = new Set();
  const re = /<a class="post"[^>]*href="(\/blog\/[^"]+?)\/?"[\s\S]*?<\/a>/g;
  let m;
  while ((m = re.exec(html))) {
    const slug = m[1].replace(/^\/blog\//, "").replace(/\/$/, "");
    if (seen.has(slug)) continue;
    seen.add(slug);
    const tM = m[0].match(/<h3>\s*<span data-l="de">([\s\S]*?)<\/span>/);
    const title = tM ? tM[1].replace(/<[^>]+>/g, "").trim() : slug;
    cards.push({ slug, title });
  }
  return cards;
}

/* ─── HTML verdrahten: jede .post-Kachel → blog/img/auto/<slug>.jpg ───────── */
function wireHtml() {
  let html = readFileSync(HTML, "utf8");
  html = html.replace(/<a class="post"[^>]*href="(\/blog\/[^"]+?)\/?"[\s\S]*?<\/a>/g, (block, href) => {
    const slug = href.replace(/^\/blog\//, "").replace(/\/$/, "");
    if (!existsSync(`${OUT_DIR}/${slug}.jpg`)) return block; // noch kein Foto → unverändert
    const tM = block.match(/<h3>\s*<span data-l="de">([\s\S]*?)<\/span>/);
    const alt = (tM ? tM[1].replace(/<[^>]+>/g, "").trim() : slug).replace(/"/g, "&quot;");
    const img = `<img class="duoimg" src="/blog/img/auto/${slug}.jpg" alt="${alt}" width="142" height="252" loading="lazy" />`;
    let out = block;
    if (/<picture>[\s\S]*?<\/picture>/.test(out)) out = out.replace(/<picture>[\s\S]*?<\/picture>/, img);
    else out = out.replace(/<img class="duoimg"[^>]*>/, img);
    return out;
  });
  writeFileSync(HTML, html);
}

/* ─── Hauptlauf ──────────────────────────────────────────────────────────── */
const cards = readCards();
mkdirSync(OUT_DIR, { recursive: true });

if (!WIRE_ONLY) {
  if (!KEY) {
    console.error("FEHLER: GOOGLE_API_KEY nicht gesetzt. Nur --wire-only ist ohne Key möglich.");
    process.exit(1);
  }
  let made = 0, skipped = 0;
  for (let i = 0; i < cards.length; i++) {
    const { slug } = cards[i];
    const dest = `${OUT_DIR}/${slug}.jpg`;
    if (existsSync(dest) && !FORCE) { skipped++; continue; }
    process.stdout.write(`  [${i + 1}/${cards.length}] ${slug} … `);
    const png = await generate(promptFor(i));
    await sharp(png).resize(640, 1138, { fit: "cover" }).jpeg({ quality: 74, mozjpeg: true }).toFile(dest);
    made++;
    console.log("ok");
  }
  console.log(`Fotos erzeugt: ${made} · übersprungen: ${skipped}`);
}

wireHtml();
console.log(`HTML verdrahtet (${cards.length} Karten geprüft).`);
