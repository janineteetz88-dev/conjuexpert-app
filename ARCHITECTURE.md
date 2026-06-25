# ConjuExpert — Architektur & Betrieb

Kurzüberblick, damit jede(r) (auch ein externer Entwickler) die App versteht,
sicher ändern kann und nichts versehentlich kaputt macht.

**Live:** https://conjuexpert.app — Verben in 5 Sprachen konjugieren, Quiz, Vokabeln, Offline-PWA.

---

## 1. Wie die App technisch aufgebaut ist

Es ist eine **statische Website** (keine Server-App). React wird per CDN geladen,
es gibt **kein Framework-Build** (kein Vite/Webpack). Die komplette App steckt in
**einer einzigen, selbst-enthaltenen Datei: `app.js`**.

```
index.html      → Shell: <head> (SEO/Meta), gesamtes CSS (inline <style>), lädt /app.js
app.js          → DIE App: React-UI + Konjugations-Engine + alle Übersetzungen (5 Sprachen)
sw.js           → Service Worker (Offline-Cache, PWA)
manifest.webmanifest, robots.txt, sitemap.xml, llms.txt, CNAME
konjugation/    → 568 statische Verb-Seiten (SEO) — vorgerendertes HTML
blog/           → Blog-Artikel (SEO) — vorgerendertes HTML
supabase/       → Backend: Edge Functions (Stripe, Konten, E-Mail)
scripts/        → Generatoren für die statischen Seiten (siehe unten)
```

---

## 2. ⚠️ WICHTIGSTE REGEL: `app.js` ist die einzige Quelle

- **Die laufende App = `app.js`.** Änderungen an der App werden **direkt in `app.js`** gemacht.
- **`npm run build:app` NICHT ausführen.** Dieser Build ist eine Altlast. Früher hat er
  eine zweite (unvollständige) App-Kopie in `index.html` eingebettet. Diese Inline-Kopie
  **kollidierte mit `app.js`** (doppelte Deklaration `__TwkCheck`) und führte dazu, dass die
  Seite beim Frischladen **leer blieb**. Die Inline-Kopie wurde entfernt; der Build ist
  abgesichert und überspringt sich selbst.
- **`src/blocks/app.jsx` ist eine unvollständige Altlast** (ohne Übersetzungen/Engine) und
  wird **zur Laufzeit nicht benutzt**. Nicht damit arbeiten, nicht damit verwechseln.
- **CSS** lebt ausschließlich in `index.html` im `<style>`-Block (nicht in `app.js`).
- `app.js` ist im „transpilierten" Stil geschrieben (`React.createElement(...)` statt JSX) —
  lesbar, aber gewöhnungsbedürftig. Vor dem Bearbeiten die Stelle genau suchen.

**Nach einem Release:** Cache-Versionen hochzählen, damit Nutzer die neue Version bekommen:
- in `index.html` den Query-Parameter von `app.js?v=…` erhöhen
- in `sw.js` die Konstante `CACHE = "conjuexpert-vNN"` erhöhen

---

## 3. SEO-/Inhalts-Seiten (statisch, gut für Google & KI-Suche)

Diese Seiten sind **echtes vorgerendertes HTML** (kein JS nötig) — deshalb gut crawlbar.

| Inhalt | Pfad | Generator |
|---|---|---|
| Verb-Konjugationen | `konjugation/<sprache>/<verb>/` | `scripts/generate-verb-pages.mjs` |
| Konjugations-Hubs | `konjugation/…` | `scripts/build-konjugation-hubs.mjs` |
| Blog-Artikel | `blog/<slug>/` | `scripts/publish-from-notion.mjs`, `scripts/notion-to-html.mjs` |
| Sitemap | `sitemap.xml` | wird beim Generieren aktualisiert |

`robots.txt` erlaubt bewusst auch KI-Crawler (GPTBot, ClaudeBot, PerplexityBot …),
`llms.txt` beschreibt die App für KI-Suchmaschinen.

---

## 4. Backend (Supabase)

- **Projekt:** `lrhmyboevoxtlvoxnrny`, Region **eu-central-1 (Frankfurt, DSGVO)**, Postgres 17.
- **Edge Functions** in `supabase/functions/`:
  - `create-checkout-session` — Stripe-Checkout starten
  - `stripe-webhook` — Stripe-Events verarbeiten (Premium freischalten)
  - `cancel-subscription` — Abo kündigen
  - `redeem-code` — Promo-/Rabattcodes einlösen
  - `delete-account` — Konto + Daten löschen
- **Geheimnisse liegen NICHT im Code**, sondern als Supabase-Umgebungsvariablen:
  `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_ANNUAL_BONUS`,
  `RESEND_API_KEY`, `EMAIL_FROM`, `SEND_EMAIL_HOOK_SECRET`.
- Client-seitig sichtbar sind nur die **anon**-Keys (Absicht; durch Row Level Security geschützt).

---

## 5. Deployment

- **GitHub Pages** liefert das Repository-Root direkt aus; **Cloudflare** steht als CDN davor
  (Domain via `CNAME` = `conjuexpert.app`).
- **Es gibt keinen App-Build in der CI.** Ein Push auf `main` = Deploy.
- Wenn Änderungen nicht erscheinen: ggf. **Cloudflare-Cache leeren** (Workflow `purge-cloudflare`)
  und Cache-Versionen (Abschnitt 2) hochzählen.

---

## 6. Lokal ausprobieren

```bash
# einfacher statischer Server im Repo-Root:
python3 -m http.server 8099
# dann http://127.0.0.1:8099/ öffnen
```
Hinweis: Konten/Premium/Übersetzungs-Beispiele brauchen Internet (Supabase/Stripe).

---

## 7. Fallstricke (kurz)

- ❌ `npm run build:app` ausführen → kann `index.html` beschädigen. Nicht tun.
- ❌ `src/blocks/app.jsx` für die echte App halten — ist Altlast.
- ✅ App-Logik/Markup → `app.js`; Styles → `index.html <style>`.
- ✅ Nach Release: `app.js?v=…` (index.html) **und** `CACHE` (sw.js) hochzählen.
- ✅ Verb-/Blog-Seiten nie von Hand editieren → über die Generatoren in `scripts/`.
