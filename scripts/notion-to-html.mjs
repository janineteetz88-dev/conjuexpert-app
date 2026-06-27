/**
 * notion-to-html.mjs
 *
 * Konvertiert eine Notion-Seite in eine fertige Blog-Artikel-HTML-Datei
 * im ConjuExpert-Format.
 *
 * Export: generateHtmlFromNotion(pageId, spoke, cluster) → string (HTML)
 */

import { renderSourcesSection } from "./lib/sources.mjs";
import { extractKeyTakeaways, addHeadingIdsAndToc } from "./lib/geo-blocks.mjs";
import { firstHeadIntro } from "./lib/notion-adapt.mjs";

const NOTION_VERSION = "2022-06-28";
const BASE_URL = "https://conjuexpert.app";

const LANG_MAP = {
  Spanisch:      { code: "es", color: "#ff9f0a", grad: "linear-gradient(140deg,#ff9f0a,#ff3b5c)", label: "Spanisch" },
  Deutsch:       { code: "de", color: "#ff3b5c", grad: "linear-gradient(140deg,#ff3b5c,#ff7a18)", label: "Deutsch"  },
  Französisch:   { code: "fr", color: "#a557ff", grad: "linear-gradient(140deg,#a557ff,#0a84ff)", label: "Französisch" },
  Englisch:      { code: "en", color: "#0a84ff", grad: "linear-gradient(140deg,#e71583,#a557ff)", label: "Englisch"  },
  Niederländisch:{ code: "nl", color: "#30c95a", grad: "linear-gradient(140deg,#30c95a,#0a84ff)", label: "Niederländisch" },
};

/* ─── Notion API ─────────────────────────────────────────────────────────── */

async function nFetch(path, key) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      "Notion-Version": NOTION_VERSION,
    },
  });
  if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text()}`);
  return res.json();
}

async function fetchBlocks(blockId, key) {
  const blocks = [];
  let cursor;
  do {
    const url = `/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`;
    const data = await nFetch(url, key);
    for (const block of data.results) {
      if (block.has_children) {
        block._children = await fetchBlocks(block.id, key);
      }
      blocks.push(block);
    }
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return blocks;
}

async function fetchPage(pageId, key) {
  return nFetch(`/pages/${pageId}`, key);
}

/* ─── Rich Text → HTML ───────────────────────────────────────────────────── */

function esc(s) {
  return String(s || "").replace(/[<>&"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]
  );
}

/* ─── CTA Störer ─────────────────────────────────────────────────────────── */

const CTA_POOL = [
  { emoji: "🎯", lead: "Genau diese Regel üben — nicht nur lesen.", body: "ConjuExpert testet dich mit Sätzen aus Themen, die dich interessieren.", cta: "Jetzt in der App lernen" },
  { emoji: "✏️", lead: "Konjugationen selbst zusammenbauen, bis sie sitzen.", body: "Das Quiz in ConjuExpert fragt genau das ab — kostenlos, ohne Anmeldung.", cta: "Kostenlos im Quiz üben" },
  { emoji: "💡", lead: "Das Muster erkannt? Jetzt festigen.", body: "ConjuExpert erinnert dich genau dann, wenn das Gehirn am effektivsten lernt.", cta: "Direkt ausprobieren" },
  { emoji: "🔁", lead: "Wiederholen ist schneller als Vergessen nachholen.", body: "In ConjuExpert übst du aktiv — in deinem Tempo, mit deinen Themen.", cta: "Jetzt üben" },
  { emoji: "🧠", lead: "Aktives Abrufen schlägt passives Lesen.", body: "Das Quiz fragt genau die Formen ab, die du gerade gelernt hast.", cta: "Im Quiz festigen" },
];

function ctaHtml(idx, slugKey) {
  const c = CTA_POOL[idx % CTA_POOL.length];
  const utm = `?utm_source=blog&utm_medium=stoerer&utm_content=${slugKey}`;
  return `<div class="note">${c.emoji} <strong>${c.lead}</strong> ${c.body}<br>👉 <strong><a href="https://conjuexpert.app/${utm}">${c.cta} → conjuexpert.app</a></strong></div>`;
}

function autoInsertCtAs(html, slug) {
  const slugKey = slug.replace(/^\/blog\//, "");
  // Zähle Callouts die bereits einen conjuexpert-Link enthalten
  const existing = (html.match(/class="note"[^>]*>[\s\S]*?conjuexpert\.app/g) || []).length;
  const needed = Math.max(0, 3 - existing);
  if (needed === 0) return html;

  let inserted = 0;
  let h2count = 0;
  return html.replace(/<\/h2>/g, (match) => {
    h2count++;
    if (h2count % 2 === 0 && inserted < needed) {
      const cta = ctaHtml(existing + inserted, slugKey);
      inserted++;
      return `</h2>\n\n${cta}`;
    }
    return match;
  });
}

/* ─── TL;DR → Kurz gesagt Normalisierung (nur Callout-Label) ────────────── */

// Ersetzt das Label „TL;DR" (inkl. Varianten mit Doppelpunkt / Gedankenstrich)
// am Anfang des gerenderten Callout-Textes durch „Kurz gesagt".
// Wirkt NUR auf Callout-Blöcke (wird ausschließlich dort aufgerufen).
export function normalizeTldrLabel(html) {
  return html
    // Bold: <strong>TL;DR[separator]</strong> → <strong>Kurz gesagt[separator]</strong>
    // Capture die Leerzeichen um den Separator mit, damit sie erhalten bleiben.
    .replace(
      /^(<(?:strong|b)>)TL;?DR(\s*[:–—-]\s*)?(<\/(?:strong|b)>)/i,
      (_, open, sep, close) => `${open}Kurz gesagt${sep || ""}${close}`
    )
    // Plain: TL;DR[: | – | — | -] am Anfang
    .replace(/^TL;?DR(\s*[:–—-]\s*)/i, "Kurz gesagt$1");
}

function rtToHtml(richText) {
  return (richText || [])
    .map((t) => {
      let text = esc(t.plain_text);
      if (!text) return "";
      const a = t.annotations || {};
      if (a.code)          text = `<code>${text}</code>`;
      if (a.bold)          text = `<strong>${text}</strong>`;
      if (a.italic)        text = `<em>${text}</em>`;
      if (a.strikethrough) text = `<s>${text}</s>`;
      if (t.href)          text = `<a class="inline" href="${esc(t.href.replace(/^http:\/\/conjuexpert\.app/i, "https://conjuexpert.app"))}">${text}</a>`;
      return text;
    })
    .join("");
}

