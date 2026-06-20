/**
 * render-article.mjs
 *
 * Generischer, meta-block-getriebener Artikel-Renderer.
 *
 *   renderArticle({ meta, title, contentBlocks, faqItems, publishedSlugs, allArticles }) → htmlString
 *
 * Hub vs. Spoke werden UNTERSCHIEDLICH gerendert (siehe unten), aber datengetrieben —
 * keine Artikel-Sonderfälle. Reuse der bestehenden Seiten-/CSS-Struktur aus notion-to-html.mjs.
 *
 * Leitplanke 2: Cluster-/Up-/Down-/Related-Links werden NUR gerendert, wenn ihr Ziel-Slug
 * in publishedSlugs liegt. Interne Prosa-Links im Fließtext bleiben unangetastet.
 */

import {
  esc,
  blocksToHtml,
  estimateReadTime,
  formatDate,
  today,
  LANG_MAP,
  BASE_URL,
} from "../notion-to-html.mjs";

import {
  renderFaqHtml,
  renderFaqSchema,
  speakableSchema,
} from "./faq.mjs";

/* ─── Sprache: neutraler Eintrag für sprach-neutrale Methodik-Artikel ────── */

const NEUTRAL_LANG = {
  code: "de",
  color: "#34c759",
  grad: "linear-gradient(140deg,#34c759,#0a84ff)",
  label: "Methodik",
};

function resolveLang(meta) {
  const s = String(meta.sprache || "").trim();
  if (s && !/neutral/i.test(s)) {
    for (const [k, v] of Object.entries(LANG_MAP)) {
      if (k.toLowerCase() === s.toLowerCase()) return v;
    }
  }
  // Fallback: Sprache aus dem Cluster-Präfix ableiten (es-/fr-/en-/nl-/de-…),
  // damit Sprach-Hubs/Spokes nicht fälschlich als "Methodik" (neutral) rendern.
  const cl = String(meta.cluster || "").trim().toLowerCase();
  const m = cl.match(/^(es|fr|en|nl|de)\b/);
  if (m) {
    const byCode = { es: "Spanisch", fr: "Französisch", en: "Englisch", nl: "Niederländisch", de: "Deutsch" };
    const v = LANG_MAP[byCode[m[1]]];
    if (v) return v;
  }
  return NEUTRAL_LANG;
}

/* ─── Slug-Helpers ───────────────────────────────────────────────────────── */

function isPublished(slug, publishedSlugs) {
  if (!slug) return false;
  return publishedSlugs && publishedSlugs.has(slug);
}

