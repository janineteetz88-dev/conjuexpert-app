-- Die Edge Function "transcribe" leitete Audiodateien unauthentifiziert an
-- OpenAI Whisper weiter: verify_jwt=true schützte hier nicht wirksam, da der
-- öffentliche Supabase-Anon-/Publishable-Key selbst ein gültiges JWT ist.
-- Jeder Inhaber des öffentlichen Keys konnte die Function beliebig oft
-- aufrufen und Kosten gegen den OpenAI-Account des Betreibers verursachen.
--
-- Diese Migration ergänzt (zusammen mit dem Auth-Check + Dateigrößenlimit in
-- supabase/functions/transcribe/index.ts) einen Attempt-Counter pro
-- eingeloggtem Nutzer, der atomar auf maximal N Aufrufe innerhalb eines
-- Zeitfensters begrenzt — nach demselben Muster wie
-- check_and_record_redeem_attempt (20260813_redeem_code_rate_limit.sql).
CREATE TABLE IF NOT EXISTS public.transcribe_attempts (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempted_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS transcribe_attempts_user_time_idx
  ON public.transcribe_attempts (user_id, attempted_at);

ALTER TABLE public.transcribe_attempts ENABLE ROW LEVEL SECURITY;

-- Tabelle ist nur für den Service-Role-Key (Edge Functions) erreichbar.
CREATE POLICY "no_direct_access" ON public.transcribe_attempts
  FOR ALL USING (false);

-- Prüft atomar, ob der Nutzer innerhalb des Zeitfensters noch einen Versuch
-- frei hat, und protokolliert den Versuch sofort (vor dem eigentlichen
-- OpenAI-Call) — so zählt jeder Aufruf als Versuch und lässt sich nicht
-- durch paralleles Feuern umgehen (Zeilen-Lock durch DELETE+INSERT in
-- derselben Transaktion).
CREATE OR REPLACE FUNCTION public.check_and_record_transcribe_attempt(
  p_user_id uuid,
  p_window_minutes int DEFAULT 10,
  p_max_attempts int DEFAULT 20
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_recent_count int;
BEGIN
  DELETE FROM public.transcribe_attempts
  WHERE user_id = p_user_id
    AND attempted_at < now() - (p_window_minutes || ' minutes')::interval;

  SELECT count(*) INTO v_recent_count
  FROM public.transcribe_attempts
  WHERE user_id = p_user_id;

  IF v_recent_count >= p_max_attempts THEN
    RETURN false;
  END IF;

  INSERT INTO public.transcribe_attempts (user_id) VALUES (p_user_id);
  RETURN true;
END;
$$;

-- Nur der Service-Role-Key (Edge Functions) darf diese Funktion aufrufen.
REVOKE EXECUTE ON FUNCTION public.check_and_record_transcribe_attempt(uuid, int, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_and_record_transcribe_attempt(uuid, int, int) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_and_record_transcribe_attempt(uuid, int, int) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_record_transcribe_attempt(uuid, int, int) TO service_role;
