/**
 * filter-blog-photos.mjs
 *
 * Legt einen EINHEITLICHEN, warmen Film-Grade über alle generierten
 * Karten-Fotos (blog/img/auto/*.jpg), damit sie wie ein zusammengehöriges Set
 * wirken. Reine sharp-Nachbearbeitung, kein API-/Netzzugriff.
 *
 *   node scripts/filter-blog-photos.mjs
 */
import sharp from "sharp";
import { readdirSync } from "node:fs";

const DIR = "blog/img/auto";
const W = 640, H = 1138;

export async function filterBuffer(inputBuf) {
  // Warme Tonungs-Ebene (soft-light) für den einheitlichen Look.
  const warm = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 226, g: 170, b: 116, alpha: 0.32 } },
  }).png().toBuffer();

  return sharp(inputBuf)
    .resize(W, H, { fit: "cover" })
    .modulate({ saturation: 0.86, brightness: 1.02 }) // etwas entsättigt, leicht heller
    .linear(1.06, -8) // sanfter Kontrast (S-Kurve-Ansatz)
    .composite([{ input: warm, blend: "soft-light" }])
    .jpeg({ quality: 76, mozjpeg: true })
    .toBuffer();
}

// Als Skript: alle vorhandenen Fotos in-place graden.
if (import.meta.url === `file://${process.argv[1]}`) {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".jpg"));
  let n = 0;
  for (const f of files) {
    const p = `${DIR}/${f}`;
    const { readFileSync, writeFileSync } = await import("node:fs");
    const out = await filterBuffer(readFileSync(p));
    writeFileSync(p, out);
    n++;
  }
  console.log(`Einheitlicher Film-Grade auf ${n} Fotos angewendet.`);
}
