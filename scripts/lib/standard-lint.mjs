/**
 * standard-lint.mjs
 *
 * Maschinelle Prüfung eines Blog-Artikels gegen den redaktionellen Gold-Standard
 * ("Anforderungen Blogartikel (CI & Stil)" / `.agents/blog-style.md`).
 *
 * Ergänzt die bestehenden Leitplanken:
 *   - validateMeta()      (Pflichtfelder im Meta-Block)               — meta-block.mjs
 *   - auditRenderedHtml() (Chrome/Struktur des gerenderten HTML)      — render-guard.mjs
 * um die CI-/Stil-Regeln, die bislang NUR als Text existierten und deshalb nie
 * automatisch erzwungen wurden (Kürze-Box, kein TL;DR/Emoji, FAQ als Toggle,
 * interne Link-Mindestmenge, verirrte Entwurfs-/Redaktionshinweise …).
 *
 * Design: eine reine Kern-Funktion `lintSignals(signals)` + zwei Adapter
 *   - `lintArticleText(markdown, { meta })`  — für den Publish-/Entwurfs-Pfad (Quelle)
 *   - `lintRenderedHtml(html, { meta })`     — für Bestands-/Live-Artikel (HTML)
 * Beide reichen dieselben `signals` in denselben Kern → identische Regeln.
 *
 * Rückgabe: Array von { code, level: "error"|"warn", msg }.
 *   level "error" = darf NICHT live (analog Render-Guard: überspringen).
 *   level "warn"  = melden, blockt aber nicht.
 */

// Grobe Emoji-Erkennung (Symbole/Piktogramme/Dingbats/Pfeile + Variation Selector).
const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE0F}\u{20E3}]/u;

const has = (re, s) => re.test(String(s || ""));

/* ─── Kern: prüft normalisierte Signale ──────────────────────────────────── */

/**
 * @param {object} sig
 * @param {string} sig.text        Sichtbarer Artikeltext (ohne Chrome).
 * @param {number} sig.faqCount    Anzahl FAQ-Einheiten (Toggles).
 * @param {number} sig.upLinks     In-Text-Links hoch (/blog/…).
 * @param {number} sig.downLinks   In-Text-Links runter (/konjugation/…).
 * @param {number} sig.badAnchors  Anzahl nichtssagender Anker ("hier"/"mehr").
 * @param {object|null} sig.meta   Geparste Meta (optional).
 */
