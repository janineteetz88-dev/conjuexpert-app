# ConjuExpert — CI / Design-System

**Status:** verbindlich · spiegelt den **aktuellen Live-Look der App** (Stand laufend gepflegt).
**Quelle der Wahrheit im Code:** die CSS-Variablen in `index.html` — konkret der
„CI-Bereinigung"-Block, der die älteren Basis-Tokens überschreibt. Dieses Dokument
hält genau diese **effektiven** Werte fest, damit man die CI **leicht auf Landingpage
und Blog-Artikel** übertragen kann.

> Wer Landing/Blog gestaltet: die Token-Tabelle unten 1:1 übernehmen (oder den fertigen
> `:root`-Block am Ende kopieren). Damit sieht alles aus wie die App.

---

## 1. Markenidee (in einem Satz)

Ruhiger **Sand-/Creme-Hintergrund**, **Ink** (fast schwarz) für Text & Haupt-Flächen,
und der **Regenbogen als knappes Marken-Signal** — *nicht* flächig, sondern als dünne
Kante / dünner Strich, und **flächig nur für Premium-/Geld-Momente**.

**Kein** Lila/Pink mehr · **keine** Flammen-Icons · **keine** verspielten/Kinder-Emoji.

---

## 2. Farb-Tokens (effektiv, Light-CI)

| Token | Wert | Einsatz |
|---|---|---|
| `--bg` | `#f4eede` | Seiten-Hintergrund (Sand) |
| `--surface` | `#fffdf6` | Karten, Popups, Eingaben |
| `--surface-2` | `#ece3d0` | zweite Fläche, Pills, Chips, dezente Buttons |
| `--text` | `#211d15` | Fließtext, Überschriften (Ink) |
| `--muted` | `#8b8068` | Sekundärtext, Labels, Captions |
| `--border` | `rgba(60,48,24,.12)` | Rahmen, Trennlinien |
| `--ink` | `#1b1813` | dunkle Akzente (Tab-Unterstrich, aktive Sprache) |
| `--espresso` | `#2c2823` | dunkle Button-/Mic-Flächen |
| `--selbg` / `--selfg` | `#211d15` / `#fdf8ec` | Füllung/Text der dunklen Primär-Buttons |

**Signalfarben** (Funktion, nicht Deko — bleiben farbig):
| Bedeutung | Wert |
|---|---|
| richtig / Erfolg | `#34c759` (Text dunkler: `#1a9b46`) |
| falsch / Fehler | `#ff3b5c` |

---

## 3. Sprach-CI-Farben

Jede Sprache hat eine eigene Akzentfarbe (Top-Strich der Karten, gesuchte Form, Sprach-Kachel).

| Sprache | Code | Farbe |
|---|---|---|
| Deutsch | DE | `#ff3b5c` |
| Español | ES | `#ff9f0a` |
| English | EN | `#0a84ff` |
| Nederlands | NL | `#30c95a` |
| Français | FR | `#1b1813` |

Im Code als CSS-Variable `--lc` (language color) auf `.view`/Karten gesetzt.

---

## 4. Regenbogen (Marken-Signal)

**Sparsam einsetzen.** Zwei Ausprägungen:

```css
/* Dünner Strich / Kante — die gemeinsame CI-Klammer (Karten-Oberkante, Button-Rand) */
--brand-rainbow: linear-gradient(90deg,#ff5a4d,#ff9e2c,#ffcf3f,#5bbf6a,#3aa6c9,#5b8def,#a874e6);

/* Kräftiger Verlauf — NUR für Premium-/Geld-Flächen (Upgrade-Buttons o.ä.) */
--rb-deep: linear-gradient(90deg,#ff5a4d,#ff9e2c,#ffcf3f,#5bbf6a,#3aa6c9,#5b8def,#a874e6);
```

Regel: Regenbogen-**fläche** = Premium/Geld. Überall sonst nur der **dünne Strich** als Klammer.

---

## 5. Typografie

- **Schrift (Display + Body):** `"Schibsted Grotesk", system-ui, sans-serif`
  (Google Fonts: Schibsted Grotesk, Gewichte 400/600/700/800)
- Überschriften: 700, leicht negatives `letter-spacing` (`-.02em`), enge Zeilenhöhe (~1.15)
- Fließtext: 14–16px, Zeilenhöhe ~1.55, Farbe `--muted` bzw. `--text`

```html
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;600;700;800&display=swap" rel="stylesheet">
```

---

## 6. Flächen · Radius · Schatten

| Token | Wert | Einsatz |
|---|---|---|
| `--radius` | `22px` | Karten (Popups 24px) |
| Buttons / Pills | `12–14px` | Radius |
| `--shadow` | `0 22px 48px -26px rgba(70,55,25,.4)` | Karten, Popups |
| `--shadow-sm` | `0 6px 18px -12px rgba(70,55,25,.32)` | kleine Elemente |

