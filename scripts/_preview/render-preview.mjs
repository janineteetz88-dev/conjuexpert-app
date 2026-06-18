/**
 * render-preview.mjs  —  DEV/LOCAL PREVIEW HARNESS ONLY
 *
 * NICHT für Produktion. Dieses Skript existiert ausschließlich, um aus den
 * Markdown-Fixtures (scripts/_preview/*.md) lokal Vorschau-HTML zu erzeugen,
 * damit der Render-Pipeline-Output (Hub + Spoke) reviewt werden kann.
 *
 * In Produktion kommen Blocks/Meta/FAQ aus der Notion-API und publishedSlugs
 * aus dem Live-Status — NICHT aus diesem Harness.
 *
 * Aufruf:  node scripts/_preview/render-preview.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseMetaBlock, validateMeta } from "../lib/meta-block.mjs";
import { normalizeFaq } from "../lib/faq.mjs";
import { renderArticle } from "../lib/render-article.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

/* ─── Mini Markdown → Notion-Block-Shapes ────────────────────────────────── */
/*
 * Deckt NUR die in den Fixtures vorkommenden Konstrukte ab:
 *   ## H2, ### H3, Absätze, <callout icon="x">..</callout>, > quote (mehrzeilig),
 *   - bullet, inline **bold**, *italic*, `code`, [text](url)
 * Erzeugt Block-Shapes exakt so, wie blocksToHtml() sie erwartet.
 */

// Inline-Markdown → rich_text-Items
function inlineToRichText(text) {
  const out = [];
  // Tokenizer: code | link | bold | italic | plain
  const re = /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push(plain(text.slice(last, m.index)));
    }
    const tok = m[0];
    if (tok.startsWith("`")) {
      out.push(annotated(tok.slice(1, -1), { code: true }));
    } else if (tok.startsWith("[")) {
      const lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      out.push({ plain_text: lm[1], annotations: {}, href: lm[2] });
    } else if (tok.startsWith("**")) {
      out.push(annotated(tok.slice(2, -2), { bold: true }));
    } else {
      out.push(annotated(tok.slice(1, -1), { italic: true }));
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(plain(text.slice(last)));
  return out.filter((t) => t.plain_text !== "");
}

function plain(t) {
  return { plain_text: t, annotations: {}, href: null };
}
function annotated(t, ann) {
  return { plain_text: t, annotations: ann, href: null };
}

