# Challenge — Logik & Konzept

Die „Challenge" ist das frühere Lernziel — jetzt als **konkrete, nachvollziehbare
Liste** statt nur als Mengen-Vorgabe. Dieses Dokument hält die abgestimmte Logik fest.

> Kernidee: Eine Challenge ist eine **feste Liste aus Verben + Wörtern** mit Dauer
> und Tagesziel. Geübt wird **vorrangig** aus dieser Liste, bis jeder Eintrag „sitzt".

---

## 1. Datenmodell (Erweiterung von `kunju-goal-data`)

Bisher: nur Zahlen `{ verbs, words, weeks, tenseCount, perDay, startDate }`.

Neu zusätzlich:
```
verbList: [ { v: "denken", done: 0 }, … ]   // N konkrete Verben
wordList: [ { w: "das Haus", done: 0 }, … ] // M konkrete Wörter
```
- `done` = Anzahl erfolgreicher Wiederholungen (Spaced Repetition).
- Status je Eintrag: **offen** (0) · **am Lernen** (1–2) · **sitzt ✅** (Ziel erreicht, z. B. ≥ 3 richtige in wachsenden Abständen).
- Mastery nutzt die vorhandene SR-Logik (`kunju-vbsr-*` für Verben, Vokabel-SR für Wörter).

---

## 2. Bestückung — wie Verben/Wörter in die Challenge kommen

Beim Erstellen (und später per „Bearbeiten") wird die Liste auf **vier Wegen** gefüllt, frei mischbar:

1. **Aus Gemerkt übernehmen** — gespeicherte Verben/Wörter per Häkchen reinnehmen.
2. **Vorschlagen lassen** — „Schlag mir 8 Verben / 10 Wörter vor" (KI/kuratiert, nach Niveau, häufige zuerst). Nutzt die vorhandene Vorschlags-Funktion.
3. **Selbst eingeben** — eigenes Verb/Wort tippen & hinzufügen. Nutzt das vorhandene Wortschatz-Eingabefeld.
4. **Auto-Auffüllen** — fehlen noch Einträge zur Vorgabe, füllt die App automatisch aus dem Niveau-Pool auf, damit die Challenge immer „voll" ist.

→ Jeder hat sofort eine Challenge (Auto/KI); wer will, bestückt sie gezielt selbst.

---

## 3. Üben — Verflechtung ins Quiz (vorrangig, nicht exklusiv)

Solange eine aktive Challenge läuft, wird der Quiz-/Übungs-Pool **gewichtet**:
- **Challenge-Einträge** (noch nicht „sitzt") bekommen ein **hohes Pick-Gewicht** (z. B. ~3–4×, analog zur bestehenden Favoriten-Gewichtung) → tauchen **bevorzugt** auf.
- Der **restliche Pool** (Niveau-Verben) bleibt mit kleinerem Anteil drin, damit Abwechslung erhalten bleibt.
- „Sitzt"-Einträge fallen aus der Bevorzugung (kommen nur noch selten zur Auffrischung).

So wird sichergestellt, dass die 8 Verben **tatsächlich** geübt werden — ohne den Rest komplett auszublenden.

---

## 4. GEMERKT-Seite — drei Reiter

`Verben · Wortschatz · Challenge`

**Challenge-Reiter** = Listenansicht der aktiven Challenge:
- Kopf: „Deine Challenge · noch X Tage" + Fortschrittsbalken
- **Verben-Liste** mit Status (offen / am Lernen / ✅)
- **Wörter-Liste** mit Status
- Fortschritt: „5 von 8 Verben sitzen · 12 von 20 Wörtern"
- Buttons: **Jetzt üben** (gezielt offene Einträge) · **Bearbeiten** (Bestückung) · **Neue Challenge**
- Kein aktive Challenge → Einstieg „Challenge erstellen" (führt in den bekannten Challenge-Flow).

---

## 5. Täglicher Ablauf (unverändert + jetzt verknüpft)

- Jede Konjugation/Quiz-Antwort zählt +1 aufs **Tagesziel** → bei Erreichen: Feiermoment + **Serie** +1 (Miss-Tag = Reset).
- Neu: Der Fortschritt der **Liste** wächst sichtbar mit (Mastery je Eintrag).
- Challenge insgesamt „gemeistert", wenn alle Einträge ✅ **oder** die Wochen um sind.

---

## 6. Wiederverwendung (wenig Neubau)

Vorhanden & genutzt: gemerkte Verben (Favs), Wortschatz-Liste, „Wörter vorschlagen"-KI,
Wortschatz-Eingabe, Spaced-Repetition, Tagesziel/Serie, der Challenge-Erstell-Flow.

Neu: Challenge-Liste als gespeichertes Set (`verbList`/`wordList`), die Listenansicht
(3. Reiter) und die Pool-Gewichtung im Quiz.

---

## 7. Bauschritte (inkrementell, mit Zwischenstand)

1. **Datenmodell + Auto-Bestückung**: bei Challenge-Erstellung konkrete `verbList`/`wordList` erzeugen (Gemerkt zuerst, dann Auto-Auffüllen) und speichern.
2. **Challenge-Reiter + Listenansicht** in GEMERKT (Status, Fortschritt).
3. **Quiz-Gewichtung**: Challenge-Einträge vorrangig in den Pool.
4. **Bestückungs-UI**: aus Gemerkt übernehmen · vorschlagen · selbst eingeben (beim Erstellen/Bearbeiten).
5. **Politur**: „sitzt"-Logik, „Challenge gemeistert", Texte/Badges.