/* ─── Blocks → HTML ──────────────────────────────────────────────────────── */

function blocksToHtml(blocks) {
  const out = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];

    // Bulleted list: gruppenweise
    if (b.type === "bulleted_list_item") {
      const items = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        items.push(`<li>${rtToHtml(blocks[i].bulleted_list_item.rich_text)}</li>`);
        i++;
      }
      out.push(`<ul>\n${items.join("\n")}\n</ul>`);
      continue;
    }

    // Numbered list: gruppenweise
    if (b.type === "numbered_list_item") {
      const items = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        items.push(`<li>${rtToHtml(blocks[i].numbered_list_item.rich_text)}</li>`);
        i++;
      }
      out.push(`<ol>\n${items.join("\n")}\n</ol>`);
      continue;
    }

    out.push(blockToHtml(b));
    i++;
  }
  return out.filter(Boolean).join("\n\n");
}

function blockToHtml(b) {
  switch (b.type) {
    case "paragraph": {
      const text = rtToHtml(b.paragraph.rich_text);
      return text ? `<p>${text}</p>` : "";
    }
    case "heading_1":
      return `<h2>${rtToHtml(b.heading_1.rich_text)}</h2>`;
    case "heading_2":
      return `<h2>${rtToHtml(b.heading_2.rich_text)}</h2>`;
    case "heading_3":
      return `<h3>${rtToHtml(b.heading_3.rich_text)}</h3>`;

    case "callout": {
      const text = normalizeTldrLabel(rtToHtml(b.callout.rich_text));
      const children = b._children ? `\n${blocksToHtml(b._children)}` : "";
      return `<div class="note">${text}${children}</div>`;
    }

    case "quote": {
      const text = rtToHtml(b.quote.rich_text);
      return `<div class="pull">${text}</div>`;
    }

    case "divider":
      return `<hr>`;

    case "toggle": {
      const summary = rtToHtml(b.toggle.rich_text);
      const body = b._children ? blocksToHtml(b._children) : "";
      return `<details>\n  <summary>${summary}<span class="pm"></span></summary>\n  <div class="a">${body}</div>\n</details>`;
    }

    case "table": {
      if (!b._children) return "";
      const rows = b._children.map((row) => {
        const cells = (row.table_row?.cells || []).map((cell, ci) =>
          ci === 0
            ? `<td class="pers">${rtToHtml(cell)}</td>`
            : `<td class="form">${rtToHtml(cell)}</td>`
        );
        return `<tr>${cells.join("")}</tr>`;
      });
      const [head, ...body] = rows;
      return `<div class="conjtable-wrap"><table class="conjtable"><thead>${head}</thead><tbody>${body.join("")}</tbody></table></div>`;
    }

    case "code": {
      const text = esc((b.code.rich_text || []).map((t) => t.plain_text).join(""));
      return `<pre><code>${text}</code></pre>`;
    }

    default:
      return "";
  }
}

