-- [KRITISCH] public.get_lifecycle_cron_secret() und public.lifecycle_due(stage)
-- sind SECURITY DEFINER und waren über die auto-generierte PostgREST-RPC-Route
-- für anon UND authenticated ausführbar (per Supabase Advisor gemeldet, live mit
-- dem öffentlichen Anon-Key reproduziert):
--
--   - get_lifecycle_cron_secret() gibt das Cron-Secret der Lifecycle-Mailstrecke
--     im Klartext zurück -> jeder konnte send-lifecycle-emails auf beliebig
--     hoher Frequenz auslösen (Spam/Reputationsrisiko, Resend-Kostenmissbrauch),
--     weil der x-cron-secret-Check dadurch wirkungslos wurde.
--   - lifecycle_due(stage) liefert bei Treffern Klardaten (E-Mail, Vorname,
--     Sprache, unsubscribe_token) realer Nutzer ohne jede Authentifizierung
--     (PII-Exposure) und erlaubt zusätzlich, beliebige Nutzer über den
--     geleakten unsubscribe_token ungefragt abzumelden.
--
-- Fix: EXECUTE nur noch für service_role (Edge-Function-Kontext) -- analog zum
-- bereits bestehenden Muster in 20260704_atomic_promo_code_usage.sql.
--
-- WICHTIG (separat, außerhalb dieser Migration): das aktuelle
-- lifecycle_cron_secret in Supabase Vault muss als kompromittiert gelten und
-- von Janine rotiert werden -- diese Migration schließt nur den
-- Zugriffsweg, ersetzt aber nicht den bereits potenziell geleakten Wert.

REVOKE EXECUTE ON FUNCTION public.get_lifecycle_cron_secret() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_lifecycle_cron_secret() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_lifecycle_cron_secret() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_lifecycle_cron_secret() TO service_role;

REVOKE EXECUTE ON FUNCTION public.lifecycle_due(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.lifecycle_due(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.lifecycle_due(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.lifecycle_due(text) TO service_role;
