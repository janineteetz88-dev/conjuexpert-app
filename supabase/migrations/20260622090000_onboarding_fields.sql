-- Onboarding-/Trial-/Paywall-Feldmodell (Notion Dev-Spec §13)
-- Ergänzt public.profiles um die Felder für Pop-up-/Mail-Steuerung.
-- Idempotent (ADD COLUMN IF NOT EXISTS). NICHT automatisch angewendet —
-- Anwenden über Supabase (Migration/MCP) ist ein bewusster Ops-Schritt.
--
-- Vorhanden in public.profiles: id, native_lang (= Muttersprache), created_at
-- (= account_created_at), is_premium, premium_until, stripe_customer_id,
-- stripe_subscription_id.
--
-- Anonyme Nutzer haben KEINE profiles-Zeile — deren Zustand (trial_start,
-- premium_until, verb_count, quiz_rounds, home_screen_prompt_state) liegt am
-- Geräte-Token (localStorage), siehe docs/onboarding-popups.md.

alter table public.profiles
  add column if not exists plan text not null default 'free',            -- 'free' | 'premium' (anonym = client-seitig)
  add column if not exists onboarding_done boolean not null default false,
  add column if not exists ziel_lang text,                               -- Zielsprache (Erklärsprache = native_lang)
  add column if not exists niveau text,                                  -- Anfänger | Mittel | Fortgeschritten
  add column if not exists trial_start timestamptz,
  add column if not exists feedback_given boolean not null default false,
  add column if not exists welcome_code text,                            -- z. B. 'WILLKOMMEN'
  add column if not exists code_expires_at timestamptz,                  -- = premium_until (EINE Uhr, §3)
  add column if not exists review_prompt_shown boolean not null default false,
  add column if not exists home_screen_prompt_state text,               -- z. B. 'none' | 'shown' | 'added' | 'declined'
  add column if not exists free_quiz_rounds_today integer not null default 0,
  add column if not exists free_quiz_rounds_date date;                   -- für täglichen Reset (20/Tag)

comment on column public.profiles.plan is 'free | premium (anonym lebt client-seitig)';
comment on column public.profiles.code_expires_at is 'Spec §3: = premium_until (Code endet mit dem Test, kein zweiter Timer)';
comment on column public.profiles.free_quiz_rounds_today is 'Free-Stufe: Karteikarten-Quiz 20 Runden/Tag, Reset via free_quiz_rounds_date';
