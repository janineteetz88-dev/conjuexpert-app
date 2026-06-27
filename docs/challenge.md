# Challenge — Logik, Ablauf & offene Punkte

Die „Challenge" (früher „Lernziel") ist eine **feste Liste aus Verben + Wörtern**
mit Dauer und Tagesziel. Geübt wird **vorrangig** aus dieser Liste, bis jeder
Eintrag „sitzt". Dieses Dokument beschreibt den **tatsächlichen Stand im Code**
(nicht nur das Konzept) und hält die offenen Userführungs-Punkte fest.

---

## 1. So läuft die Challenge (Schritt für Schritt)

### 1) Starten
- Einstieg: die Punkte-/Serien-Kachel oben rechts (`sk_title`).
  Tippen → ohne Challenge öffnet sich der **Challenge-Flow** (`GoalFlow`),
  mit Challenge die **Zieltafel** (`Zieltafel`).
- Im Flow wählt man **Niveau · Dauer (1–4 Wochen) · Anzahl Verben · Anzahl Wörter ·
  Zeitformen**. Daraus rechnet die App **Übungen/Tag** und **~Minuten/Tag** aus
  (`GOAL_RATE` je Niveau, `tenseFactor` für mehrere Zeitformen).

### 2) Was angelegt wird — Datenmodell `kunju-goal-data`
`onCreate` speichert `{ ...data, startDate, verbList, wordList }`.
`buildChallengeLists(data, lang)` baut zwei **konkrete Listen**:
- `verbList`: zuerst **gemerkte Verben** (`kunju-favs`), dann mit Niveau-Pool
  (`quizPool`) aufgefüllt bis zur Zielzahl.
- `wordList`: **gemerkte Wörter** (`getVocab`).
- Jeder Eintrag: `{ v|w, done: 0, lastDay: "" }`.

### 3) Täglich
- Jede richtige Quiz-/Karten-/Speed-Antwort zählt **+1 aufs Tagesziel**
  (`kunju-daily`). Tagesziel erreicht → Feiermoment + **Serie +1**
  (`kunju-streak`; verpasster Tag = Reset auf 0).

### 4) Üben — „vorrangig, nicht exklusiv"
- Quiz-Dropdown „Welche Verben?" hat den Eintrag **Challenge**
  (`VERB_GROUPS … id:"challenge"`).
- Ist „Challenge" gewählt, gewichtet `filteredPool` noch **nicht sitzende**
  Challenge-Verben **4×** in den Pool, plus den normalen Pool für Abwechslung.
- Der Button **„Jetzt üben"** in der Liste setzt `kunju-quiz-pending-group =
  "challenge"` und wechselt ins Quiz (dort wird das Dropdown einmalig vorgewählt).

### 5) Wann ein Eintrag „sitzt" — Mastery (`CH_DONE = 3`)
- Gemeistert nach **3 richtigen Antworten an 3 VERSCHIEDENEN Tagen**
  (`done` wird pro `toDateString()` nur einmal erhöht).
- **Automatisch** aus dem Quiz: `creditChallengeVerb` (in `record`, `speedAnswer`,
  `nextCard`), `creditChallengeWord` (in `VocabView.checkPractice`).
- **Manuell (Hybrid):** in der Liste per ✓ abhaken/zurücksetzen.

### 6) Liste verwalten — Gemerkt › Challenge (`ChallengeView`)
3. Reiter: Verben + Wörter mit Status (offen / am Lernen / ✅), Fortschritt
„x von y sitzen", „noch n Tage". **Bearbeiten-Modus**: aus Gemerkten übernehmen ·
selbst tippen · „auffüllen" (`fillVerbs`) · entfernen · manuell abhaken.
Nach dem Anlegen führt der Erfolgs-Screen-Button **„Verben selbst festlegen"**
direkt hierher (öffnet den Bearbeiten-Modus, einmaliger Flag
`kunju-challenge-pending-edit`).

### 7) Abschluss
Sitzen **alle** Einträge → `allDone` → „Challenge gemeistert" mit Konfetti.

---

## 2. Datenmodell (Referenz)

```
kunju-goal-data = {
  verbs, words, weeks, tenseCount, perDay, startDate,
  verbList: [ { v: "warten", done: 0, lastDay: "" }, … ],
  wordList: [ { w: "das Haus", done: 0, lastDay: "" }, … ]
}
kunju-daily   = { count, goal, day, streak }   // Tagesfortschritt
kunju-streak  = n                              // Serie (Reset bei Miss-Tag)
```
Status je Eintrag: **offen** (done 0) · **am Lernen** (1–2) · **sitzt ✅** (done ≥ 3).

---

## 3. Userführung — umgesetzt

Kern-Loop (Liste → vorrangig üben → 3 Tage → sitzt → gemeistert) plus alle
Führungs-Verbesserungen sind jetzt gebaut:

- **🅐 Wörter-Pfad** *(erledigt #25)* — die Challenge-Liste verlinkt den Wörter-
  Bereich klar zum Wortschatz-Trainer („Wörter übst du im Wortschatz →"), wo
  Challenge-Wörter automatisch gewertet werden.
- **🅑 Rückhol-Anker** *(erledigt #26)* — schlanke Leiste unter den Sprachkacheln
  („Challenge · Tag X/Y — noch N"), Tap → Zieltafel.
- **🅒 Sichtbarer Einstieg** *(erledigt #27)* — ohne aktive Challenge zeigt dieselbe
  Leiste „Challenge starten · dein Lernplan".
- **🅓 In-Quiz-Erfolg** *(erledigt #29)* — meistert man ein Verb (3/3 Tage),
  erscheint ein kurzer Toast „‚verb' sitzt jetzt — gemeistert!" mit Konfetti.
- **🅔 Dropdown bedingt** *(erledigt #28)* — „Challenge" steht im „Welche Verben?"-
  Dropdown nur bei aktiver Challenge.
- **🅕 Sanftes Zeit-Ende** *(erledigt #30)* — sind die Wochen um, zeigt die Liste
  „Zeit um — a von b sitzen" mit „+1 Woche" / „Neue Challenge".

---

## 4. Wiederverwendung (wenig Neubau)

Genutzt: gemerkte Verben/Wörter, Wortschatz-„Vorschlagen"-KI, Wortschatz-Eingabe,
Spaced-Repetition, Tagesziel/Serie, Challenge-Erstell-Flow. Neu war nur:
Challenge-Liste als Set (`verbList`/`wordList`), die Listenansicht (3. Reiter)
und die Pool-Gewichtung im Quiz.
