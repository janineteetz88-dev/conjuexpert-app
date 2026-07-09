# Social-Automation (ConjuExpert)

Automatische Einplanung von Social-Posts über **Blotato** — zeitgesteuert per GitHub
Action, unabhängig von einer laufenden Claude-Session oder dem MCP-Connector.

## Wie es funktioniert

1. **Inhalte** liegen als Bilder im öffentlichen Repo unter `social-assets/…` und
   werden per `raw.githubusercontent.com`-URL geladen (öffentlich abrufbar → Blotato
   kann sie serverseitig holen).
2. **Kalender**: `social-content/manifest.json` listet alle geplanten Posts
   (Plattform, Konto, Zeit, Bilder, Caption).
3. **Runner**: `.github/workflows/social-scheduler.yml` startet täglich (Cron) und
   führt `scripts/social/blotato-schedule.mjs` aus. Das Skript plant jeden Post ein,
   dessen Zeit in den nächsten 3 Tagen liegt und der noch nicht im Ledger steht.
4. **Ledger**: `social-content/scheduled.json` merkt sich eingeplante Posts
   (Blotato-`postSubmissionId`), damit nichts doppelt gepostet wird. Der Runner
   committet Aktualisierungen selbst zurück.

## Einmalige Einrichtung (nur diese 2 Schritte)

1. **Blotato-API-Key als Secret hinterlegen** (nur Janine — Secret gehört zu dir):
   - Blotato → *Settings → API → Generate API Key* (der **neue, rotierte** Key).
   - GitHub → Repo **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `BLOTATO_API_KEY` — Wert: der Key.
   - ⚠️ Den Key **nirgends** in Code, Chat oder Dateien schreiben — nur ins Secret.
2. **Diesen Branch nach `main` mergen** (nur Janine — Freigabe-Gate). Geplante
   Cron-Läufe starten erst vom Default-Branch.

## Neuen Post hinzufügen

- Bilder/Video nach `social-assets/<kampagne>/` committen.
- Eintrag in `manifest.json → posts` ergänzen (`id`, `platform`, `accountId`,
  `scheduledTime` ISO 8601 mit Offset, `mediaBaseUrl`, `media`, `caption`).
- Fertig — der nächste Runner-Lauf plant ihn zur richtigen Zeit ein.

## Konten (Blotato)

| Plattform  | Handle               | accountId |
|------------|----------------------|-----------|
| Instagram  | @conjuexpert.app     | 57778     |
| TikTok     | @jane.von.conjuexpe  | 50129     |
| YouTube    | ConjuExpert App      | 42799     |

## Manuell testen

Actions-Tab → *Social Scheduler (Blotato)* → **Run workflow** → `dry_run = 1`
(zeigt nur an, was eingeplant würde, ohne zu senden).

## Hinweis zur API-Struktur

Das Skript nutzt `POST https://backend.blotato.com/v2/posts` mit Header
`blotato-api-key` und Body `{ post: { accountId, target, content }, scheduledTime }`.
Beim ersten echten Lauf gegen die API einmal per `dry_run` bzw. Actions-Log prüfen,
ob Blotato den Body akzeptiert; Feldnamen ggf. an die aktuelle Blotato-Doku angleichen
(`content.mediaUrls`, `target.targetType`).
