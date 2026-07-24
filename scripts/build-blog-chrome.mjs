#!/usr/bin/env node
/**
 * build-blog-chrome.mjs
 *
 * EINZIGE QUELLE für Header (Nav) und Footer aller Blog-Seiten. Injiziert das
 * generierte HTML idempotent über Kommentar-Marker — analog zu
 * prerender-blog-nav.mjs (Breadcrumbs/Related).
 *
 *   <!-- CHROME:HEADER -->...<!-- /CHROME:HEADER -->
 *   <!-- CHROME:FOOTER -->...<!-- /CHROME:FOOTER -->
 *
 * Beim ersten Lauf werden die Marker automatisch um den bestehenden
 * <header class="nav"> bzw. <footer> gelegt. Header/Footer sind voll
 * zweisprachig (data-l); das Verhalten des Sprachumschalters liegt zentral in
 * /blog/blog-chrome.js (wird hier ebenfalls sichergestellt).
 *
 * Aufruf:  node scripts/build-blog-chrome.mjs blog/index.html blog/SLUG/index.html
 * Neue Seite: Marker (oder nacktes <header>/<footer>) einfügen + Skript laufen.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { socialRow } from "./lib/social.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ─── HTML-Quellen (Single Source of Truth) ──────────────────────────────── */

function header({ brandHref, brandAria, isIndex, utm }) {
  const act = isIndex ? ' class="active"' : "";
  return `<header class="nav">
  <div class="wrap nav-in">
    <a class="brand" href="${brandHref}" aria-label="${brandAria}">
      <span class="brand-mark" data-mark></span>
      <span class="brand-name">Conju<b>Expert</b> <span class="sub">Blog</span></span>
    </a>
    <nav class="nav-links" aria-label="Blog-Navigation">
      <a href="/blog/"${act} data-l="de">Alle Artikel</a><a href="/blog/"${act} data-l="en">All articles</a>
      <a href="/blog/#grammatik" data-l="de">Grammatik</a><a href="/blog/#grammatik" data-l="en">Grammar</a>
      <a href="/blog/#lernen" data-l="de">Lerntipps</a><a href="/blog/#lernen" data-l="en">Learning</a>
      <a href="/blog/#produkt" data-l="de">News</a><a href="/blog/#produkt" data-l="en">News</a>
    </nav>
    <div class="nav-right">
      <div class="langsw" role="group" aria-label="Interface-Sprache">
        <button data-set="de" class="on" aria-pressed="true">DE</button><button data-set="en" aria-pressed="false">EN</button>
      </div>
      <a class="btn btn-primary btn-sm" href="/?utm_source=blog&amp;utm_medium=nav&amp;utm_content=${utm}">
        <span class="g"></span>
        <span class="l"><span data-l="de">App öffnen</span><span data-l="en">Open app</span></span>
      </a>
    </div>
  </div>
</header>`;
}

function footer() {
  return `<footer>
  <div class="wrap">
    <div class="foot">
      <div>
        <a class="brand" href="/" aria-label="ConjuExpert Startseite">
          <span class="brand-mark" data-mark></span>
          <span class="brand-name">Conju<b>Expert</b></span>
        </a>
        <p style="color:var(--muted);font-size:14.5px;max-width:30ch;margin:14px 0 0">
          <span data-l="de">Der KI-Konjugationstrainer für 5 Sprachen - Quiz, Merken &amp; Lernen.</span>
          <span data-l="en">The AI conjugation trainer for 5 languages - quiz, save &amp; learn.</span>
        </p>
        ${socialRow({ mt: 16 }).replace('justify-content:center', 'justify-content:flex-start')}
      </div>
      <div class="links">
        <div>
          <h4><span data-l="de">Blog</span><span data-l="en">Blog</span></h4>
          <ul>
            <li><a href="/blog/#grammatik" data-l="de">Grammatik</a><a href="/blog/#grammatik" data-l="en">Grammar</a></li>
            <li><a href="/blog/#lernen" data-l="de">Lerntipps</a><a href="/blog/#lernen" data-l="en">Learning</a></li>
            <li><a href="/blog/#produkt" data-l="de">Produkt-News</a><a href="/blog/#produkt" data-l="en">Product news</a></li>
          </ul>
        </div>
        <div>
          <h4>ConjuExpert</h4>
          <ul>
            <li><a href="/" data-l="de">Funktionen</a><a href="/" data-l="en">Features</a></li>
            <li><a href="/">App</a></li>
            <li><a href="/bewertungen/" data-l="de">Rezensionen</a><a href="/bewertungen/" data-l="en">Reviews</a></li>
          </ul>
        </div>
        <div>
          <h4><span data-l="de">Wichtiges</span><span data-l="en">Legal</span></h4>
          <ul>
            <li><a href="/agb.html">AGB</a></li>
            <li><a href="/impressum.html">Impressum</a></li>
            <li><a href="/datenschutz.html" data-l="de">Datenschutz</a><a href="/datenschutz.html" data-l="en">Privacy</a></li>
            <li><a href="/barrierefreiheit.html" data-l="de">Barrierefreiheit</a><a href="/barrierefreiheit.html" data-l="en">Accessibility</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 ConjuExpert</span>
      <span class="mono">Verben konjugieren · ES · FR · EN · NL · DE</span>
    </div>
  </div>
</footer>`;
}