/* ─── FAQ aus Toggle-Blöcken extrahieren ─────────────────────────────────── */

function extractFaq(blocks) {
  const toggles = blocks.filter((b) => b.type === "toggle");
  if (!toggles.length) return { faqBlocks: [], rest: blocks };
  const faqSet = new Set(toggles.map((t) => t.id));
  return {
    faqBlocks: toggles,
    rest: blocks.filter((b) => !faqSet.has(b.id)),
  };
}

/* ─── Datumsformatierung ─────────────────────────────────────────────────── */

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const months = ["Jan.","Feb.","März","Apr.","Mai","Juni","Juli","Aug.","Sept.","Okt.","Nov.","Dez."];
  return `${parseInt(d)}. ${months[parseInt(m) - 1]} ${y}`;
}

function estimateReadTime(html) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 200));
}

/* ─── Verwandte Artikel ───────────────────────────────────────────────────── */

function relatedCards(cluster, currentSlug) {
  const siblings = cluster.spokes.filter(
    (s) => s.live && s.slug !== currentSlug
  ).slice(0, 3);
  if (!siblings.length) return "";

  const cards = siblings.map((s) => `
          <a class="post" href="${s.slug}/">
            <div class="thumb" style="position:relative;overflow:hidden">
              <div class="glow" style="background:${cluster.color};opacity:.35;position:absolute;inset:0;border-radius:inherit"></div>
              <span class="verb" style="position:relative;z-index:1;color:${cluster.color}">${cluster.lang.toUpperCase()}</span>
            </div>
            <div class="body">
              <span class="cat gram"><span class="d"></span>Grammatik</span>
              <h3>${esc(s.title)}</h3>
              <div class="pmeta"><span>${cluster.lang.toUpperCase()}</span></div>
            </div>
          </a>`).join("");

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

/* ─── Breadcrumbs ────────────────────────────────────────────────────────── */

function breadcrumbs(cluster, spoke, GLOBAL_PILLAR) {
  const items = [
    `<a href="/blog/">Blog</a>`,
    `<a href="${GLOBAL_PILLAR.slug}/">${esc(GLOBAL_PILLAR.title)}</a>`,
  ];
  if (cluster.hub.live) {
    items.push(`<a href="${cluster.hub.slug}/">${esc(cluster.hub.title)}</a>`);
  }
  items.push(`<span class="cat gram"><span class="d"></span>${esc(spoke.title)}</span>`);

  const sep = `<span aria-hidden="true">›</span>`;
  return `<!-- CLUSTER:CRUMBS -->
        <div class="crumbs">
          ${items.join(`\n          ${sep}\n          `)}
        </div>
        <!-- /CLUSTER:CRUMBS -->`;
}

/* ─── HTML-Template ──────────────────────────────────────────────────────── */

function buildHtml({ title, description, slug, langInfo, datePublished, contentHtml: contentHtmlIn, takeawaysHtml = "", faqBlocks, cluster, spoke, GLOBAL_PILLAR }) {
  // GEO-Baustein 2: H2-IDs + automatisches Inhaltsverzeichnis.
  const { html: contentHtml, tocHtml } = addHeadingIdsAndToc(contentHtmlIn, { minToc: 3 });
  const url = `${BASE_URL}${slug}/`;
  const langCode = langInfo.code;
  const color = langInfo.color;
  const grad = langInfo.grad;
  const langUC = langCode.toUpperCase();
  const readTime = estimateReadTime(contentHtml);
  const dateFormatted = formatDate(datePublished) || formatDate(today());
  const dateIso = datePublished || today();

  const faqSchema = faqBlocks.length
    ? `,\n    {\n      "@type": "FAQPage",\n      "mainEntity": [${faqBlocks.map((b) => {
        const q = (b.toggle.rich_text || []).map((t) => t.plain_text).join("");
        const a = b._children ? blocksToHtml(b._children).replace(/<[^>]+>/g, " ").trim() : "";
        return `\n        {\n          "@type": "Question",\n          "name": ${JSON.stringify(q)},\n          "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(a)} }\n        }`;
      }).join(",")}]\n    }`
    : "";

  const faqHtml = faqBlocks.length
    ? `\n        <h2 id="faq">Häufige Fragen</h2>\n        <div class="faq2">\n${faqBlocks.map((b) => {
        const summary = rtToHtml(b.toggle.rich_text);
        const body = b._children ? blocksToHtml(b._children) : "";
        return `          <details>\n            <summary>${summary}<span class="pm"></span></summary>\n            <div class="a">${body}</div>\n          </details>`;
      }).join("\n")}\n        </div>`
    : "";

  const sourcesHtml = renderSourcesSection(`${contentHtml} ${faqHtml}`);

  const crumbs = breadcrumbs(cluster, spoke, GLOBAL_PILLAR);
  const related = relatedCards(cluster, slug);

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
<meta name="twitter:image" content="${BASE_URL}/blog/img/prod-1.png" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/blog/blog.css?v=10" />
<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": "${url}#article",
      "headline": ${JSON.stringify(title)},
      "description": ${JSON.stringify(description)},
      "inLanguage": "de",
      "datePublished": "${dateIso}",
      "dateModified": "${today()}",
      "articleSection": "Grammatik",
      "image": "${BASE_URL}/blog/img/prod-1.png",
      "author": {
        "@type": "Person",
        "name": "Janine Kreiser",
        "jobTitle": "Gründerin",
        "worksFor": { "@type": "Organization", "name": "ConjuExpert" }
      },
      "publisher": {
        "@type": "Organization",
        "name": "ConjuExpert",
        "url": "${BASE_URL}/",
        "logo": { "@type": "ImageObject", "url": "${BASE_URL}/icon-192.png" }
      },
      "mainEntityOfPage": "${url}"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Blog", "item": "${BASE_URL}/blog/" },
        { "@type": "ListItem", "position": 2, "name": ${JSON.stringify(title)}, "item": "${url}" }
      ]
    }${faqSchema}
  ]
}</script>
<style>
.art-glow{position:absolute;top:-160px;left:50%;transform:translateX(-50%);width:1000px;height:480px;background:var(--vivid);filter:blur(120px);opacity:.13;z-index:-1;border-radius:50%}
.art-hero-grad{height:clamp(220px,38vw,400px);border-radius:26px;overflow:hidden;margin:30px 0 10px;box-shadow:var(--shadow);position:relative;display:flex;align-items:center;justify-content:center;text-align:center}
.art-hero-grad .gfill{position:absolute;inset:0;background:${grad}}
.art-hero-grad .hcontent{position:relative;z-index:2;color:#fff;padding:24px}
.art-hero-grad .hk{font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.92;margin:0 0 10px}
.art-hero-grad .hf{font-family:var(--display);font-weight:800;font-size:clamp(26px,5vw,46px);letter-spacing:-.02em;line-height:1.05;text-shadow:0 3px 18px rgba(0,0,0,.28)}
.slot-cap{font-family:var(--mono);font-size:12px;color:var(--muted);text-align:center;margin:0 0 28px}
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
.keytakeaways{position:relative;margin:18px 0 28px;padding:20px 22px 20px 26px;border:1px solid var(--border);border-radius:18px;background:var(--surface);box-shadow:var(--shadow-sm)}
.keytakeaways::before{content:"";position:absolute;left:0;top:16px;bottom:16px;width:4px;border-radius:4px;background:linear-gradient(180deg,var(--pink),var(--violet))}
.keytakeaways h2{margin:0 0 10px;font-size:18px}
.keytakeaways p{margin:0;color:var(--ink);line-height:1.6}
.keytakeaways ul,.keytakeaways ol{margin:0;padding-left:20px}
.keytakeaways li{margin:6px 0;color:var(--ink);line-height:1.55}
.toc{margin:0 0 30px;padding:16px 20px;border:1px solid var(--border);border-radius:16px;background:var(--surface-2)}
.toc-h{margin:0 0 8px;font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.toc ol{margin:0;padding-left:20px}
.toc li{margin:4px 0}
.toc a{color:var(--ink);text-decoration:none;border-bottom:1px solid transparent;transition:border-color .15s}
.toc a:hover{border-bottom-color:var(--pink)}
</style>
</head>
<body>

<header class="nav">
  <div class="wrap nav-in">
    <a class="brand" href="/blog/" aria-label="ConjuExpert Blog">
      <span class="brand-mark" data-mark></span>
      <span class="brand-name">Conju<b>Expert</b> <span class="sub">Blog</span></span>
    </a>
    <nav class="nav-links" aria-label="Navigation">
      <a href="/blog/">Alle Artikel</a>
      <a href="/blog/#grammatik">Grammatik</a>
      <a href="/">Zur Website</a>
    </nav>
    <div class="nav-right">
      <a class="btn btn-primary btn-sm" href="/?utm_source=blog&amp;utm_medium=nav&amp;utm_content=${slug.replace(/^\/blog\//, "")}">
        <span class="g"></span><span class="l">App öffnen</span>
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

    <div class="artwrap reveal" data-d="1">
      <div class="art-hero-grad">
        <div class="gfill"></div>
        <div class="hcontent">
          <p class="hk">${esc(langInfo.label)} · Grammatik</p>
          <div class="hf">${esc(title)}</div>
        </div>
      </div>
      <p class="slot-cap">${esc(title)}</p>
    </div>

    <div class="artwrap">
      <div class="prose">

        ${takeawaysHtml}
        ${tocHtml}
        ${contentHtml}
        ${faqHtml}
        ${sourcesHtml}

        <div class="quizcta">
          <span class="qi">💬</span>
          <span class="qt">
            <b>Aktiv üben</b>
            <span>Im Quiz mit Themen, die <em>dich</em> interessieren – so lange, bis es sitzt.</span>
          </span>
          <a class="btn btn-primary" href="/?utm_source=blog&amp;utm_medium=cta-inline&amp;utm_content=${slug.replace(/^\/blog\//, "")}">
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

    ${related}

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
</body>
</html>`;
}