Schatten sind **warm** (bräunlich), nicht kalt-grau.

---

## 7. Buttons (verbindlich — siehe auch `docs/ci-buttons.md`)

| Typ | Aussehen | Wann |
|---|---|---|
| **Primär** | dunkel (Ink/Espresso `#211d15`/`#2c2823`) + **dünne Regenbogen-Kante** + weicher Schatten, Text `--selfg` | normale Haupt-Aktion **ohne Geld** — „Konjugieren", „Verstanden", „Los geht's" |
| **Premium / Geld** | Regenbogen-**fläche** (`--rb-deep`) + weißer Text + `text-shadow` | bezahlpflichtig — „Premiumtarif holen", „Premium starten" |
| **Sekundär** | hell (`--surface`) + schlichter Rand `--border`, gedämpfter Text | Neben-/Ablehn-Aktion — „Später", „Erstmal weiter" |

**Auswahl-Zustände** (Plan, Niveau, Tarif): weiße Fläche + **dünner Regenbogen-Rand** — nie eine Einzelfarbe (kein Rot/Lila).

```css
/* Primär */
.btn-ink{ color:var(--selfg);
  background:linear-gradient(var(--selbg),var(--selbg)) padding-box, var(--brand-rainbow) border-box;
  border:1.5px solid transparent; border-radius:14px; box-shadow:0 10px 22px -10px rgba(30,22,8,.6); }
/* Premium */
.btn-rb{ color:#fff; border:0; background:var(--rb-deep); text-shadow:0 1px 2px rgba(0,0,0,.35); }
/* Sekundär */
.btn-ghost{ color:var(--muted); background:var(--surface); border:1px solid var(--border); }
```

---

## 8. Karten & Popups (Muster)

- Karte/Popup: `--surface`, Rahmen `--border`, Radius 22–24px, `--shadow`.
- **Oberkante = dünner Regenbogen-Strich** (4px) als CI-Klammer:
  `:before { height:4px; background:var(--brand-rainbow); }`
- Inhalt zentriert, Überschrift Ink, Text `--muted`, Aktion als Primär-Button.

Referenz-Implementierung: das „Kacheln frei anordnen"-Popup (`JourneyPop` / `ReorderDemo`).

---

## 9. Do & Don't

**Do**
- Sand + Ink als Grundgerüst, Regenbogen nur als Akzent.
- Sprach-CI-Farbe als feinen Akzent (Top-Strich, gesuchte Form).
- Warme Schatten, großzügige Radien, ruhige Abstände.

**Don't**
- ❌ Lila/Pink als Marken-/Flächenfarbe (`#a557ff`, `#e71583` etc. — abgelöst).
- ❌ Regenbogen großflächig außerhalb von Premium.
- ❌ Flammen-Icons, verspielte/Kinder-Emoji.
- ❌ kalte graue Schatten / reines Weiß `#fff` als Seiten-Hintergrund.

---

## 10. Zum Kopieren — `:root`-Token-Block (Landing & Blog)

```css
:root{
  /* Flächen & Text */
  --bg:#f4eede;
  --surface:#fffdf6;
  --surface-2:#ece3d0;
  --text:#211d15;
  --muted:#8b8068;
  --border:rgba(60,48,24,.12);
  --ink:#1b1813;
  --espresso:#2c2823;
  --selbg:#211d15;
  --selfg:#fdf8ec;

  /* Marke */
  --brand-rainbow:linear-gradient(90deg,#ff5a4d,#ff9e2c,#ffcf3f,#5bbf6a,#3aa6c9,#5b8def,#a874e6);
  --rb-deep:linear-gradient(90deg,#ff5a4d,#ff9e2c,#ffcf3f,#5bbf6a,#3aa6c9,#5b8def,#a874e6);

  /* Signal (Funktion) */
  --ok:#34c759;
  --bad:#ff3b5c;

  /* Form */
  --radius:22px;
  --shadow:0 22px 48px -26px rgba(70,55,25,.4);
  --shadow-sm:0 6px 18px -12px rgba(70,55,25,.32);

  /* Typo */
  --font-display:"Schibsted Grotesk", system-ui, sans-serif;
  --font-body:"Schibsted Grotesk", system-ui, sans-serif;
}
```

---

## Verwandte Dokumente
- `docs/ci-buttons.md` — Button-CI im Detail
- `docs/button-system.md`, `docs/popup-system.md` — Teilbereiche
- `.agents/blog-style.md` — Text-/SEO-Vorgaben fürs Bloggen (kein Visual-CI)
