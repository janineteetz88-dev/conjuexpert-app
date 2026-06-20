# ConjuExpert Blog – Schreibvorgaben

Dieses Dokument wird von der Blog-Routine automatisch gelesen und
enthält verbindliche Vorgaben für das Verfassen von Blogartikeln.

---

## SEO

- Primäres Keyword im `<title>`, in H1 und im ersten Absatz.
- Meta-Description ≤ 160 Zeichen, enthält das Primärkeyword.
- Jede Seite hat genau eine H1; Unterabschnitte H2 → H3 (keine Stufen
  überspringen).

## Interne Verlinkung (verbindlich)

Folgt der internen Verlinkungs-Architektur (SEO + GEO). Beim Schreiben selbst zu
setzen (Author-Side):
- 3–10 kontextuelle In-Text-Links im Fließtext (stärker gewichtet als Footer-/
  Related-Boxen); den wichtigsten Link früh setzen.
- Richtungen: hoch zum passenden Sprach-Hub + Global-Pillar
  (/blog/verben-konjugieren-lernen) · seitwärts zu 2–4 Geschwister-Spokes desselben
  Clusters · runter zu den im Text konkret genannten Verb-Seiten
  (/konjugation/[sprache]/[verb]).
- Anchor-Text: beschreibend = Ziel-Keyword der Zielseite, variiert
  (exakt/teil/natürlich), nie „hier klicken"/„mehr".
- Eine Entität → eine kanonische Seite, konsistente Benennung (GEO-Entitäten-Graph).
- Slug- und Cluster-Zuordnung aus der Start-Cluster-Map der Architektur.

Nicht Author-Side (von der Engine generiert, NICHT im Fließtext faken): Breadcrumb,
„Hoch zum Hub", reziproke Gegenlinks, .related-Block, JSON-LD.

## Intro & Einstieg

- Jeder Artikel eröffnet **anders**. Nie „Kennst du das?" oder eine wiederkehrende
  Standardformel.
- Die ersten zwei Sätze dürfen sich bei keinen zwei Artikeln ähneln.
- Kein „In diesem Artikel lernst du…" als Opener.
- Kein direktes Ansprechen des Lesers mit einer rhetorischen Frage als erste Zeile.

## Layout & vertikaler Rhythmus (verbindlich)

- **Eine Quelle der Wahrheit:** Alle Abstände der Artikel-Bausteine stehen
  zentral in `blog/blog.css` im Block „Vertikaler Rhythmus (ZENTRAL)"
  (`.artwrap`-spezifische Regeln). **Niemals** Komponenten-Margins pro Artikel
  inline im `<style>` setzen — sonst driften die Abstände auseinander.
- **Geteilte Bausteine gehören in `blog.css`**, nicht in jeden Artikel kopiert:
  `.takeaways`, `.tldr`, `.faq2`, `.note`, `.figure`, `.shots`/`.shot1`,
  `.ctab`, `.pull`, `.quizcta`, `.authorbox`, Hero/`.slot-cap`, `.gw-*`.
- **Rhythmus-Richtwerte:** Fließtext-Absatz 26px; Boxen (Takeaways/TL;DR/
  FAQ/Note) 32px oben & unten; Bilder/Screenshots 32px; Blockzitate 30px;
  Tabellen 28px; H2 60px oben (mit Trennlinie), H3 42px oben.
- **Bei jeder CSS-Änderung** den Cache-Buster hochzählen (`blog.css?v=N`) —
  über alle Blog-Seiten und im Render-Template (`render-article.mjs` /
  `notion-to-html.mjs`).

