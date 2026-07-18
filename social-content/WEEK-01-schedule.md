# 📅 Wochenplan — Deutsch-Kanal (Start-Woche)

**Zeitzone:** Europe/Berlin · **Slot:** 18:00 (guter Abend-Engagement-Slot)
**Status:** „meckern"-Reel ist Sa 18.07. bereits live (IG + TikTok).

| Tag | Datum | Post | Asset | Look | Plattform |
|-----|-------|------|-------|------|-----------|
| Sa | 18.07. | 🟡 Typisch „nicht meckern" | `brand-meckern` ✅ live | neu ✅ | IG + TikTok |
| Mo | 20.07. | 🟡 Typisch „nicht mein Bier" 🍺 | `brand-bier` | neu ✅ | IG + TikTok |
| Di | 21.07. | 🔴 Quiz „Basics" (nehmen·gehen·sein) | `quiz-basics` | neu ✅ (sand) | IG Carousel |
| Mi | 22.07. | 🟡 Typisch „auf den Keks" 🍪 | `brand-keks` | neu ✅ | IG + TikTok |
| Do | 23.07. | 🔴 Quiz „Irregular" (fahren·essen·haben) | `quiz-irregular` | neu ✅ (sand) | IG Carousel |
| Fr | 24.07. | 🔴 Quiz „Modals" (können·anrufen·werden) | `quiz-modals` | neu ✅ (sand) | IG Carousel |

**Alle Reels:** eigenes designtes Cover (Startbild) + lizenzfreier Musik-Bed.
**Alle Posts:** Caption mit ConjuExpert-Erklärung + Beta-Hinweis + Code FEEDBACK100.

## Noch in Produktion (kommt danach)
- **Verb des Tages** im neuen Sand-Look (echter App-Scroll bleibt) — dann als Nachmittags-/Zusatz-Säule.
- **Quiz-Karussells** optional auf den Sand-Look umziehen (aktuell rotes CI, wiedererkennbar, aber nicht sand).

## Technischer Weg zum Schedulen
- Bevorzugt: **Blotato-Connector** (sobald online) — Reels + Carousels mit `scheduledTime`.
- Alternativ: **GitHub-Action** (`social-scheduler.yml`) über `manifest.json` — läuft mit dem hinterlegten API-Key unabhängig vom Connector, braucht die Einträge aber auf `main` (= dein Merge).
