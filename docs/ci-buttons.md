# CI-Regel: Buttons (Variante 1 — verbindlich)

Festgelegt mit Janine. Gilt für die Variante C („Sand & Regenbogen") und den späteren
Einbau in die echte App.

## Grundidee
Der Regenbogen ist das stärkste Marken-Signal. Er wirkt nur, wenn er **knapp** eingesetzt wird.
Deshalb: **Regenbogen-Fläche ausschließlich für Geld-/Premium-Momente.** Alles andere ist Schwarz
bzw. Hell. Der **dünne Regenbogen-Strich** ist die gemeinsame Klammer (CI) auf allen Buttons/Auswahl-Rändern.

## Die drei Button-Typen

| Typ | Aussehen | Wann |
|-----|----------|------|
| **Primär** | Schwarz (Verlauf `#332e27→#211e19`) + feine Regenbogen-Kante + weicher Schatten | normale Haupt-Aktion **ohne Geld** — z. B. „Konjugieren", „Konto anlegen", „Los geht's", „Weiter üben" |
| **Premium / Geld** | Regenbogen-Fläche (deeper Verlauf `--rb-deep`), weißer Text + `text-shadow` | **bezahlpflichtig / Upgrade** — z. B. „Premiumtarif holen", „Zahlungspflichtig kaufen", „Premium starten", „Auf Jahresabo wechseln" |
| **Sekundär** | Hell (Karte) + Regenbogen-Kante | Ablehnen/Neben-Aktion — z. B. „Später", „Erstmal kostenlos weiter", „Ziele anpassen", Würfel |

## Auswahl-Zustände
Aktive Auswahl (Plan, Niveau, Tarif) = **weiße Fläche + dünner Regenbogen-Rand** (nie Einzelfarbe wie rot/lila).

## Ausnahme: Sprach-Pill
Die aktive Sprach-Pill behält ihre **feste Sprachfarbe** (DE Rot · ES Orange · EN Blau · NL Grün · FR Lila)
— das ist Orientierung/Identität, kein Button.

## Barrierefreiheit
- Weißer Text auf Schwarz = hoher Kontrast (AA).
- Weißer Text auf Regenbogen nur mit `text-shadow` + deeper Verlauf (`--rb-deep`).
- Sichtbare `:focus-visible`-Ringe, Tap-Flächen ≥ 44–48 px.
