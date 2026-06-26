# ConjuExpert

Verben in 5 Sprachen (Deutsch, Englisch, Spanisch, Niederländisch, Französisch)
konjugieren, üben und lernen. Statische PWA + Supabase-Backend.

**Live:** https://conjuexpert.app

## Für Entwickler

👉 **Lies zuerst [`ARCHITECTURE.md`](./ARCHITECTURE.md)** — dort steht, wie die App
aufgebaut ist und (wichtig) **welche Datei die echte Quelle ist** und was man
*nicht* tun sollte.

Das Wichtigste in einem Satz: **Die laufende App ist `app.js` — direkt dort
bearbeiten, CSS in `index.html`, und `npm run build:app` NICHT ausführen.**

## Design / CI

🎨 **[`docs/ci.md`](./docs/ci.md)** — das verbindliche CI-/Design-System: Farben,
Typografie, Buttons, Regenbogen-Regel & ein fertiger `:root`-Token-Block zum
Übertragen auf **Landingpage und Blog-Artikel**. Spiegelt den aktuellen App-Look.

## Lokal starten

```bash
python3 -m http.server 8099   # dann http://127.0.0.1:8099/
```