/* ─── Hauptfunktion ──────────────────────────────────────────────────────── */

export async function generateHtmlFromNotion(notionPageId, spoke, cluster, GLOBAL_PILLAR, apiKey) {
  const page = await fetchPage(notionPageId, apiKey);
  const props = page.properties;

  // Titel
  const title =
    props["Thema"]?.title?.[0]?.plain_text ||
    props["Titel"]?.title?.[0]?.plain_text ||
    props["Name"]?.title?.[0]?.plain_text ||
    spoke.title;

  // Sprache
  const langLabel = props["Sprache"]?.select?.name || cluster.label;
  const langInfo = LANG_MAP[langLabel] || LANG_MAP["Deutsch"];

  // Beschreibung (Phase 1: aus Notion-Properties)
  let description =
    props["Beschreibung"]?.rich_text?.[0]?.plain_text ||
    props["Meta-Description"]?.rich_text?.[0]?.plain_text ||
    null;

  // Datum
  const datePublished =
    props["Datum"]?.date?.start ||
    props["Veröffentlicht am"]?.date?.start ||
    null;

  // Alle Blöcke laden
  const blocks = await fetchBlocks(notionPageId, apiKey);

  // Beschreibung (Phase 2): kursiver Intro-Satz als Fallback, wenn Property fehlt
  if (!description) {
    const intro = firstHeadIntro(blocks, { italicOnly: true }) || firstHeadIntro(blocks);
    description = intro
      ? (intro.length > 150 ? intro.slice(0, 147) + "…" : intro)
      : `${title} — verstehen, wie es funktioniert. Mit Beispielen, Erklärungen und Übungen auf ConjuExpert.`;
  }

  // FAQ-Blöcke (Toggles) ans Ende
  const { faqBlocks, rest } = extractFaq(blocks);

  // GEO-Baustein 1: „Das Wichtigste in Kürze"-Box aus markiertem Callout.
  const { boxHtml: takeawaysHtml, blocks: bodyBlocks } = extractKeyTakeaways(rest, blocksToHtml);

  // Prose-HTML + auto-CTAs
  const rawContent = blocksToHtml(bodyBlocks);
  const contentHtml = autoInsertCtAs(rawContent, spoke.slug);

  return buildHtml({
    title,
    description,
    slug: spoke.slug,
    langInfo,
    datePublished,
    contentHtml,
    takeawaysHtml,
    faqBlocks,
    cluster,
    spoke,
    GLOBAL_PILLAR,
  });
}

export {
  LANG_MAP,
  BASE_URL,
  blocksToHtml,
  blockToHtml,
  rtToHtml,
  esc,
  estimateReadTime,
  formatDate,
  today,
  // Live-API-Helfer (für den generischen Produktionspfad in publish-from-notion.mjs).
  // In dieser Umgebung ohne NOTION_API_KEY nicht lauffähig — nur in CI.
  nFetch,
  fetchPage,
  fetchBlocks,
};
