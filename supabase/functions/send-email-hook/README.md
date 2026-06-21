# send-email-hook

Supabase **Send-Email-Auth-Hook**: rendert die ConjuExpert-CI-Templates
mehrsprachig (je `user_metadata.lang`) und verschickt sie über **Resend**.
Ersetzt damit den Supabase-Standard-Mailer für alle Auth-Mails (Bestätigung,
Magic-Link, Passwort-Reset).

Inhalt/CI bewusst synchron zu `emails/build-supabase-emails.mjs` halten.

## Aktivierung (einmalig)

Nach dem Deploy ist die Function **inert**, bis der Hook aktiviert ist. Schritte,
die nur im Dashboard / bei Resend gehen (kann ich via MCP nicht selbst):

1. **Resend vorbereiten**
   - Account anlegen, Domain `conjuexpert.app` verifizieren (DNS).
   - API-Key erzeugen → `RESEND_API_KEY`.
   - Absender muss zur verifizierten Domain passen (Default `hello@conjuexpert.app`).

2. **Function-Secrets setzen** (Supabase → Edge Functions → send-email-hook → Secrets):
   - `RESEND_API_KEY` = dein Resend-Key
   - `EMAIL_FROM` = `ConjuExpert <hello@conjuexpert.app>` (optional)
   - `SEND_EMAIL_HOOK_SECRET` = der in Schritt 3 generierte Secret

3. **Hook aktivieren** (Supabase → Authentication → Hooks → „Send Email"):
   - Typ HTTPS, URL der Function:
     `https://lrhmyboevoxtlvoxnrny.functions.supabase.co/send-email-hook`
   - Den dort generierten Secret (`v1,whsec_…`) als `SEND_EMAIL_HOOK_SECRET`
     in die Function-Secrets eintragen (Schritt 2).

4. **Sprache** kommt aus `user_metadata.lang` (wird beim `signUp` in der Web-App
   gesetzt). Fällt auf `de` zurück, wenn nicht gesetzt/ unsupported.

## Test

Nach Aktivierung: in der App registrieren → die Bestätigungsmail kommt in CI
über Resend in der UI-Sprache. Logs: Supabase → Edge Functions → send-email-hook.

## Deploy

Via Supabase MCP bereits deployt. Erneut deployen z. B. mit:
`supabase functions deploy send-email-hook --no-verify-jwt`
(verify_jwt = false, da der Hook sich per Webhook-Signatur selbst absichert).
