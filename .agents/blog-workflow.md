# Blogartikel-Workflow: Von der Idee bis Live

Vollständiger Prozess — Stand Juni 2026.

---

## Wer macht was — Kurzübersicht

| Schritt | Janine | Hans (KI-Redakteur) | Automatik | Entwicklerin (KI-Dev) |
|---|:---:|:---:|:---:|:---:|
| Idee einreichen | ✅ | ✅ | | |
| Thema & Briefing klären | ✅ | | | |
| Artikel schreiben | | ✅ | | |
| Review & Freigabe | ✅ | | | |
| HTML generieren | | | ✅ | |
| Live schalten | | | ✅ | |
| Notion aktualisieren (Datum, Status) | | | ✅ | |
| Scripts & Automatisierung pflegen | | | | ✅ |
| Website-Änderungen (Design, neue Seiten) | | | | ✅ |
| Fehler beheben wenn etwas bricht | | | | ✅ |

**Janines einziger Pflicht-Klick:** Status in Notion auf `Freigegeben` setzen.
Alles andere läuft ohne ihr Zutun.

---

## Übersicht

```
Idee → Notion (Backlog) → Schreiben → Freigeben → Automatisch live → Veröffentlicht
```

Alles läuft über **Notion als zentrale Steuerung**.
Der einzige manuelle Schritt zum Veröffentlichen: Status auf „Freigegeben" setzen.

---

## Schritt 1 — Idee festhalten

**Wer:** Janine oder Hans
**Wo:** Notion → Hans – Zusammenarbeit → Blogartikel → Blogartikel-Tracker

**Was tun:**
1. Neuen Eintrag anlegen (+ Neu)
2. Felder ausfüllen:
   - **Thema** → Arbeitstitel des Artikels
   - **Sprache** → Spanisch / Französisch / Englisch / Niederländisch / Deutsch
   - **Status** → `Backlog`
   - **Säule** → Grammatik / Sprachtipps / Story / Produkt

---

## Schritt 2 — Artikel schreiben

**Wer:** Hans (KI-Agent schreibt den Entwurf) — Janine kann gegenlesen und anpassen
**Wo:** Notion — eigene Seite (Unterseite des Tracker-Eintrags oder separate Seite)

**Aufbau des Artikels in Notion:**

| Block-Typ | Bedeutung auf der Website |
|---|---|
| Heading 1 | H1 (nur einmal, = Artikel-Titel) |
| Heading 2 | H2 (Abschnitt) |
| Heading 3 | H3 (Unterabschnitt) |
| Paragraph | Fließtext |
| Bulleted list | Aufzählung |
| Numbered list | Nummerierte Liste |
| Quote | Pull-Quote (hervorgehobenes Zitat) |
| **Callout** | `.note`-Box — für Beispiele UND für CTAs |
| Toggle | FAQ-Eintrag (aufklappbar) |
| Table | Konjugationstabelle |

**CTA-Regeln (Callout-Blöcke):**
- 3–5 CTAs pro Artikel
- Enthalten immer einen Link zu `conjuexpert.app`
- Werden automatisch nach jedem 2. H2 eingefügt falls zu wenige vorhanden
- Nie als erstes oder letztes Element

**Stil-Vorgaben** (aus `.agents/blog-style.md`):
- Jeder Artikel beginnt **anders** — nie „Kennst du das?"
- Primäres Keyword in Titel, H1 und erstem Absatz
- 3–10 interne Links im Fließtext

**Wer:** Hans (KI-Agent) oder Janine

---

## Schritt 3 — Freigabe

**Wer:** Janine — nur sie gibt frei
**Wo:** Notion → Blogartikel-Tracker → Eintrag öffnen

**Was tun:**
- Artikel in Notion lesen und prüfen
- Status von `Backlog` auf **`Freigegeben`** setzen

Das ist der einzige Klick der nötig ist, um den Artikel live zu schalten.

---

## Schritt 4 — Automatische Veröffentlichung (läuft ohne Eingriff)

**Wer:** GitHub Actions (vollautomatisch, kein Mensch nötig)
**Wann:** Jede volle Stunde (GitHub Actions Cron) + bei jedem Push auf `main`

**Was passiert automatisch:**

