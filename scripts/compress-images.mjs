#!/usr/bin/env node
/**
 * Konvertiert Blog/Root-Bilder zu WebP und aktualisiert inline <img>-Tags.
 *
 * Was es tut:
 *  1. Löscht bekannte Duplikat-Dateien
 *  2. Konvertiert blog/img/*.{jpg,png} → .webp (Sharp, q=80–82)
 *  3. Konvertiert Root-Pexels-JPEGs → .webp
 *  4. Ersetzt inline <img src="/blog/img/X.ext"> in allen HTML-Dateien
 *     durch <picture><source srcset=".webp" type="image/webp"><img ...></picture>
 *
 * Aufruf: node scripts/compress-images.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// ─── 1. Duplikate löschen ────────────────────────────────────────────────────

const DUPLICATES = [
  'pexels-karola-g-4996971 (1).jpg',
  'pexels-olly-920384 (1).jpg',
];

console.log('=== Duplikate löschen ===');
for (const dup of DUPLICATES) {
  const p = path.join(ROOT, dup);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log('  Gelöscht:', dup);
  } else {
    console.log('  Nicht gefunden (bereits erledigt?):', dup);
  }
}

// ─── 2. WebP-Konvertierung ───────────────────────────────────────────────────

async function toWebp(src, quality) {
  const dst = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  if (fs.existsSync(dst)) return dst; // schon vorhanden
  await sharp(src).webp({ quality }).toFile(dst);
  const origKB = Math.round(fs.statSync(src).size / 1024);
  const newKB  = Math.round(fs.statSync(dst).size / 1024);
  const pct = Math.round((1 - newKB / origKB) * 100);
  console.log(`  ${path.relative(ROOT, src)} ${origKB} KB → ${newKB} KB (${pct}% kleiner)`);
  return dst;
}

console.log('\n=== blog/img/ konvertieren (inkl. Unterordner) ===');
const blogImgDir = path.join(ROOT, 'blog/img');

function findImages(dir, results = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.isDirectory()) {
      findImages(path.join(dir, f.name), results);
    } else if (/\.(jpg|jpeg|png)$/i.test(f.name)) {
      results.push(path.join(dir, f.name));
    }
  }
  return results;
}

for (const p of findImages(blogImgDir)) {
  const ext = path.extname(p).toLowerCase();
  await toWebp(p, ext === '.png' ? 80 : 82);
}

console.log('\n=== Root Pexels-Bilder konvertieren ===');
for (const f of fs.readdirSync(ROOT)) {
  if (/^pexels.*\.(jpg|jpeg)$/i.test(f) && !f.includes('(')) {
    await toWebp(path.join(ROOT, f), 82);
  }
}

// ─── 3. HTML-Dateien aktualisieren ───────────────────────────────────────────
//
// Ersetzt <img ...src="/blog/img/X.{jpg|jpeg|png}"...> durch
// <picture><source srcset="/blog/img/X.webp" type="image/webp">
//   <img ...src="/blog/img/X.{jpg|jpeg|png}"...></picture>
//
// Überspringt Tags, die bereits innerhalb von <picture> stehen.

const IMG_RE = /<img\b([^>]*?)src="(\/blog\/img\/[^"]+\.(jpg|jpeg|png))"([^>]*?)\/?>(?!<\/picture>)/gi;

function addWebpPicture(html) {
  return html.replace(IMG_RE, (match, pre, src, _ext, post) => {
    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    // Nur wrappen, wenn die WebP-Datei tatsächlich existiert — sonst 404 im <source>,
    // das <picture> fällt bei einem fehlgeschlagenen Source-Request NICHT auf <img> zurück.
    if (!fs.existsSync(path.join(ROOT, webpSrc))) return match;
    const selfClose = match.endsWith('/>') ? ' />' : '>';
    const imgTag = `<img${pre}src="${src}"${post}${selfClose}`;
    return `<picture><source srcset="${webpSrc}" type="image/webp">${imgTag}</picture>`;
  });
}

console.log('\n=== HTML-Dateien aktualisieren ===');

function findHtmlFiles(dir, results = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.isDirectory() && f.name !== 'node_modules' && !f.name.startsWith('.')) {
      findHtmlFiles(path.join(dir, f.name), results);
    } else if (f.isFile() && f.name.endsWith('.html')) {
      results.push(path.join(dir, f.name));
    }
  }
  return results;
}

let htmlUpdated = 0;
for (const htmlFile of findHtmlFiles(ROOT)) {
  const original = fs.readFileSync(htmlFile, 'utf8');
  const updated  = addWebpPicture(original);
  if (updated !== original) {
    fs.writeFileSync(htmlFile, updated, 'utf8');
    const rel = path.relative(ROOT, htmlFile);
    const count = (updated.match(/<picture>/g) || []).length - (original.match(/<picture>/g) || []).length;
    console.log(`  ${rel} (+${count} picture-Elemente)`);
    htmlUpdated++;
  }
}
console.log(`  ${htmlUpdated} Dateien aktualisiert.`);

console.log('\nFertig.');
