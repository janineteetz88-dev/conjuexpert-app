/**
 * gen-blog-thumbs.mjs
 *
 * Erzeugt für JEDE .post-Kachel der Blog-Startseite ein eindeutiges Lifestyle-
 * Thumbnail (blog/img/auto/<slug>.svg) und ersetzt das bisher mehrfach benutzte
 * Foto in blog/index.html. Das große Featured oben (class "featured") bleibt
 * unangetastet.
 *
 * Lauf:  node scripts/gen-blog-thumbs.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { thumbSvg, thumbFileName } from "./lib/thumb-gen.mjs";

const HTML = "blog/index.html";

function langFromSlug(s) {
  if (/spanisch|indefinido|imperfecto|perfecto|subjuntivo|imperativo|estar-gerundio|ser-vs-estar|stammwechsel|reflexive|unregelmaessige-verben-spanisch|futuro-ir-a|verbgruppen|preterito/.test(s)) return "es";
  if (/franzoesisch|passe-compose|imparfait|futur-simple|futur-proche|subjonctif|verneinung/.test(s)) return "fr";
  if (/englisch|irregular-verbs/.test(s)) return "en";
  if (/niederlaendisch|kofschip|hebben-of-zijn|sterke-werkwoorden/.test(s)) return "nl";
  if (/trennbare-verben-deutsch/.test(s)) return "de";
  return null; // learn/methodik/produkt → neutral
}

let html = readFileSync(HTML, "utf8");
mkdirSync("blog/img/auto", { recursive: true });

const idxBySlug = new Map();
let cardCount = 0;

html = html.replace(/<a class="post"[^>]*href="(\/blog\/[^"]+?)\/?"[\s\S]*?<\/a>/g, (block, href) => {
  cardCount++;
  const slug = href.replace(/^\/blog\//, "").replace(/\/$/, "");
  if (!idxBySlug.has(slug)) idxBySlug.set(slug, idxBySlug.size);
  const index = idxBySlug.get(slug);
  const langCode = langFromSlug(slug);
  const file = thumbFileName(slug); // auto/<slug>.svg

  writeFileSync(`blog/img/${file}`, thumbSvg({ index, langCode }));

  const titleM = block.match(/<h3>\s*<span data-l="de">([\s\S]*?)<\/span>/);
  const alt = (titleM ? titleM[1].replace(/<[^>]+>/g, "").trim() : slug).replace(/"/g, "&quot;");
  const newImg = `<img class="duoimg" src="/blog/img/${file}" alt="${alt}" width="142" height="252" loading="lazy" />`;

  let out = block;
  if (/<picture>[\s\S]*?<\/picture>/.test(out)) {
    out = out.replace(/<picture>[\s\S]*?<\/picture>/, newImg);
  } else {
    out = out.replace(/<img class="duoimg"[^>]*>/, newImg);
  }
  return out;
});

writeFileSync(HTML, html);
console.log(`Karten: ${cardCount} · eindeutige Slugs/Thumbnails: ${idxBySlug.size}`);
