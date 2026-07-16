-- Tracking-Spalten für die 5-€-Code-Mailstrecke (WILLKOMMEN):
--   code_mail0_sent  → Tag-0-Mail „Hier ist dein Code" (direkt nach Feedback) verschickt
--   code_mail3_sent  → Erinnerung „nur noch X Tage" verschickt
--   code_mail7_sent  → letzte Erinnerung „verfällt heute" verschickt
alter table public.profiles
  add column if not exists code_mail0_sent boolean not null default false,
  add column if not exists code_mail3_sent boolean not null default false,
  add column if not exists code_mail7_sent boolean not null default false;
