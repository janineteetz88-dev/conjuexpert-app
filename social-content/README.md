# Social-Automation (ConjuExpert)

Automatische Einplanung von Social-Posts über **Blotato** — zeitgesteuert per GitHub
Action, unabhängig von einer laufenden Claude-Session oder dem MCP-Connector.

## Wie es funktioniert

1. **Inhalte** liegen als Bilder im öffentlichen Repo unter `social-assets/…` und
   werden per `raw.githubusercontent.com`-URL geladen (öffentlich abrufbar → Blotato
   kann sie serverseitig holen).
2. **Kalender**: `social-content/manifest.json` listet alle geplanten Posts
   (Plattform, Konto, Zeit, Bilder, Caption).
3. **Runner**: `.github/workflows/social-scheduler.yml` startet täglich (Cron) und
   führt `scripts/social/blotato-schedule.mjs` aus. Das Skript plant jeden Post ein,
   dessen Zeit in den nächsten 3 Tagen liegt und der noch nicht im Ledger steht.
4. **Ledger**: `social-content/scheduled.json` merkt sich eingeplante Posts
   (Blotato-`postSubmissionId`), damit nichts doppelt gepostet wird. Der Runner
   committet Aktualisierungen selbst zurück.

## Einmalige Einrichtung (nur diese 2 Schritte)

1. **Blotato-API-Key als Secret hinterlegen** (nur Janine — Secret gehört zu dir):
   - Blotato → *Settings → API → Generate API Key* (der **neue, rotierte** Key).
   - GitHub → Repo **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `BLOTATO_API_KEY` — Wert: der Key.
   - ⚠️ Den Key **nirgends** in Code, Chat oder Dateien schreiben — nur ins Secret.
2. **Diesen Branch nach `main` mergen** (nur Janine — Freigabe-Gate). Geplante
   Cron-Läufe starten erst vom Default-Branch.

## Neuen Post hinzufügen

- Bilder/Video nach `social-assets/<kampagne>/` committen.
- Eintrag in `manifest.json → posts` ergänzen (`id`, `platform`, `accountId`,
  `scheduledTime` ISO 8601 mit Offset, `mediaBaseUrl`, `media`, `caption`).
- Fertig — der nächste Runner-Lauf plant ihn zur richtigen Zeit ein.

## Konten (Blotato)

| Plattform  | Handle               | accountId |
|------------|----------------------|-----------|
| Instagram  | @conjuexpert.app     | 57778     |
| TikTok     | @jane.von.conjuexpe  | 50129     |
| YouTube    | ConjuExpert App      | 42799     |

## Manuell testen

Actions-Tab → *Social Scheduler (Blotato)* → **Run workflow** → `dry_run = 1`
(zeigt nur an, was eingeplant würde, ohne zu senden).

## Hinweis zur API-Struktur

Das Skript nutzt `POST https://backend.blotato.com/v2/posts` mit Header
`blotato-api-key` und Body `{ post: { accountId, target, content }, scheduledTime }`.
Beim ersten echten Lauf gegen die API einmal per `dry_run` bzw. Actions-Log prüfen,
ob Blotato den Body akzeptiert; Feldnamen ggf. an die aktuelle Blotato-Doku angleichen
(`content.mediaUrls`, `target.targetType`).

---

## 🧠 Content-Prompts (KI-gestützt, auf ConjuExpert angepasst)

Fertige Prompts für die tägliche Reel-Produktion. Der **ConjuExpert-Kontext ist schon
eingebaut** — nur noch das Tages-Thema (Verb / Redewendung / Konjugations-Regel) einsetzen,
wo `[…]` steht. Adaptiert aus zwei Social-Prompt-Sammlungen und auf unsere Nische zugeschnitten.

**Fixer ConjuExpert-Kontext** (gilt für alle Prompts unten):
- **Produkt:** ConjuExpert — Verben-Konjugier-Trainer, 5 Sprachen (DE/ES/FR/NL/EN), im Browser,
  kein App-Store. USP: Verben **aktiv üben** über alle Zeitformen, mit **eigenen Themen** — statt
  nur nachschlagen.
- **Zielgruppe:** internationale Deutschlerner (B1–B2), die Duolingo/Busuu/Babbel nutzen, aber
  **Verb-Tiefe** vermissen — Reisende, Expats, Berufstätige.
