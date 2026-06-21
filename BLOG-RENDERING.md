# Blog-Render-Kontrakt (BLOG-RENDERING.md)

> Quelle der Wahrheit für die Blog-Engine (`scripts/notion-to-html.mjs` bzw.
> `scripts/lib/render-article.mjs`). Spiegelt den Abschnitt „Notion-Block-Typen → HTML"
> aus `hans-office/.agents/blog-style.md`. Inhalt (Brand Voice, Länge, SEO-Stil)
> bestimmt die Content-Routine — **dieses** Dokument regelt nur, **wie** die
> Notion-Bausteine zu HTML werden. Standard und Engine immer synchron halten.

## Pflicht-Mapping (Notion-Baustein → HTML)

| Notion-Baustein | HTML-Ergebnis |
|---|---|
| Callout-Block (Beispiele, Störer/CTAs, „Kurz gesagt") | Hinweiskasten `.note` |
| Toggle-Block (FAQ) | Akkordeon/`<details>`, ans Artikelende |
| Tabelle (Konjugationen) | `.conjtable-wrap > table.conjtable` (zentral in `blog.css` gestylt) |
| Zeile mit Label `**Meta-Description:**` direkt unter der H1 | `<meta name="description">` |
| Blockzitat oben (Slug · Typ · Cluster · Säule · Pillar · Hub · Geschwister · relatedVerbs) | Front-Matter (nicht im sichtbaren Body rendern) |
| Normaler Text / H2 / H3 | `<p>` / `<h2>` / `<h3>` |

## Harte Regeln

1. **Meta-Description:** primär die Zeile mit Label `**Meta-Description:**`. Fehlt das
   Label → Fallback auf den ersten kursiven Intro-Absatz; Markdown entfernen,
   ~155–160 Zeichen. Kein Artikel darf wegen fehlender Meta-Description übersprungen
   werden (nur warnen + Fallback).
2. **Slug-Eindeutigkeit:** gleicher Slug → bestehende Seite überschreiben, NIE neu
   anlegen (kein Duplicate Content).
3. **Fonts:** self-hosted via `/fonts/blog.css`. Keine externen Google-Fonts (DSGVO).
4. **Links:** intern als `https`, nie `http`.
5. **Callouts ≠ Zitate:** nur Callout-Blöcke werden zu `.note`-Kästen; Zitate (`>`)
   bleiben Zitate.
6. **Quellen automatisch:** Zitiert ein Artikel im Text einen Beleg aus dem
   verifizierten Belegpool (Notion „Quellen zu Sprache Lernen" — z. B.
   `(Dunlosky et al., 2013)`, `(Behnke, 2025)`, `(PFH Private Hochschule Göttingen, 2026)`),
   hängt die Engine automatisch einen `Quellen`-Abschnitt (`<h2 id="quellen">` +
   `<ol class="sources">`) ans Artikelende — mit verifizierter Angabe + Link, wo
   vorhanden. Quelle der Wahrheit ist die Beleg-Tabelle `SOURCES` in
   `render-article.mjs`; nur dort gepflegte Belege werden gelistet, nichts erfunden.
   Quellenliste NICHT von Hand anlegen.
7. **Tabellen zentral stylen:** Konjugations-/Vergleichstabellen werden als
   `.conjtable-wrap > table.conjtable` ausgegeben (erste Zelle `.pers`, übrige
   `.form`, Kopfzeile in `<thead>`). Das Aussehen lebt ausschließlich in
   `blog.css` (`.conjtable*`), damit ALLE Artikel — heute und künftig — dieselbe
   lesbare Darstellung bekommen (Kopfzeile abgesetzt, Mono-Formen, Zebra,
   horizontales Scrollen statt Quetschen auf schmalen Bildschirmen). NIE
   per-Artikel inline stylen. CSS-Änderung = `blog.css?v=N` hochzählen.

## Bei jeder Änderung an `notion-to-html.mjs` / `render-article.mjs`

- Gegen einen v2-Referenzartikel testen (z. B. `unregelmaessige-verben-spanisch`):
  Meta-Description gesetzt? Callouts = `.note`? FAQ = Toggle? Tabellen ok? Keine
  externen Fonts?
- Der Render-Selbsttest (`scripts/render-selftest.mjs`) + der Render-Guard
  (`scripts/lib/render-guard.mjs`) laufen in CI vor dem Publish und blockieren
  fehlerhaftes HTML.
- Standard-Doc (`hans-office/.agents/blog-style.md`) und diese Datei synchron halten.