// "/blog/active-recall-sprachenlernen" → "Active Recall Sprachenlernen"
function humanizeSlug(slug) {
  return String(slug || "")
    .replace(/^\/blog\//, "")
    .replace(/\/$/, "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Titel-Lookup über allArticles (falls vorhanden), sonst humanisieren.
function titleForSlug(slug, allArticles) {
  if (allArticles && allArticles[slug] && allArticles[slug].title) {
    return allArticles[slug].title;
  }
  return humanizeSlug(slug);
}

function slugKey(slug) {
  return String(slug || "").replace(/^\/blog\//, "").replace(/\/$/, "");
}

/* ─── Breadcrumbs ────────────────────────────────────────────────────────── */

function renderCrumbs({ meta, title, publishedSlugs, allArticles }) {
  const items = [`<a href="/blog/">Blog</a>`];

  if (meta.typ === "spoke") {
    // Blog → [Pillar/Hub] → diese Seite  (Pillar nur wenn published)
    if (isPublished(meta.pillarUp, publishedSlugs)) {
      const pTitle = titleForSlug(meta.pillarUp, allArticles);
      items.push(`<a href="${esc(meta.pillarUp)}/">${esc(pTitle)}</a>`);
    }
  }
  // Hub: Blog → diese Seite (kein Pillar-Crumb; Up-Link steckt im Header)

  items.push(`<span class="cat gram"><span class="d"></span>${esc(title)}</span>`);

  const sep = `<span aria-hidden="true">›</span>`;
  return `<!-- CLUSTER:CRUMBS -->
        <div class="crumbs">
          ${items.join(`\n          ${sep}\n          `)}
        </div>
        <!-- /CLUSTER:CRUMBS -->`;
}

/* ─── Up-Link ("↑ Zum Überblick") ───────────────────────────────────────── */

function renderUpLink({ meta, publishedSlugs, allArticles }) {
  if (!isPublished(meta.pillarUp, publishedSlugs)) return "";
  const pTitle = titleForSlug(meta.pillarUp, allArticles);
  const label = meta.typ === "hub" ? "↑ Zum großen Überblick" : "↑ Zum Überblick";
  return `<!-- CLUSTER:UP -->
        <div class="cluster-up">
          <a class="uplink" href="${esc(meta.pillarUp)}/">${label}: ${esc(pTitle)}</a>
        </div>
        <!-- /CLUSTER:UP -->`;
}

/* ─── Karten-Markup (wiederverwendet für Related & Down) ─────────────────── */

function cardHtml(slug, lang, allArticles) {
  const title = titleForSlug(slug, allArticles);
  const langUC = (lang.code || "de").toUpperCase();
  return `
          <a class="post" href="${esc(slug)}/">
            <div class="thumb" style="position:relative;overflow:hidden">
              <div class="glow" style="background:${lang.color};opacity:.35;position:absolute;inset:0;border-radius:inherit"></div>
              <span class="verb" style="position:relative;z-index:1;color:${lang.color}">${langUC}</span>
            </div>
            <div class="body">
              <span class="cat gram"><span class="d"></span>${esc(lang.label)}</span>
              <h3>${esc(title)}</h3>
              <div class="pmeta"><span>${langUC}</span></div>
            </div>
          </a>`;
}

// Spoke: Geschwister-/Related-Karten aus downOrSiblings (nur published).
function renderRelated({ meta, lang, publishedSlugs, allArticles }) {
  const targets = (meta.downOrSiblings || [])
    .filter((s) => s !== meta.slug && isPublished(s, publishedSlugs))
    .slice(0, 3);
  if (!targets.length) return "";

  const cards = targets.map((s) => cardHtml(s, lang, allArticles)).join("");
  return `
    <!-- CLUSTER:RELATED -->
    <section class="block related" style="padding:54px 0 0">
      <div class="wrap">
        <span class="sec-tag">Weiterlesen</span>
        <div class="pair" style="margin-top:18px">${cards}
        </div>
      </div>
    </section>
    <!-- /CLUSTER:RELATED -->`;
}

// Hub: "Weiter in die Tiefe"-Sektion mit allen veröffentlichten Spokes.
function renderDownSection({ meta, lang, publishedSlugs, allArticles }) {
  const targets = (meta.downOrSiblings || [])
    .filter((s) => s !== meta.slug && isPublished(s, publishedSlugs));
  if (!targets.length) return "";

  const cards = targets.map((s) => cardHtml(s, lang, allArticles)).join("");
  return `
    <!-- CLUSTER:DOWN -->
    <section class="block related" style="padding:54px 0 0">
      <div class="wrap">
        <span class="sec-tag">Weiter in die Tiefe</span>
        <p style="color:var(--muted);margin:10px 0 0;max-width:60ch">Jede Methode hat einen eigenen, ausführlichen Artikel — hier geht es tiefer:</p>
        <div class="pair" style="margin-top:18px">${cards}
        </div>
      </div>
    </section>
    <!-- /CLUSTER:DOWN -->`;
}

/* ─── JSON-LD Graph ──────────────────────────────────────────────────────── */

function buildJsonLd({ meta, title, description, url, dateIso, faqItems, crumbTrail }) {
  const graph = [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: title,
      description,
      inLanguage: "de",
      datePublished: dateIso,
      dateModified: today(),
      articleSection: "Methodik",
      image: `${BASE_URL}/blog/img/prod-1.png`,
      speakable: speakableSchema(),
      author: {
        "@type": "Person",
        name: "Janine Kreiser",
        jobTitle: "Gründerin",
        worksFor: { "@type": "Organization", name: "ConjuExpert" },
      },
      publisher: {
        "@type": "Organization",
        name: "ConjuExpert",
        url: `${BASE_URL}/`,
        logo: { "@type": "ImageObject", url: `${BASE_URL}/icon-192.png` },
      },
      mainEntityOfPage: url,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: crumbTrail.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.item,
      })),
    },
  ];

  const faqSchema = renderFaqSchema(faqItems);
  if (faqSchema) graph.push(faqSchema);

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
}

/* ─── Hauptfunktion ──────────────────────────────────────────────────────── */

