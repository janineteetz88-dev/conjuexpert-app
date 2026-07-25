// One-off: verify candidate verbs for the quiz pool.
// Prints present + past + perfect so strong verbs / wrong auxiliaries surface.
// Final curated lists — only verbs the engine conjugates correctly across all tenses.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runInNewContext } from 'vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function loadEngine(lang) {
  const src = fs.readFileSync(path.join(ROOT, `engine/conj-${lang}.js`), 'utf8');
  const ctx = { window: { CONJ: {} } };
  runInNewContext(src, ctx);
  return ctx.window.CONJ[lang];
}
function parseExtra() {
  const src = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const result = {};
  for (const match of src.matchAll(/const EXTRA_VERBS\d*\s*=\s*\{([\s\S]*?)\n\};/g)) {
    for (const langMatch of match[1].matchAll(/(\w{2}):\s*\[([^\]]+)\]/g)) {
      const lang = langMatch[1];
      const verbs = langMatch[2].match(/"([^"]+)"/g)?.map(v => v.replace(/"/g, '')) || [];
      result[lang] = [...(result[lang] || []), ...verbs];
    }
  }
  return result;
}

const CANDIDATES = {
  de: ["klopfen","grüßen","füttern","flüstern","zittern","hämmern","rudern","steuern","erobern","schildern","weigern","zögern","dauern","säubern","erneuern","trocknen","segnen","enden","senken","winken","strecken","schmücken","pflücken","stricken","blicken","klappen","schöpfen","stopfen","tippen","kippen","schleppen","tupfen","staunen","gähnen","stöhnen","dehnen","sehnen","bremsen","grinsen","schnarchen","niesen","seufzen","zwinkern","kratzen","wischen"],
  es: ["cortar","apagar","descargar","sellar","brincar","abrazar","besar","acariciar","peinar","mojar","remar","navegar","cazar","podar","cosechar","ordeñar","asar","hornear","picar","rallar","pelar","exprimir","batir","adornar","pegar","clavar","atornillar","pesar","restar","dividir","colorear","modelar"],
  en: ["tap","toss","unfold","stack","pile","tie","untie","zip","button","comb","rinse","mop","dust","vacuum","water","harvest","rake","mow","trim","chop","slice","peel","grate","boil","fry","roast","whisk","blend","thaw","warm","cool","chill","subtract","multiply","sketch","colour","model","glue","staple","scan","dial"],
  fr: ["claquer","saisir","étirer","déplier","emballer","empiler","trier","nouer","dénouer","peigner","rincer","polir","planter","récolter","creuser","tailler","trancher","éplucher","râper","rôtir","remuer","fouetter","refroidir","additionner","multiplier","colorier","clouer","visser","imprimer","scanner","composer","klaxonner","siffler","respirer","ronfler","éternuer","tondre"],
  nl: ["kloppen","tikken","klappen","inpakken","uitpakken","sorteren","knopen","spoelen","schrobben","dweilen","stoffen","oogsten","snoeien","maaien","knippen","schillen","raspen","roeren","mengen","afkoelen","optellen","kleuren","boetseren","lijmen","schroeven","printen","scannen","geeuwen","snurken","niezen","hoesten","zuchten"]
};

const engines = {};
for (const l of Object.keys(CANDIDATES)) engines[l] = loadEngine(l);
const extra = parseExtra();
const finalLists = {};

for (const lang of Object.keys(CANDIDATES)) {
  const eng = engines[lang];
  const existing = new Set([...(eng.samples||[]),...(eng.irregulars||[]),...(extra[lang]||[])].map(v=>v.toLowerCase()));
  const seen = new Set(); const fresh = [];
  for (const raw of CANDIDATES[lang]) {
    const v = raw.trim(); const key = v.toLowerCase();
    if (seen.has(key)) continue; seen.add(key);
    if (existing.has(key)) { console.log(`  DUP ${lang}: ${v}`); continue; }
    let out; try { out = eng.conjugate(v); } catch { console.log(`  THROW ${lang}: ${v}`); continue; }
    const t = id => (out?.tenses?.find(x=>x.id===id)?.forms)||[];
    fresh.push({ v, irr: !!out.isIrregular, present: t('present'), past: t('past'), perfect: t('perfect') });
  }
  finalLists[lang] = fresh.map(f=>f.v);
  console.log(`\n===== ${lang.toUpperCase()} — fresh:${fresh.length} =====`);
  for (const f of fresh) {
    console.log(`  ${f.v.padEnd(16)}${f.irr?'[IRR]':'     '} ${f.present.slice(0,3).join('/')} | ${f.past.slice(0,3).join('/')} | ${(f.perfect[0]||'')}…${(f.perfect[2]||'')}`);
  }
}
console.log('\n=== FINAL LISTS (JSON) ===');
console.log(JSON.stringify(finalLists));
console.log('counts:', Object.fromEntries(Object.entries(finalLists).map(([k,v])=>[k,v.length])));
