# Supabase-Auth-Mails (ConjuExpert-CI)

CI-gebrandete Vorlagen für die transaktionalen Auth-Mails. Generiert mit
`node emails/build-supabase-emails.mjs` → bitte **nicht** die HTML-Dateien von
Hand ändern, sondern den Generator anpassen und neu bauen.

## Einbauen (Dashboard)

Supabase → **Authentication → Emails** → jeweiliges Template:

| Datei | Dashboard-Template | Betreff (separat eintragen) |
|---|---|---|
| `confirm-signup.html` | Confirm signup | „Bestätige deine E-Mail – ConjuExpert" |
| `magic-link.html` | Magic Link | „Dein Login-Link – ConjuExpert" |
| `reset-password.html` | Reset Password | „Passwort zurücksetzen – ConjuExpert" |

Pro Template: HTML-Inhalt einfügen + den Betreff aus dem `<!-- Subject … -->`
-Kommentar oben in der Datei in das Subject-Feld kopieren.

## Variablen

Es werden die Supabase-Go-Variablen verwendet und **wörtlich** im Template
gelassen (Supabase füllt sie zur Sendezeit):
`{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .SiteURL }}`, `{{ .Email }}`.

## Mehrsprachigkeit (wichtig)

Das Supabase-Dashboard erlaubt **nur ein Template pro Typ** — also faktisch
**eine** Sprache. Für den Start: die **`de/`**-Vorlagen einfügen.

Die Ordner `en/ es/ nl/ fr/` liegen schon bereit. Für echte
Mehrsprachigkeit (Mail in der Sprache des Users) braucht es später den
**„Send Email"-Auth-Hook** (Edge Function), die je nach `user_metadata.lang`
das passende Template wählt. Das ist der gleiche Mechanismus, über den auch
die spätere Resend-Drip-Strecke laufen würde.

## Absender / Domain

Für eigene CI-Mails sollte ein eigener Absender mit verifizierter Domain
gesetzt sein (Supabase → Project Settings → Auth → SMTP, oder via Resend-SMTP).
Standard-Supabase-SMTP hat enge Sendelimits und nutzt eine fremde Absender-Domain.
