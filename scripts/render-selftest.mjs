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
const callout = (t, children) => ({ type: "callout", callout: { rich_text: [{ plain_text: t, annotations: {} }] }, _children: children || [] });
const bullet = (t) => ({ type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ plain_text: t, annotations: {} }] } });

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

// GEO-Akzeptanz: EIN Muster-Artikel zeigt ALLE VIER Bausteine live.
//   1) „Das Wichtigste in Kürze"-Box (kein „TL;DR", kein Emoji)
//   2) Inhaltsverzeichnis aus den H2
//   3) FAQ als Toggle (<details>)
//   4) Quellen-Liste aus Inline-Zitat + Belegpool
{
  const geoBlocks = [
    callout("🎯 Das Wichtigste in Kürze", [bullet("Aktives Abrufen schlägt passives Lesen."), bullet("Verteiltes Üben hält länger.")]),
    para("Studien zeigen das seit Jahren (Dunlosky et al., 2013)."),
    h2("Was ist aktives Abrufen?"), para("Ein Absatz mit Substanz und etwas Erklärung."),
    h2("Warum verteiltes Üben wirkt"), para("Noch ein Absatz mit Substanz."),
    h2("So setzt du es um"), para("Ein dritter Abschnitt rundet das Inhaltsverzeichnis ab."),
  ];
  const geoFaq = [{ q: "Wie oft sollte ich üben?", a_html: "<p>Lieber kurz und regelmäßig als selten und lang.</p>", a_text: "Lieber kurz und regelmäßig als selten und lang." }];

  let html = "";
  try {
    html = renderArticle({
      meta: { slug: "/blog/geo-bausteine-selbsttest", typ: "spoke", cluster: "lernmethode", pillarUp: "/blog/sprachen-lernen", downOrSiblings: [], metaDescription: "Test", sprache: "neutral" },
      title: "GEO-Bausteine — Selbsttest",
      contentBlocks: geoBlocks,
      faqItems: geoFaq,
      publishedSlugs: new Set(["/blog/sprachen-lernen"]),
      allArticles: {},
      datePublished: "2026-06-22",
    });
  } catch (e) {
    console.log(`❌ GEO-Akzeptanz: Render-Exception — ${e.message}`);
    failed++;
  }

  const checks = [
    ["Das-Wichtigste-Box", html.includes('class="keytakeaways"') && html.includes("Das Wichtigste in Kürze")],
    ["Box ohne Emoji", html.includes('class="keytakeaways"') && !/🎯/.test(html)],
    ["Box ohne TL;DR-Wording", !/TL;?\s*DR/i.test(html)],
    ["Inhaltsverzeichnis", html.includes('class="toc"') && (html.match(/<nav class="toc"[\s\S]*?<\/nav>/) || [""])[0].match(/<li>/g)?.length === 3],
    ["H2-Anker-IDs", html.includes('id="was-ist-aktives-abrufen"')],
    ["FAQ-Toggle", html.includes('id="faq"') && html.includes("<details>")],
    ["Quellen-Liste", html.includes('class="sources"') && html.includes("Dunlosky")],
  ];
  const guardProblems = auditRenderedHtml(html, { slug: "/blog/geo-bausteine-selbsttest" });
  const missing = checks.filter(([, ok]) => !ok).map(([n]) => n);
  if (missing.length || guardProblems.length) {
    console.log(`❌ GEO-Akzeptanz: fehlende Bausteine: ${missing.join(", ") || "—"}${guardProblems.length ? "; Guard: " + guardProblems.join(", ") : ""}`);
    failed++;
  } else {
    console.log("✅ GEO-Akzeptanz: alle vier Bausteine + Guard ok");
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

// Selbstkontrolle: Notion-Vorlagen-Platzhalter dürfen nie live rutschen
// (wiederholt vorgekommener Live-Bug, siehe Notion-Karten).
const metaPlaceholderHtml =
  "<!DOCTYPE html><html lang=\"de\"><head><title>x</title>" +
  "<meta name=\"description\" content=\"Meta (für Blog-Engine &amp; Freigabe)\" />" +
  "</head><body><h1>A</h1>Text</body></html>";
const metaPlaceholderProblems = auditRenderedHtml(metaPlaceholderHtml);
if (!metaPlaceholderProblems.some((p) => /Meta \(für Blog-Engine/.test(p))) {
  console.log("❌ Guard-Selbstkontrolle: Meta-Header-Platzhalter in der Description wurde NICHT erkannt!");
  failed++;
} else {
  console.log("✅ Guard-Selbstkontrolle: Meta-Header-Platzhalter in der Description erkannt");
}

const coverPlaceholderHtml =
  "<!DOCTYPE html><html lang=\"de\"><head><title>x</title></head><body><h1>A</h1>" +
  "Cover-Bild: beim Veröffentlichen ein passendes Canva-Asset einsetzen.</body></html>";
const coverPlaceholderProblems = auditRenderedHtml(coverPlaceholderHtml);
if (!coverPlaceholderProblems.some((p) => /Cover-Bild:/.test(p))) {
  console.log("❌ Guard-Selbstkontrolle: Cover-Bild-Editor-Platzhalter wurde NICHT erkannt!");
  failed++;
} else {
  console.log("✅ Guard-Selbstkontrolle: Cover-Bild-Editor-Platzhalter erkannt");
}

if (failed) {
  console.error(`\n💥 Render-Selbsttest fehlgeschlagen (${failed}) — Deploy blockiert.`);
  process.exit(1);
}
console.log("\n🎉 Render-Selbsttest grün — Chrome/Struktur sind in Ordnung.");
