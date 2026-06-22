# ConjuExpert — Popup- & Modal-System

Kanonische Referenz für **alle Overlays in der App** (Dialoge, gebrandete Popups,
Bottom-Sheets). Ziel: eine einheitliche Design-Sprache, damit jedes neue Popup
ohne Nachdenken gleich aussieht und sich gleich verhält. Ergänzt
`docs/button-system.md` (Buttons) — hier geht es um **Container, Chrome & Verhalten**.

Stand: 2026-06-22. Status: erfasst aus dem Ist-Stand (`index.html`), verbindlich für Neues.

---

## Die drei Container-Typen

| Typ | Wann | Backdrop | Karte |
|---|---|---|---|
| **A · Zentrierter Dialog** | Standard für kurze Aktionen/Infos (Profil, Login, Hilfe, Konto gelöscht) | `.namegate` | `.namecard` |
| **B · Gebrandetes Popup** | Marken-Moment mit Eyecatcher (App-Icon pinnen) | `.namegate` | `.pinpop` (Rainbow-Topbar) |
| **C · Bottom-Sheet** | Längere/scrollbare Flows, von unten (Tarife, Paywall) | `.paywall-bg` / `.plansel-bg` | `.paywall-sheet` / `.plansel-sheet` |

Mehr braucht es nicht. **Kein vierter Sondertyp pro Feature** — eines der drei wählen.

---

## Gemeinsame Grundregeln (gelten für ALLE drei)

1. **Nur App-Tokens, nie hartkodierte Farben.** `var(--surface)`, `--surface-2`,
   `--text`, `--muted`, `--border`, `--shadow`, `--shadow-sm`, `--brand-pink`,
   `--font-display`. So passt sich jedes Popup automatisch an Hell-/Dunkel-/Mono-Theme
   an (`#approot[data-theme=…]`). Hartkodierte `#fff`/Hex nur für bewusste Effekte
   (Rainbow-Stops, Geräte-Mockup-Rahmen).
2. **Radius:** Karten/Sheets **26px** (Sheets oben 26px, unten 0). Pills/Badges 999px,
   Buttons 14–16px (siehe button-system.md).
3. **Schrift:** Überschriften `var(--font-display)`; Fließtext Standard-Body, `--muted`
   für Sub-/Hilfetext.
4. **Schließen:** Dialog/Popup → **rundes ×** oben rechts (`.namex` / `.pp-x`, 29–30px,
   `--surface-2`/`--muted`). Sheet → **Grab-Handle** oben mittig (`.paywall-grab`,
   40×4px, `--border`) + Backdrop-Klick.
5. **Backdrop-Klick schließt** (mit `stopPropagation` auf der Karte).
6. **Animation:** Dialog/Popup `fade .3s ease`; Sheet `sheet-rise` (von unten).
   Immer `@media (prefers-reduced-motion: reduce)` respektieren (Animationen aus).
7. **i18n PFLICHT:** Jeder sichtbare Text über `tr("…")` — **niemals** hartkodieren.
   (Regressions-Beispiel: die Tarif-Überschrift war als „Lerne ohne Limits" fest
   verdrahtet und blieb in allen Sprachen deutsch.) Neue Strings in **allen 5**
   Sprachen anlegen (de/en/es/nl/fr); Markennamen (iPhone, Android, ConjuExpert)
   bleiben sprachneutral.
8. **CTAs** nach `button-system.md`: App-Primär = Lila-Verlauf, Sekundär = Ghost,
   Rainbow nur für Angebote/Deals.

---

## Typ A — Zentrierter Dialog

- **Backdrop `.namegate`:** `position:absolute; inset:0; z-index:40; display:flex;
  align-items:center; justify-content:center; padding:24px;
  background:color-mix(in srgb, var(--bg) 88%, rgba(0,0,0,.35)); animation:fade .3s`.
- **Karte `.namecard`:** `max-width:340px; background:var(--surface); border:1px solid
  var(--border); border-radius:26px; box-shadow:var(--shadow); padding:30px 24px 22px;`
  zentriert (text-alignःcenter).
- **× `.namex`** oben rechts; **Überschrift `.namehead`** (`--font-display`, 23px),
  Sub `.namesub` (`--muted`).
- Nutzt von: NameGate (Profil), LoginModal, IOSHelpModal, AndroidHelpModal,
  AccountDeletedModal, Hint-Karten.

## Typ B — Gebrandetes Popup (`.pinpop`)

- Gleicher Backdrop (`.namegate`), eigene Karte `.pinpop`: `max-width:360px`,
  **4px Rainbow-Topbar** als `::before`
  (`#ff3b5c→#ff7a18→#ffc400→#34c759→#00bcd4→#0a84ff→#a557ff`) — dieselbe Marken-Signatur
  wie Appbar-Unterkante & Blog-Artikel. **Links-bündig** (nicht zentriert).
- × `.pp-x` (29px). Eyebrow in `--brand-pink` (`text-transform:uppercase`),
  „Conju" + `<b>`-Gradient „Expert".
- Einsatz: „App-Icon pinnen". Rainbow-Topbar nur für solche bewussten Marken-Momente,
  nicht für Standard-Dialoge.

## Typ C — Bottom-Sheet

- **Backdrop:** `position:absolute; inset:0; align-items:flex-end;`
  `background:rgba(14,16,24,.34);` höherer `z-index` (~910).
- **Sheet:** `background:var(--surface); border-radius:26px 26px 0 0;` volle Breite,
  `padding-bottom: calc(20px + env(safe-area-inset-bottom))`, `box-shadow` nach oben,
  Animation `sheet-rise`. **Grab-Handle** oben.
- Einsatz: Tarif-Auswahl (`plansel`), Paywall (`paywall`).

---

## Checkliste für ein neues Popup

- [ ] Passenden der **drei Typen** gewählt (kein neuer Sondertyp).
- [ ] Nur **App-Tokens** verwendet → Dark-Mode automatisch korrekt.
- [ ] Radius 26px, korrektes Schließen-Element (× bzw. Grab-Handle).
- [ ] `fade`/`sheet-rise` + `prefers-reduced-motion` berücksichtigt.
- [ ] **Alle Texte über `tr()`**, Keys in de/en/es/nl/fr ergänzt.
- [ ] CTAs nach `button-system.md`.
- [ ] Backdrop-Klick schließt; `stopPropagation` auf der Karte.