/* ─── Marker-Injektion ───────────────────────────────────────────────────── */

const M = {
  header: ["<!-- CHROME:HEADER -->", "<!-- /CHROME:HEADER -->"],
  footer: ["<!-- CHROME:FOOTER -->", "<!-- /CHROME:FOOTER -->"],
};
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function inject(html, [open, close], generated, fallbackRe) {
  const markerPat = new RegExp(reEsc(open) + "[\\s\\S]*?" + reEsc(close));
  if (markerPat.test(html)) {
    return html.replace(markerPat, `${open}\n${generated}\n${close}`);
  }
  // erster Lauf: bestehendes Element umwickeln
  if (fallbackRe.test(html)) {
    return html.replace(fallbackRe, `${open}\n${generated}\n${close}`);
  }
  return html;
}

function ensureDataLang(html) {
  return html.replace(/<html\b([^>]*)>/, (m, attrs) =>
    /\bdata-lang=/.test(attrs) ? m : `<html${attrs} data-lang="de">`
  );
}

function ensureChromeJs(html) {
  if (html.includes("/blog/blog-chrome.js")) return html;
  // direkt vor </body> einhängen
  return html.replace(/<\/body>/i, '<script src="/blog/blog-chrome.js" defer></script>\n</body>');
}

/* ─── Hauptschleife ──────────────────────────────────────────────────────── */

const files = process.argv.slice(2);
if (!files.length) { console.log("Keine Dateien angegeben."); process.exit(0); }

let changed = 0;
for (const file of files) {
  if (file.includes("gruenderstory")) { console.log("übersprungen (kein Standard-Chrome):", file); continue; }
  const slug = "/" + file.replace(/\/index\.html$/, "").replace(/^\.?\//, "");
  const isIndex = /^\/?blog\/?$/.test(slug) || file.replace(/^\.?\//, "") === "blog/index.html";
  const utm = isIndex ? "blog-index" : slug.replace(/^\/blog\//, "").replace(/\/$/, "") || "blog";

  const fullPath = join(ROOT, file);
  let html = readFileSync(fullPath, "utf8");
  if (!/<header class="nav">|<!-- CHROME:HEADER -->/.test(html)) {
    console.log("kein Blog-Header gefunden, übersprungen:", file);
    continue;
  }
  const before = html;

  html = ensureDataLang(html);
  html = inject(
    html, M.header,
    header({
      brandHref: isIndex ? "/" : "/blog/",
      brandAria: isIndex ? "ConjuExpert Startseite" : "ConjuExpert Blog",
      isIndex, utm,
    }),
    /<header class="nav">[\s\S]*?<\/header>/
  );
  html = inject(html, M.footer, footer(), /<footer>[\s\S]*?<\/footer>/);
  html = ensureChromeJs(html);

  if (html !== before) {
    writeFileSync(fullPath, html, "utf8");
    console.log("✓", file);
    changed++;
  } else {
    console.log("· unverändert", file);
  }
}
console.log(`Fertig: ${changed} Datei(en) aktualisiert.`);