export function lintSignals(sig = {}) {
  const out = [];
  const err = (code, msg) => out.push({ code, level: "error", msg });
  const warn = (code, msg) => out.push({ code, level: "warn", msg });

  const text = String(sig.text || "");
  const meta = sig.meta || null;

  // ── HART: Entwurfs-/Redaktions-Artefakte dürfen nie live ───────────────────
  if (has(/✍️|\[Entwurf\]|\[Draft\]|\[WIP\]/, text))
    err("DRAFT_MARKER", 'Entwurfs-Marker (✍️/[Entwurf]/[Draft]) im Text');
  if (has(/wartet auf (deine |die )?Freigabe|Geht nicht live ohne Freigabe|Status:\s*Entwurf/i, text))
    err("EDITORIAL_NOTE", "Interner Redaktionshinweis im Text (…wartet auf Freigabe / Status: Entwurf …)");
  if (has(/Cover-Bild:|Canva-Asset|beim Veröffentlichen ein passendes/i, text))
    err("EDITORIAL_NOTE", 'Redaktionsnotiz im Text („Cover-Bild: … Canva-Asset einsetzen")');
  if (sig.metaPlaceholder)
    err("META_PLACEHOLDER", 'Platzhalter „Meta (für Blog-Engine & Freigabe)" statt echter Meta-Description');

  // ── HART: Konvertierungs-Reste dürfen nie live ─────────────────────────────
  if (sig.visibleStars)
    err("RAW_MARKDOWN", `${sig.visibleStars}× sichtbares „*" im gerenderten Text (Markdown-Rest)`);
  if (sig.doubleHr)
    err("DOUBLE_HR", "Doppelte <hr>-Trennlinie direkt hintereinander");
  if (sig.brokenInline)
    err("BROKEN_INLINE", `${sig.brokenInline}× zerrissene Fett/Kursiv-Auszeichnung (Fließtext klebt ohne Leerzeichen am schließenden Tag — Muster zerrissener Sternchen-Paare)`);

  // ── HART: Typografie-Fehler, die sofort auffallen ──────────────────────────
  // Auf textTight prüfen (Tags ersatzlos entfernt) — text ersetzt Tags durch
  // Leerzeichen und würde „<em>works</em>." fälschlich als „works ." melden.
  const tight = String(sig.textTight != null ? sig.textTight : text);
  // Leerzeichen vor . oder , (Ellipsen „…"/"..." ausgenommen; frz. Spatium
  // betrifft nur ! ? : ; — Punkt und Komma nie).
  const spacePunct = (tight.match(/[^\s.] [.,](?=\s|["“”«»)\]]|$)/g) || []).length;
  if (spacePunct)
    err("SPACE_PUNCT", `${spacePunct}× Leerzeichen vor Punkt/Komma`);
  // Deutsch geöffnetes „ mit geradem "-Zeichen geschlossen.
  const mixedQuotes = (tight.match(/„[^„“"\n]{1,80}"/g) || []).length;
  if (mixedQuotes)
    err("MIXED_QUOTES", `${mixedQuotes}× „…" mit geradem Anführungszeichen geschlossen (soll „…“ sein)`);

  // ── HART: verbotenes Box-Label / verbotener Einstieg ───────────────────────
  // „TL;DR" ist nie zulässig; „Kurz gesagt" nur als BOX-LABEL verboten (nicht als
  // Fließtext-Übergang „kurz gesagt, …") — die Adapter liefern boxLabelKurzGesagt.
  if (has(/TL;?DR/i, text))
    err("TLDR_LABEL", 'Verbotenes „TL;DR" — die Kurz-Box muss „Das Wichtigste in Kürze" heißen');
  if (sig.boxLabelKurzGesagt)
    err("TLDR_LABEL", 'Box-Label „Kurz gesagt" — muss „Das Wichtigste in Kürze" sein');
  if (has(/Kennst du das\?/i, text))
    err("BANNED_INTRO", 'Verbotener Einstieg „Kennst du das?"');

  // ── WARN: „Das Wichtigste in Kürze"-Box vorhanden & sauber ─────────────────
  const kuerzeLine = text.split(/\n/).find((l) => /Das Wichtigste in Kürze/i.test(l));
  if (!kuerzeLine) warn("KUERZE_BOX_MISSING", 'Box „Das Wichtigste in Kürze" nicht gefunden');
  else if (EMOJI_RE.test(kuerzeLine))
    warn("KUERZE_BOX_EMOJI", 'Deko-Emoji in der „Das Wichtigste in Kürze"-Box (soll ohne Emoji sein)');

  // ── WARN: weitere verbrannte Muster / KI-Floskeln ──────────────────────────
  if (has(/Tabelle ist weg|(im Gespräch|im Kopf)[^.\n]{0,50}(alles (ist )?weg|plötzlich weg)/i, text))
    warn("BURNED_SCENE", 'Mögliche verbrannte „alles-ist-weg/Gespräch-scheitern"-Szene');
  if (has(/Der wichtigste Hebel zuerst|Genau dieses Prinzip/i, text))
    warn("KI_FLOSKEL", 'KI-Floskel („Der wichtigste Hebel zuerst"/„Genau dieses Prinzip")');

  // ── WARN: http statt https ─────────────────────────────────────────────────
  if (has(/http:\/\/conjuexpert\.app/i, text))
    warn("HTTP_LINK", "http:// statt https:// auf conjuexpert.app");

  // ── WARN: FAQ 2–3 Einheiten ────────────────────────────────────────────────
  if (typeof sig.faqCount === "number") {
    if (sig.faqCount < 2) warn("FAQ_COUNT", `FAQ hat ${sig.faqCount} Einträge (Soll 2–3)`);
    else if (sig.faqCount > 3) warn("FAQ_COUNT", `FAQ hat ${sig.faqCount} Einträge (Soll 2–3)`);
  }

  // ── WARN: interne Verlinkung 3–10, mit Hoch + Runter ───────────────────────
  const up = sig.upLinks || 0;
  const down = sig.downLinks || 0;
  const total = up + down;
  if (total < 3) warn("LINKS_FEW", `Nur ${total} kontextuelle In-Text-Links (Soll 3–10)`);
  else if (total > 10) warn("LINKS_MANY", `${total} In-Text-Links (Soll 3–10)`);
  if (up === 0) warn("LINKS_NO_UP", "Kein Hoch-Link (/blog/… zu Hub/Pillar) im Fließtext");
  if (down === 0) warn("LINKS_NO_DOWN", "Kein Runter-Link (/konjugation/[sprache]/[verb]) im Fließtext");
  if (sig.badAnchors) warn("LINKS_BAD_ANCHOR", `${sig.badAnchors} nichtssagende Anker ("hier"/"mehr")`);

  // ── WARN: Meta-Feinheiten (nur wenn Meta übergeben) ────────────────────────
  if (meta) {
    if (meta.metaDescription && meta.metaDescription.length > 160)
      warn("META_DESC_LEN", `Meta-Description ${meta.metaDescription.length} Zeichen (Soll ≤ 160)`);
    if (meta.keyword && meta.metaDescription &&
        !meta.metaDescription.toLowerCase().includes(String(meta.keyword).toLowerCase()))
      warn("META_DESC_KEYWORD", "Keyword fehlt in der Meta-Description");
    if (!meta.hub) warn("KOPF_HUB", 'Kopfblock ohne Feld „Hub" (v2-Pflichtfeld)');
    if (!meta.relatedVerbs || meta.relatedVerbs.length === 0)
      warn("KOPF_RELATEDVERBS", 'Kopfblock ohne „relatedVerbs"');
  }

  return out;
}

/* ─── Adapter 1: Artikel-Quelle (Markdown/Entwurfstext) ──────────────────── */

export function lintArticleText(markdown, opts = {}) {
  const md = String(markdown || "");

  // FAQ-Toggles: öffnende "+++ <Inhalt>"-Zeilen zählen (schließendes "+++" ist leer).
  const faqCount = (md.match(/^\+\+\+[^\n]*\S/gm) || []).length;

  // Kontextuelle In-Text-Links: Markdown-Links [text](…/blog|konjugation/…).
  const linkRe = /\]\((?:https?:\/\/conjuexpert\.app)?(\/(?:blog|konjugation)\/[^)]+)\)/g;
  let m, upLinks = 0, downLinks = 0;
  while ((m = linkRe.exec(md))) {
    if (m[1].startsWith("/konjugation/")) downLinks++;
    else upLinks++;
  }
  const badAnchors = (md.match(/\[(hier(?: klicken)?|mehr)\]\(/gi) || []).length;
  // Box-Label „Kurz gesagt" = fett bzw. am Callout-Anfang (nicht Fließtext).
  const boxLabelKurzGesagt = /(?:^|\n)\s*(?:>\s*)?\*\*\s*Kurz gesagt/i.test(md);
  const metaPlaceholder = /Meta \(für Blog-Engine/i.test(md);

  return lintSignals({ text: md, faqCount, upLinks, downLinks, badAnchors, boxLabelKurzGesagt, metaPlaceholder, meta: opts.meta || null });
}

/* ─── Adapter 2: gerenderter/Live-HTML ───────────────────────────────────── */

export function htmlToText(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n");
}

export function lintRenderedHtml(html, opts = {}) {
  const s = String(html || "");

  // Nur den Artikelkörper betrachten (Chrome/Nav/Footer ausblenden), damit
  // Nav-Links & Footer nicht als In-Text-Links zählen.
  const body =
    (s.match(/<article[\s\S]*?<\/article>/i) || [])[0] ||
    (s.match(/<main[\s\S]*?<\/main>/i) || [])[0] ||
    s;

  const text = htmlToText(body);

  // FAQ-Einheiten: <details>/.faq-Toggles oder ▸-Muster.
  const faqCount =
    (body.match(/<details\b/gi) || []).length ||
    (body.match(/class="[^"]*\bfaq(?:2)?-q\b[^"]*"/gi) || []).length;

  // In-Text-Links aus <a href> im Artikelkörper.
  const hrefs = [...body.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>(.*?)<\/a>/gis)];
  let upLinks = 0, downLinks = 0, badAnchors = 0;
  for (const h of hrefs) {
    const href = h[1];
    const anchor = htmlToText(h[2]).trim().toLowerCase();
    if (/\/konjugation\//.test(href)) downLinks++;
    else if (/(^|conjuexpert\.app)?\/blog\//.test(href) || /\/blog\//.test(href)) upLinks++;
    if (/^(hier|hier klicken|mehr)$/.test(anchor)) badAnchors++;
  }

  const boxLabelKurzGesagt = /<(?:strong|b)>\s*Kurz gesagt/i.test(body);

  // Konvertierungs-/Platzhalter-Signale (nur im gerenderten HTML sinnvoll —
  // in der Markdown-Quelle sind Sternchen legitime Auszeichnung).
  const metaPlaceholder = /Meta \(für Blog-Engine/i.test(s);
  const doubleHr = /<hr\b[^>]*>\s*<hr\b/i.test(body);
  // Zerrissene Auszeichnung: ein Lauf MIT Leerzeichen im Inhalt endet, und das
  // Wort läuft ohne Leerzeichen weiter („…aus wash → </strong>washes…").
  // Absichtliche Morphem-Hervorhebungen (auf<strong>ge</strong>standen,
  // <strong>I</strong>ndefinido) haben keine Leerzeichen im Lauf und matchen
  // nicht; Run-Splits aus Notion („</strong><em>…") ebenfalls nicht.
  const brokenInline = (body.match(/<(strong|em)>[^<]*\s[^<]*<\/\1>\p{L}/gu) || []).length;
  const visibleStars = (text.match(/(?:^|\s)\*+|\*+(?:\s|$)/g) || []).length;
  // Enge Text-Extraktion für Typografie-Checks: Tags ersatzlos entfernen,
  // damit Tag-Grenzen keine Phantom-Leerzeichen erzeugen.
  const textTight = htmlToText(body.replace(/<[^>]+>/g, ""));

  return lintSignals({ text, textTight, faqCount, upLinks, downLinks, badAnchors, boxLabelKurzGesagt, metaPlaceholder, doubleHr, brokenInline, visibleStars, meta: opts.meta || null });
}

/* ─── Bequemlichkeit: nur harte Fehler (Gate-Entscheidung) ───────────────── */

export function hardErrors(findings) {
  return (findings || []).filter((f) => f.level === "error");
}