- **Captions:** **englisch-facing**, mit deutschen Feature-/Grammatik-Begriffen (Perfekt,
  Konjunktiv II, Plusquamperfekt …).
- **Tonalität:** freundlich, ermutigend, leichter Humor · Look **Sand + Regenbogen**.
- **Säulen:** 🌈 Verb des Tages · 🟡 Typisch Deutsch (Redewendung) · 💬 Comment-Quiz
  (Konjugation, Level-Label A1–B2, Antwort in der Caption nach Spoiler-Lücke).
- **CTA:** **Follow-first** · Beta-Code FEEDBACK100 = 30 Tage Premium gratis.

### 1 · Virale Hooks entwickeln
> Thema: `[Verb / Redewendung / Konjugations-Regel des Tages]`. Zielgruppe: internationale
> Deutschlerner B1–B2 (englisch-facing). Erstelle **5 Hook-Varianten** für ein 9:16-Reel, die
> in den **ersten 2 Sekunden** den Scroll stoppen und neugierig machen. Nutze provokante,
> kontraintuitive Aussagen über die deutsche Sprache (z. B. „German verbs that split in half").
> Für jede Hook: der **Textoverlay** (max. 6 Wörter) + der psychologische Trigger dahinter
> (Überraschung, Ego, Aha-Moment, Frust). Keine Clickbait-Lügen — die Auflösung muss halten.

### 2 · Algorithmus-Trigger setzen
> Erkläre, welche Faktoren **Instagram / TikTok / YouTube Shorts** aktuell nutzen, um Reels an
> **neue, nicht-folgende** Zielgruppen auszuspielen (Watch-Time, Re-Watch, Kommentare, Shares,
> Saves). Wie baue ich ein ConjuExpert-Sprachlern-Reel (Verb / Redewendung / Quiz) so, dass genau
> diese Trigger erfüllt werden — für einen **neuen Account mit wenig Followern**? Gib konkrete,
> umsetzbare Regeln, keine Allgemeinplätze.

### 3 · Watch-Time optimieren
> Mein geplantes Reel-Skript: `[Skript einfügen]`. Es ist ein ConjuExpert-Sprachlern-Reel
> (unter 30 Sek., starker **Pattern-Interrupt** in den ersten 2 Sek.). Analysiere **Sekunde für
> Sekunde**, wo Zuschauer wahrscheinlich abspringen, und wie ich die Watch-Time bis zum
> Follow-Abspann erhöhe. Achte auf: Pacing, Text-Menge pro Frame, Timing der Auflösung,
> Re-Watch-Anreiz. Gib mir die überarbeitete Version mit **soft CTA** am Ende.

### 4 · Shares & Saves provozieren
> Thema: Deutschlernen / Verb-Konjugation. Welche Art von Sprachlern-Content wird in dieser
> Nische am häufigsten **gespeichert oder geteilt** (z. B. Merkhilfen, Fehler-Listen,
> „save this"-Regeln)? Erstelle **3 ConjuExpert-Reel-Ideen** (passend zu unseren Säulen
> Verb / Typisch / Quiz), die genau **Saves & Shares** auslösen — jeweils mit Hook, Kern-Payoff
> und dem konkreten Grund, warum man es speichert oder teilt.

### 5 · Virale Formatvorlage erstellen
> Analysiere die Struktur viraler Sprachlern-/Grammatik-Reels: `[2–3 Beispiel-Links einfügen]`.
> Erstelle eine **wiederverwendbare ConjuExpert-Formatvorlage** mit (a) **Textoverlay-Aufbau**
> Frame für Frame (Hook → Aufbau → Payoff → Follow-Abspann) und (b) **Caption-Struktur**
> (englisch-facing, deutsche Feature-Begriffe, bei Quiz Antwort nach Spoiler-Lücke, Follow-first,
> Hashtags). Halte sie so generisch, dass sie für **jedes** Verb / jede Redewendung / jede
> Quiz-Regel funktioniert.

> **Hinweis:** Recherche-/Validierungs-Prompt („top-performing Posts der letzten 30 Tage
> cross-plattform finden") und die Voll-Automatisierung sind bei uns bereits durch die
> Blotato-Pipeline + den Reel-Generator abgedeckt — die 5 Prompts oben sind der kreative Teil,
> der davor sitzt.