export function renderArticle({
  meta,
  title,
  contentBlocks,
  faqItems,
  publishedSlugs,
  allArticles,
  datePublished,
}) {
  const pub = publishedSlugs instanceof Set ? publishedSlugs : new Set(publishedSlugs || []);
  const lang = resolveLang(meta);
  const slug = meta.slug;
  const url = `${BASE_URL}${slug}/`;
  const description = meta.metaDescription || "";
  const langUC = lang.code.toUpperCase();

  const contentHtml = blocksToHtml(contentBlocks || []);
  const faqHtml = renderFaqHtml(faqItems || []);

  const readTime = estimateReadTime(`${contentHtml} ${faqHtml}`);
  const dateIso = datePublished || today();
  const dateFormatted = formatDate(dateIso);

  // Breadcrumb-Trail (für JSON-LD), gespiegelt zur sichtbaren Variante.
  const crumbTrail = [{ name: "Blog", item: `${BASE_URL}/blog/` }];
  if (meta.typ === "spoke" && isPublished(meta.pillarUp, pub)) {
    crumbTrail.push({
      name: titleForSlug(meta.pillarUp, allArticles),
      item: `${BASE_URL}${meta.pillarUp}/`,
    });
  }
  crumbTrail.push({ name: title, item: url });

  const crumbs = renderCrumbs({ meta, title, publishedSlugs: pub, allArticles });
  const upLink = renderUpLink({ meta, publishedSlugs: pub, allArticles });

  // Hub vs. Spoke: unterschiedliche Cluster-Sektionen
  const clusterSection =
    meta.typ === "hub"
      ? renderDownSection({ meta, lang, publishedSlugs: pub, allArticles })
      : renderRelated({ meta, lang, publishedSlugs: pub, allArticles });

  const jsonLd = buildJsonLd({
    meta,
    title,
    description,
    url,
    dateIso,
    faqItems,
    crumbTrail,
  });

  const grad = lang.grad;

  return `<!DOCTYPE html>
<html lang="de" data-lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#f5e4c3" />
<title>${esc(title)} | ConjuExpert</title>
<meta name="description" content="${esc(description)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="ConjuExpert Blog" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${BASE_URL}/blog/img/prod-1.png" />
<meta name="twitter:site" content="@conjuexpert" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/blog/blog.css?v=2" />
<script type="application/ld+json">${jsonLd}</script>
<style>
.art-glow{position:absolute;top:-160px;left:50%;transform:translateX(-50%);width:1000px;height:480px;background:var(--vivid);filter:blur(120px);opacity:.13;z-index:-1;border-radius:50%}
.art-hero-grad{height:clamp(220px,38vw,400px);border-radius:26px;overflow:hidden;margin:30px 0 10px;box-shadow:var(--shadow);position:relative;display:flex;align-items:center;justify-content:center;text-align:center}
.art-hero-grad .gfill{position:absolute;inset:0;background:${grad}}
.art-hero-grad .hcontent{position:relative;z-index:2;color:#fff;padding:24px}
.art-hero-grad .hk{font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.92;margin:0 0 10px}
.art-hero-grad .hf{font-family:var(--display);font-weight:800;font-size:clamp(26px,5vw,46px);letter-spacing:-.02em;line-height:1.05;text-shadow:0 3px 18px rgba(0,0,0,.28)}
.slot-cap{font-family:var(--mono);font-size:12px;color:var(--muted);text-align:center;margin:0 0 28px}
.cluster-up{margin:14px 0 0}
.cluster-up .uplink{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:13px;font-weight:600;color:var(--ink);text-decoration:none;border:1px solid var(--border);border-radius:999px;padding:8px 16px;background:var(--surface)}
.cluster-up .uplink:hover{background:var(--surface-2)}
.faq2{margin:8px 0 0}
.faq2 details{border:1px solid var(--border);border-radius:16px;background:var(--surface);box-shadow:var(--shadow-sm);margin-bottom:12px;overflow:hidden}
.faq2 summary{list-style:none;cursor:pointer;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px;font-family:var(--display);font-weight:700;font-size:17px;letter-spacing:-.01em}
.faq2 summary::-webkit-details-marker{display:none}
.faq2 summary .pm{flex:none;width:26px;height:26px;border-radius:50%;background:var(--surface-2);border:1px solid var(--border);position:relative;transition:transform .35s}
.faq2 summary .pm::before,.faq2 summary .pm::after{content:"";position:absolute;top:50%;left:50%;width:11px;height:2.2px;border-radius:2px;background:var(--blue);transform:translate(-50%,-50%)}
.faq2 summary .pm::after{transform:translate(-50%,-50%) rotate(90deg)}
.faq2 details[open] summary .pm{transform:rotate(135deg)}
.faq2 details[open] summary{border-bottom:1px solid var(--border)}
.faq2 .a{padding:16px 20px 20px;color:var(--muted);font-size:15.5px;line-height:1.6}
</style>
</head>
<body>

<header class="nav">
  <div class="wrap nav-in">
    <a class="brand" href="/blog/" aria-label="ConjuExpert Blog">
      <span class="brand-mark" data-mark></span>
      <span class="brand-name">Conju<b>Expert</b> <span class="sub">Blog</span></span>
    </a>
    <nav class="nav-links" aria-label="Blog-Navigation">
      <a href="/blog/" data-l="de">Alle Artikel</a><a href="/blog/" data-l="en">All articles</a>
      <a href="/blog/#grammatik" data-l="de">Grammatik</a><a href="/blog/#grammatik" data-l="en">Grammar</a>
      <a href="/blog/#lernen" data-l="de">Lerntipps</a><a href="/blog/#lernen" data-l="en">Learning</a>
      <a href="/blog/#produkt" data-l="de">News</a><a href="/blog/#produkt" data-l="en">News</a>
    </nav>
    <div class="nav-right">
      <div class="langsw" role="group" aria-label="Interface-Sprache">
        <button data-set="de" class="on" aria-pressed="true">DE</button><button data-set="en" aria-pressed="false">EN</button>
      </div>
      <a class="btn btn-primary btn-sm" href="/?utm_source=blog&amp;utm_medium=nav&amp;utm_content=${slugKey(slug)}">
        <span class="g"></span>
        <span class="l"><span data-l="de">App öffnen</span><span data-l="en">Open app</span></span>
      </a>
    </div>
  </div>
</header>

<main id="top">
  <article style="position:relative">
    <div class="art-glow"></div>

    <div class="artwrap">
      <div class="art-head reveal">
        ${crumbs}
        ${upLink}
        <h1>${esc(title)}</h1>
        <div class="art-meta">
          <span class="av">J</span>
          <span>Janine Kreiser, Gründerin ConjuExpert</span>
          <span class="dotsep"></span>
          <span class="mono">${dateFormatted}</span>
          <span class="dotsep"></span>
          <span class="mono">${readTime} min</span>
          <span class="dotsep"></span>
          <span class="lngtag" style="position:static">${langUC}</span>
        </div>
      </div>
    </div>

    <div class="artwrap">
      <div class="prose">

        ${contentHtml}
        ${faqHtml}

        <div class="quizcta">
          <span class="qi" style="display:flex;align-items:center;justify-content:center;background:#fff"><img src="/favicon.svg" alt="ConjuExpert" width="60" height="60" /></span>
          <span class="qt">
            <b>Aktiv üben</b>
            <span>Im Quiz mit Themen, die <em>dich</em> interessieren – so lange, bis es sitzt.</span>
          </span>
          <a class="btn btn-primary" href="/?utm_source=blog&amp;utm_medium=cta-inline&amp;utm_content=${slugKey(slug)}">
            <span class="g"></span><span class="l">Kostenlos testen</span>
          </a>
        </div>

        <div class="authorbox">
          <span class="av" style="width:56px;height:56px;border-radius:50%;background:linear-gradient(140deg,var(--pink),var(--violet));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;flex:none">J</span>
          <div>
            <b>Janine Kreiser</b>
            <p>Gründerin von ConjuExpert. Macht Sprachgrammatik sichtbar – mit Mustern statt Chaos.</p>
          </div>
        </div>

      </div>
    </div>

    ${clusterSection}

  </article>
</main>

<footer>
  <div class="wrap">
    <div class="foot">
      <div>
        <a class="brand" href="/"><span class="brand-mark" data-mark></span><span class="brand-name">Conju<b>Expert</b></span></a>
        <p style="color:var(--muted);font-size:14.5px;max-width:30ch;margin:14px 0 0">Der KI-Konjugationstrainer für 5 Sprachen - Quiz, Merken &amp; Lernen.</p>
      </div>
      <div class="links">
        <div>
          <h4>Blog</h4>
          <ul>
            <li><a href="/blog/">Alle Artikel</a></li>
            <li><a href="/blog/#grammatik">Grammatik</a></li>
            <li><a href="/blog/#story">Story</a></li>
          </ul>
        </div>
        <div>
          <h4>ConjuExpert</h4>
          <ul>
            <li><a href="/">App</a></li>
            <li><a href="/bewertungen/">Rezensionen</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 ConjuExpert</span>
      <span class="mono">Verben konjugieren · ES · FR · EN · NL · DE</span>
    </div>
  </div>
</footer>

<script>
document.documentElement.classList.add('js');
var BR = ["#ff3b5c","#ff7a18","#ffc400","#34c759","#0a84ff"];
document.querySelectorAll('[data-mark]').forEach(function(m) {
  for (var i = 0; i < 5; i++) {
    var s = document.createElement('i');
    s.style.background = BR[i];
    m.appendChild(s);
  }
});
</script>
<script src="/blog/blog-chrome.js" defer></script>
</body>
</html>`;
}
