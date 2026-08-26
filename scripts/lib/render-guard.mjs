/**
 * render-guard.mjs
 *
 * Struktur-/Chrome-Invarianten für gerenderte Blog-Artikel. Verhindert, dass
 * kaputtes HTML (fehlende Kopfleiste, doppelter Titel, Entwurfs-Marker,
 * unausgefüllte Platzhalter …) jemals geschrieben/veröffentlicht wird.
 *
 *   auditRenderedHtml(html, { slug }) → string[]  (leer = ok)
 *
 * Wird zweifach genutzt:
 *   1) im Publish-Lauf vor jedem Schreiben (fehlerhafte Artikel werden NICHT
 *      geschrieben und der Lauf schlägt rot fehl);
 *   2) im Render-Selbsttest (CI, ohne Notion) gegen Muster-Artikel.
 */

export function auditRenderedHtml(html, ctx = {}) {
  const where = ctx.slug ? ` [${ctx.slug}]` : "";
  const out = [];
  const s = String(html || "");
  const has = (needle) => s.includes(needle);
  const need = (cond, msg) => { if (!cond) out.push(msg); };
  const ban = (cond, msg) => { if (cond) out.push(msg); };

  // ── Vollständige Blog-Kopfleiste (genau die der handgebauten Seiten) ──
  need(/<header class="nav">/.test(s), "Kopfleiste fehlt (<header class=\"nav\">)");
  need(has('href="/blog/#grammatik"'), "Nav-Link \"Grammatik\" fehlt");
  need(has('href="/blog/#lernen"'), "Nav-Link \"Lerntipps\" fehlt");
  need(has('href="/blog/#produkt"'), "Nav-Link \"News\" fehlt");
  need(has('class="langsw"'), "DE/EN-Umschalter (langsw) fehlt");
  need(has("blog-chrome.js"), "blog-chrome.js fehlt");
  need(/<html lang="[^"]*"\s+data-lang=/.test(s), "html data-lang fehlt");
  need(has('name="theme-color"'), "theme-color fehlt");
  need(has('property="og:image"'), "og:image fehlt");
  need(has('name="twitter:image"'), "twitter:image fehlt");
  need(/<footer[\s>]/.test(s), "Footer fehlt");

  // ── Genau EINE sichtbare H1 (kein doppelter Riesen-Titel) ──
  const h1n = (s.match(/<h1[\s>]/g) || []).length;
  need(h1n === 1, `Genau eine <h1> erwartet, gefunden: ${h1n}`);
  const h1 = (s.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "";
  need(h1.replace(/<[^>]+>/g, "").trim().length > 0, "H1 ist leer");

  // ── Verbotene Artefakte ──
  ban(/Methodik · Methodik/.test(s), "Doppel-Label \"Methodik · Methodik\"");
  ban(/>\s*Zur Website\s*</.test(s), "veraltete Nav \"Zur Website\"");
  ban(/✍️|\[Entwurf\]|\[Draft\]|\[WIP\]/.test(s), "Entwurfs-Marker (✍️/[Entwurf]) im HTML");
  ban(/\$\{[^}]+\}/.test(s), "unausgefüllter Template-Platzhalter ${…}");

  // im sichtbaren HTML (ohne <script>/<style>) dürfen keine "undefined"/"NaN" stehen
  const visible = s
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "");
  ban(/\bundefined\b/.test(visible), "\"undefined\" im sichtbaren HTML");
  ban(/\bNaN\b/.test(visible), "\"NaN\" im sichtbaren HTML");

  // ── Notion-Vorlagen-Platzhalter, die nie live gehen dürfen ──
  // (interne Abschnittsüberschrift statt echter Meta-Description; Editor-Hinweis
  // statt echtem Cover-Bild — beide sind wiederholt live gerutscht, siehe Notion.)
  ban(/Meta\s*\(für Blog-Engine/i.test(s), 'Platzhaltertext "Meta (für Blog-Engine & Freigabe)" im HTML (meta/og/twitter-description oder JSON-LD)');
  ban(/Cover-Bild:\s*beim Veröffentlichen/i.test(visible), 'Editor-Platzhalter "Cover-Bild: beim Veröffentlichen …" im sichtbaren Text');

  // ── <title> vorhanden & ohne Marker ──
  const title = (s.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
  need(title.trim().length > 0, "<title> ist leer");

  return out.map((m) => m + where);
}
