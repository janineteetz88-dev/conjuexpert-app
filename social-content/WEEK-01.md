# 📅 Woche 1 — Deutsch-Lernkanal (ConjuExpert)

**Rhythmus:** 2 Posts/Tag = **14 Posts/Woche**
- **Vormittag:** Reel (Verb des Tages *oder* Typisch Deutsch) — Bewegung, App 1:1
- **Nachmittag:** Quiz-Karussell „Karten drehen" (Frage → Antwort zum Wischen)

**Wiedererkennbar über alle Säulen:** Regenbogen-Logo + leuchtender Regenbogen-Rahmen
+ `conjuexpert.app` + `FEEDBACK100`. Jede Säule hat ihr eigenes CI.

| Säule | CI-Farbe | Format | Länge |
|-------|----------|--------|-------|
| 🌈 Verb des Tages | Regenbogen/App-Rot | Reel (App-Scroll durch Zeitformen) | 30 s |
| 🟡 Typisch Deutsch | Gold | Reel (Spruch-Meme „we don't say…") | 14 s |
| 🔴 Daily Quiz | Rot | Karussell (9 Slides, 4 Sprachen oben) | — |

---

## Wochenplan

| Tag | Vormittag (Reel) | Nachmittag (Quiz-Karussell) |
|-----|------------------|------------------------------|
| **Mo** | 🌈 Verb: **aufstehen** (trennbar) ✅ `reel-aufstehen.mp4` | 🔴 **Basics:** nehmen · gehen · sein ✅ `quiz-basics` |
| **Di** | 🟡 Typisch: **„da kann man nicht meckern"** ✅ `td-meckern.mp4` | 🔴 **Irregular:** fahren · essen · haben ✅ `quiz-irregular` |
| **Mi** | 🌈 Verb: *(neu — braucht App-Scroll-Capture)* ⏳ | 🔴 **Modals:** können · anrufen · werden ✅ `quiz-modals` |
| **Do** | 🟡 Typisch: **„das ist nicht mein Bier"** 🍺 ✅ `td-bier.mp4` | 🔴 Basics *(Wiederholung/neue Verben)* |
| **Fr** | 🌈 Verb: *(neu — braucht App-Scroll-Capture)* ⏳ | 🔴 Irregular *(neue Verben)* |
| **Sa** | 🟡 Typisch: **„du gehst mir auf den Keks"** 🍪 ✅ `td-keks.mp4` | 🔴 Modals *(neue Verben)* |
| **So** | 🧩 **Endungs-Muster-Karussell** (German-Pain, blau) — Backlog `ideas.md` ⏳ | 🔴 Community-Frage / Wochen-Highlight |

✅ = fertig gerendert · ⏳ = noch zu produzieren

---

## Status der Assets

**Fertig (5 Reels/Karussells produziert):**
- `scripts/social/reel-gen/reel-aufstehen.mp4` — Verb des Tages (30 s, App-Scroll)
- `scripts/social/typisch-deutsch/td-meckern.mp4` — Typisch Deutsch (14 s)
- `scripts/social/typisch-deutsch/td-bier.mp4` — Typisch Deutsch (14 s)
- `scripts/social/typisch-deutsch/td-keks.mp4` — Typisch Deutsch (14 s)
- `scripts/social/quiz-carousel/out/{quiz-basics,quiz-irregular,quiz-modals}/` — 3 × 9 Slides

**Noch offen (2 Bausteine):**
1. **Weitere „Verb des Tages"-Reels** (Mi + Fr). Bottleneck: pro Verb muss der echte
   App-Screen durch alle Zeitformen gescrollt und als langer PNG-Streifen gecaptured
   werden (wie `aufstehen-scroll.png`). Das ist der einzige manuelle Schritt — braucht
   die laufende App mit dem jeweiligen Verb. → **Dev-Aufgabe / Janine kurz die App**.
2. **Endungs-Muster-Karussell** (So) — Konzept steht in `ideas.md`, baubar mit dem
   quiz-carousel-Generatorprinzip.

---

## Beta-Angebot (überall einheitlich)
`Code FEEDBACK100 → 30 days Premium free · conjuexpert.app · no download needed`

## Abspann-Slogan (alle Reels)
`Learn German verbs faster 🎯` + `conjuexpert.app` + `FEEDBACK100`
