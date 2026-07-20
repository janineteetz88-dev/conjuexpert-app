# Reel-Generator (ConjuExpert)

Verb rein → fertiges **9:16-Reel** raus. On-brand, mit leuchtendem Regenbogen-Rahmen,
echtem App-Screen und animierter Auflösung. Wiederverwendbar für den täglichen
„Verb des Tages" — und später von der Social-Automation fütterbar.

## Struktur
- `template.html` — animiertes Reel-Layout (11s-Timeline). Liest eine Config aus
  `window.__REEL`; die Felder oben in `DEFAULT` sind der „Generator-Seam".
- `render.cjs` — nimmt das Template **deterministisch** Frame für Frame auf
  (Web-Animations-API, kein Timing-Drift) und baut per ffmpeg ein H.264-MP4.
- `reels/<name>.json` — eine Reel-Config: `{ id, pillar, reel:{…}, caption, hashtags }`.
- `assets/` — Fonts (Space/Schibsted Grotesk, JetBrains Mono) + gecapturte App-Screens.

## Rendern
```bash
node render.cjs                     # Default (aufstehen)
node render.cjs reels/aufstehen.json
```
Ergebnis: `<id>.mp4` (1080×1920, 30 fps).

## Neues Reel bauen
1. Echten App-Screen zum Verb ziehen (Konjugation/Quiz) → als PNG nach `assets/`.
2. `reels/<verb>.json` anlegen (Felder wie `aufstehen.json`), `bImg` auf das PNG zeigen.
3. `node render.cjs reels/<verb>.json` → MP4 prüfen → freigeben → posten.

## Voraussetzungen
- `playwright` (Chromium) und `ffmpeg` im PATH. Lokal vorhanden; in CI im Setup
  installieren (`apt-get install -y ffmpeg`, `npx playwright install --with-deps chromium`).

## CI-Anbindung (später)
Der Generator kann von der Social-Automation aufgerufen werden: pro geplantem
„Verb des Tages" ein Config-JSON rendern, das MP4 als Media hochladen und via
Blotato einplanen — siehe `../README.md` (social-content).
