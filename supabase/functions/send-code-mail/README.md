# send-code-mail

5-€-Gutschein-Mailstrecke (Code **WILLKOMMEN**).

## Modi
- **Tag 0** (aus der App, mit User-JWT): `POST { }` → schickt „Hier ist dein Code" an den
  eingeloggten Nutzer, sofern `feedback_given=true`, `welcome_code` gesetzt, `is_premium=false`
  und noch nicht verschickt (`code_mail0_sent`). Wird in `app.js` direkt nach dem Feedback aufgerufen.
- **Cron** (Header `x-cron-secret`): scannt `profiles` und schickt
  - **Tag 3**: „nur noch X Tage" (wenn 1 < Resttage ≤ 4 und `code_mail3_sent=false`)
  - **Tag 7**: „verfällt heute" (wenn Resttage ≤ 1 und `code_mail7_sent=false`)
  Abonnenten (`is_premium=true`) und abgelaufene Codes werden übersprungen.

## Deploy
```bash
supabase db push                       # Migration 20260716_code_mail_tracking.sql
supabase functions deploy send-code-mail
supabase secrets set CRON_SECRET="$(openssl rand -hex 24)"
# RESEND_API_KEY / EMAIL_FROM sind bereits gesetzt (send-email-hook nutzt sie).
```

## Cron einrichten (täglich, z. B. 09:00 UTC)
Erfordert `pg_cron` + `pg_net`. Im SQL-Editor ausführen (SERVICE_ROLE_KEY & CRON_SECRET einsetzen):
```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule('code-mail-reminders','0 9 * * *', $$
  select net.http_post(
    url:='https://lrhmyboevoxtlvoxnrny.supabase.co/functions/v1/send-code-mail',
    headers:=jsonb_build_object(
      'Content-Type','application/json',
      'x-cron-secret','<CRON_SECRET>',
      'Authorization','Bearer <SERVICE_ROLE_KEY>'),
    body:='{}'::jsonb);
$$);
```
Testlauf: denselben `net.http_post` einmal manuell ausführen und `get_logs` (edge-function) prüfen.