```
GitHub Actions: sync-notion.yml
  ↓
1. Notion-Datenbank abfragen → alle Einträge mit Status „Freigegeben"
  ↓
2. Für jeden Artikel:
   a. Passenden Eintrag in clusters.js finden (nach Titel-Match)
   b. HTML generieren aus dem Notion-Seiteninhalt
      → Blocks werden übersetzt: Callout → .note, Quote → .pull, Toggle → FAQ
      → CTAs automatisch eingefügt wenn < 3 vorhanden
      → SEO-Tags, JSON-LD, Breadcrumb, Related-Box — alles automatisch
   c. HTML gespeichert unter /blog/[slug]/index.html
   d. In clusters.js: live: false → live: true
  ↓
3. Änderungen committen und pushen (GitHub Actions Bot)
  ↓
4. GitHub Pages deployed automatisch → Artikel ist live auf conjuexpert.app
  ↓
5. Notion-Status → „Veröffentlicht"
   Notion-Feld „Veröffentlicht am" → heutiges Datum
   Notion-Feld „Blog-Link" → Live-URL des Artikels
```

**Maximale Wartezeit:** 60 Minuten (bis zum nächsten Cron-Lauf)

---

## Schritt 5 — Bestätigung

**Wer:** Automatisch — Janine sieht das Ergebnis in Notion
**Wo:** Notion → Blogartikel-Tracker

**Was du siehst:**
- Status: `Veröffentlicht`
- Veröffentlicht am: Datum
- Blog-Link: `https://conjuexpert.app/blog/[slug]/`

**Artikel ist live** auf conjuexpert.app/blog/ und in der Übersicht verlinkt.

---

## Sonderfall: Artikel ohne clusters.js-Eintrag

Falls der Artikel-Titel in Notion nicht mit einem Eintrag in `clusters.js` übereinstimmt:

1. GitHub Action meldet: `⚠️ Kein clusters.js-Eintrag für: "[Titel]"`
2. Janine oder Entwickler fügt den Eintrag in `src/data/clusters.js` hinzu:
   ```js
   { slug: "/blog/mein-artikel", title: "Mein Artikel-Titel", live: false }
   ```
3. Beim nächsten Action-Run wird er erkannt und veröffentlicht

---

## Änderungen nach Veröffentlichung

> **⚠️ Update-Regel (Dubletten-Schutz):** Ein bestehender Artikel (Status „Update – an Hans" / Slug existiert bereits) wird **überarbeitet — nie neu angelegt**: gleicher Slug, gleicher Tracker-Eintrag, gleicher Entwurf. Die Pipeline rendert nach `/blog/[slug]/index.html`; bei gleichem Slug **überschreibt** sie die Live-Seite (Update), ein abweichender Slug erzeugt eine **Dublette**. Maßgeblich: `.agents/blog-style.md` → „Update-Regel".

| Was | Wie |
|---|---|
| Kleiner Fehler im Text | Direkt in der HTML-Datei im Repo bearbeiten |
| Größere Inhaltliche Änderung | In Notion bearbeiten → Claude oder Hans bitten, HTML neu zu generieren |
| Titel ändern | In Notion + HTML anpassen (slug bleibt gleich) |
| Update bestehender Artikel | **Gleichen Slug** behalten → Pipeline überschreibt Live-Seite. Nie neuen Slug/Eintrag/Kopie anlegen (sonst Dublette) |
| Artikel offline nehmen | In clusters.js `live: true` → `live: false` |

---

## Involvierte Dateien & Systeme

| Was | Wo |
|---|---|
| Artikel-Tracking | Notion: Blogartikel-Tracker (DB-ID: f78defbe…) |
| Artikel-Inhalt | Notion: eigene Seiten pro Artikel |
| Cluster-Struktur | `/src/data/clusters.js` |
| Artikel-HTML | `/blog/[slug]/index.html` |
| Automatisierung | `/.github/workflows/sync-notion.yml` |
| Publish-Script | `/scripts/publish-from-notion.mjs` |
| Tracker-Sync | `/scripts/sync-notion-tracker.mjs` |
| HTML-Generator | `/scripts/notion-to-html.mjs` |
| Stil-Vorgaben | `/.agents/blog-style.md` |
| Produkt-Fakten | `/.agents/product-marketing.md` |