// Konvertiert einen Markdown-Body (ohne Meta-Block, ohne FAQ) in Blocks.
function markdownToBlocks(md) {
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  const flushPara = (buf) => {
    const text = buf.join(" ").trim();
    if (text) blocks.push({ type: "paragraph", paragraph: { rich_text: inlineToRichText(text) } });
  };

  let paraBuf = [];

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Leerzeile → Absatz abschließen
    if (trimmed === "") {
      flushPara(paraBuf);
      paraBuf = [];
      i++;
      continue;
    }

    // Heading
    if (/^###\s+/.test(trimmed)) {
      flushPara(paraBuf); paraBuf = [];
      blocks.push({ type: "heading_3", heading_3: { rich_text: inlineToRichText(trimmed.replace(/^###\s+/, "")) } });
      i++;
      continue;
    }
    if (/^##\s+/.test(trimmed)) {
      flushPara(paraBuf); paraBuf = [];
      blocks.push({ type: "heading_2", heading_2: { rich_text: inlineToRichText(trimmed.replace(/^##\s+/, "")) } });
      i++;
      continue;
    }

    // Callout: <callout icon="x"> ... </callout>  (mehrzeilig)
    if (/^<callout/i.test(trimmed)) {
      flushPara(paraBuf); paraBuf = [];
      const buf = [];
      // inhalt evtl. auf derselben Zeile nach dem Tag
      const startRest = trimmed.replace(/^<callout[^>]*>/i, "");
      if (!/<\/callout>/i.test(trimmed)) {
        if (startRest.trim()) buf.push(startRest.trim());
        i++;
        while (i < lines.length && !/<\/callout>/i.test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        // Schlusszeile (kann Text vor </callout> haben)
        if (i < lines.length) {
          const end = lines[i].replace(/<\/callout>.*$/i, "");
          if (end.trim()) buf.push(end);
          i++;
        }
      } else {
        // einzeiliger Callout
        buf.push(startRest.replace(/<\/callout>.*$/i, ""));
        i++;
      }
      const text = buf.join("\n").trim();
      blocks.push({ type: "callout", callout: { rich_text: inlineToRichText(text.replace(/\n/g, " ")) }, _children: [] });
      continue;
    }

    // Quote: > ...  (mehrzeilig: aufeinanderfolgende > Zeilen ODER eingerückte Folgezeilen)
    if (/^>\s?/.test(trimmed)) {
      flushPara(paraBuf); paraBuf = [];
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const text = buf.join(" ").trim();
      blocks.push({ type: "quote", quote: { rich_text: inlineToRichText(text) } });
      continue;
    }

    // Bullet list
    if (/^[-*]\s+/.test(trimmed)) {
      flushPara(paraBuf); paraBuf = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^[-*]\s+/, "");
        blocks.push({ type: "bulleted_list_item", bulleted_list_item: { rich_text: inlineToRichText(item) } });
        i++;
      }
      continue;
    }

    // sonst: Absatztext akkumulieren
    paraBuf.push(trimmed);
    i++;
  }
  flushPara(paraBuf);
  return blocks;
}

/* ─── Fixture-Splitting: Meta / Body / FAQ ───────────────────────────────── */

function splitFixture(raw) {
  const text = raw.replace(/<\/content>\s*$/i, "").trimEnd();
  const lines = text.split(/\r?\n/);

  // FAQ-Sektion: ab "## FAQ" bis Ende.  (Die ## FAQ-Überschrift wird verworfen —
  // der FAQ-Renderer besitzt die <h2 id="faq">.)
  let faqStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+FAQ\s*$/i.test(lines[i].trim())) { faqStart = i; break; }
  }

  const bodyLines = faqStart === -1 ? lines : lines.slice(0, faqStart);
  const faqLines = faqStart === -1 ? [] : lines.slice(faqStart + 1);

  // Meta-Block aus dem Body entfernen (er endet vor erstem Heading/Callout/Quote/Leerzeile-nach-Bullets).
  // Praktisch: Meta-Block ist der zusammenhängende Bullet-Block direkt nach dem Header
  // bis zur ersten Leerzeile. Wir schneiden ab dieser Leerzeile.
  let bodyStart = 0;
  if (bodyLines[0] && bodyLines[0].trim().startsWith("**Meta")) {
    for (let i = 1; i < bodyLines.length; i++) {
      if (bodyLines[i].trim() === "") { bodyStart = i + 1; break; }
    }
  }
  const contentLines = bodyLines.slice(bodyStart);

  return {
    metaSection: lines.join("\n"),       // ganzer Text reicht dem Meta-Parser (findet Header selbst)
    bodyMarkdown: contentLines.join("\n").trim(),
    faqMarkdown: faqLines.join("\n").trim(),
  };
}

// Titel = erste H2? Nein — Fixtures haben keinen # Titel. Wir leiten aus Keyword/Slug ab,
// bevorzugt aus meta.keyword (lesbar), sonst humanisierter Slug.
function deriveTitle(meta) {
  if (meta.keyword && meta.keyword.trim()) {
    // Keyword als Titel verwenden (z. B. "Sprachen lernen", "Lernmythen Sprachenlernen")
    return meta.keyword.trim();
  }
  return meta.slug
    ? meta.slug.replace(/^\/blog\//, "").split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
    : "Artikel";
}

/* ─── Welle-1 publishedSlugs (für Vorschau alle veröffentlicht) ──────────── */

const WAVE1_SLUGS = new Set([
  "/blog/sprachen-lernen", // Hub
  "/blog/active-recall-sprachenlernen",
  "/blog/spaced-repetition-sprachenlernen",
  "/blog/interleaving-sprachenlernen",
  "/blog/feynman-methode-grammatik",
  "/blog/lernmythen-sprachenlernen",
  "/blog/dranbleiben-motivation-sprachenlernen",
  "/blog/haeufigste-probleme-sprachenlernen",
  "/blog/verben-lernen-tipps",
  "/blog/aktiv-lernen-statt-tabellen-auswendig",
]);

// Titel-Lookup (humanisiert / kuratiert) für hübschere Karten.
const ARTICLE_TITLES = {
  "/blog/sprachen-lernen": { title: "Sprachen lernen: der evidenzbasierte Überblick" },
  "/blog/active-recall-sprachenlernen": { title: "Aktives Abrufen beim Sprachenlernen" },
  "/blog/spaced-repetition-sprachenlernen": { title: "Spaced Repetition beim Sprachenlernen" },
  "/blog/interleaving-sprachenlernen": { title: "Interleaving beim Sprachenlernen" },
  "/blog/feynman-methode-grammatik": { title: "Die Feynman-Methode für Grammatik" },
  "/blog/lernmythen-sprachenlernen": { title: "Lernmythen beim Sprachenlernen" },
  "/blog/dranbleiben-motivation-sprachenlernen": { title: "Dranbleiben & Motivation beim Sprachenlernen" },
  "/blog/haeufigste-probleme-sprachenlernen": { title: "Die häufigsten Probleme beim Sprachenlernen" },
  "/blog/verben-lernen-tipps": { title: "7 Tipps fürs Verben lernen" },
  "/blog/aktiv-lernen-statt-tabellen-auswendig": { title: "Aktiv lernen statt Tabellen auswendig" },
  "/blog/verben-konjugieren-lernen": { title: "Verben konjugieren lernen" },
};

/* ─── Pipeline für eine Fixture ──────────────────────────────────────────── */

function processFixture(fixtureFile, outFile) {
  const raw = readFileSync(join(__dirname, fixtureFile), "utf8");

  const meta = parseMetaBlock(raw);
  const validation = validateMeta(meta);

  const { bodyMarkdown, faqMarkdown } = splitFixture(raw);
  const contentBlocks = markdownToBlocks(bodyMarkdown);
  const faqItems = normalizeFaq(faqMarkdown);
  // Vorschau: echten/lesbaren Seitentitel bevorzugt aus dem Lookup (in Prod = Notion-Seitentitel),
  // sonst Fallback auf keyword/Slug.
  const title = (ARTICLE_TITLES[meta.slug] && ARTICLE_TITLES[meta.slug].title) || deriveTitle(meta);

  const html = renderArticle({
    meta,
    title,
    contentBlocks,
    faqItems,
    publishedSlugs: WAVE1_SLUGS,
    allArticles: ARTICLE_TITLES,
  });

  const outPath = join(__dirname, "out", outFile);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, "utf8");

  return { meta, validation, faqCount: faqItems.length, title, outPath, html };
}

/* ─── Run ────────────────────────────────────────────────────────────────── */

function quickChecks(label, r) {
  const h = r.html;
  const faqH2 = (h.match(/<h2 id="faq">/g) || []).length;
  const faqSchema = /"@type":\s*"FAQPage"/.test(h);
  const speakable = /"@type":\s*"SpeakableSpecification"/.test(h);
  const hasDown = /CLUSTER:DOWN/.test(h);
  const hasRelated = /CLUSTER:RELATED/.test(h);
  const hasUp = /CLUSTER:UP/.test(h);

  // Links nur auf published prüfen: alle href="/blog/...." cluster-card/up Links
  const linkSlugs = [...h.matchAll(/href="(\/blog\/[^"#?]+?)\/"/g)].map((m) => m[1]);
  const unpublished = [...new Set(linkSlugs)].filter(
    (s) => !WAVE1_SLUGS.has(s) && !ARTICLE_TITLES[s]
  );

  console.log(`\n── ${label} ──`);
  console.log(`  Titel:           ${r.title}`);
  console.log(`  Typ:             ${r.meta.typ}`);
  console.log(`  Validator:       ${r.validation.ok ? "OK" : "FEHLER: " + r.validation.errors.join("; ")}`);
  console.log(`  FAQ-Items:       ${r.faqCount}`);
  console.log(`  <h2 id="faq">:   ${faqH2}`);
  console.log(`  FAQPage-Schema:  ${faqSchema}`);
  console.log(`  speakable:       ${speakable}`);
  console.log(`  Up-Link:         ${hasUp}`);
  console.log(`  Related-Sekt.:   ${hasRelated}`);
  console.log(`  Down-Sekt.:      ${hasDown}`);
  console.log(`  Unpub. Card-Links (außerhalb Welle1): ${unpublished.length ? unpublished.join(", ") : "keine"}`);
  console.log(`  → ${r.outPath}`);
}

const hub = processFixture("hub-sprachen-lernen.md", "sprachen-lernen.html");
const spoke = processFixture("spoke-lernmythen.md", "lernmythen-sprachenlernen.html");

quickChecks("HUB (sprachen-lernen)", hub);
quickChecks("SPOKE (lernmythen-sprachenlernen)", spoke);

console.log("\nFertig. Zwei HTML-Dateien geschrieben.\n");
