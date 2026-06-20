/**
 * render-selftest.mjs
 *
 * Pre-Deploy-Schranke (läuft in CI VOR dem Publish, ohne Notion):
 * rendert Muster-Artikel (Hub / Spoke / Methodik) mit der echten
 * renderArticle-Funktion und prüft sie mit dem Render-Guard. Schlägt eine
 * Invariante fehl, bricht der Lauf ab → der Publish-Schritt startet nicht,
 * es geht nichts Kaputtes online. Zusätzlich wird verifiziert, dass der
 * Guard echte Defekte auch wirklich meldet.
 */
import { renderArticle } from "./lib/render-article.mjs";
import { auditRenderedHtml } from "./lib/render-guard.mjs";

const para = (t) => ({ type: "paragraph", paragraph: { rich_text: [{ plain_text: t, annotations: { bold: false, italic: false } }] } });
const h2 = (t) => ({ type: "heading_2", heading_2: { rich_text: [{ plain_text: t, annotations: {} }] } });

const baseBlocks = [para("Ein Beispielabsatz mit etwas Inhalt."), h2("Ein Abschnitt"), para("Noch ein Absatz mit Substanz.")];
const faq = []; // FAQ-Inhalt ist für den Chrome/Struktur-Test nicht nötig

const samples = [
  {
    name: "Hub (Englisch)",
    args: { meta: { slug: "/blog/englisch-verben-konjugieren", typ: "hub", cluster: "en-grammatik", pillarUp: "/blog/verben-konjugieren-lernen", downOrSiblings: [], metaDescription: "Test" }, title: "Englische Verben konjugieren — der große Überblick", contentBlocks: baseBlocks, faqItems: faq },
  },
  {
    name: "Spoke (Spanisch)",
    args: { meta: { slug: "/blog/subjuntivo-spanisch", typ: "spoke", cluster: "es-grammatik", pillarUp: "/blog/spanisch-verben-konjugieren", downOrSiblings: [], metaDescription: "Test" }, title: "Subjuntivo verstehen", contentBlocks: baseBlocks, faqItems: faq },
  },
  {
    name: "Methodik (neutral)",
    args: { meta: { slug: "/blog/active-recall-sprachenlernen", typ: "spoke", cluster: "lernmethode", pillarUp: "/blog/sprachen-lernen-methoden", downOrSiblings: [], metaDescription: "Test", sprache: "neutral" }, title: "Active Recall fürs Sprachenlernen", contentBlocks: baseBlocks, faqItems: faq },
  },
];

let failed = 0;

for (const s of samples) {
  let html = "";
  try {
    html = renderArticle({ ...s.args, publishedSlugs: new Set([s.args.meta.pillarUp]), allArticles: {}, datePublished: "2026-06-20" });
  } catch (e) {
    console.log(`❌ ${s.name}: Render-Exception — ${e.message}`);
    failed++;
    continue;
  }
  const problems = auditRenderedHtml(html, { slug: s.args.meta.slug });
  if (problems.length) {
    console.log(`❌ ${s.name}: Guard meldet ${problems.length} Problem(e):`);
    for (const p of problems) console.log(`     • ${p}`);
    failed++;
  } else {
    console.log(`✅ ${s.name}: Chrome/Struktur ok`);
  }
}

// Selbstkontrolle: der Guard MUSS einen offensichtlich kaputten Artikel melden.
const brokenProblems = auditRenderedHtml("<!DOCTYPE html><html lang=\"de\"><head><title>x</title></head><body><h1>A</h1><h1>B</h1>Methodik · Methodik</body></html>");
if (brokenProblems.length === 0) {
  console.log("❌ Guard-Selbstkontrolle: kaputtes HTML wurde NICHT erkannt!");
  failed++;
} else {
  console.log(`✅ Guard-Selbstkontrolle: kaputtes HTML erkannt (${brokenProblems.length} Probleme)`);
}

if (failed) {
  console.error(`\n💥 Render-Selbsttest fehlgeschlagen (${failed}) — Deploy blockiert.`);
  process.exit(1);
}
console.log("\n🎉 Render-Selbsttest grün — Chrome/Struktur sind in Ordnung.");
