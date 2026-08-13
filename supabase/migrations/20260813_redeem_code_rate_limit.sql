-- redeem-code verlangt zwar ein gültiges User-JWT (kein anonymer Zugriff),
-- hatte aber keinerlei Attempt-Counter, Cooldown oder Throttle: ein
-- authentifizierter Account konnte beliebig viele Codes in schneller Folge
-- durchprobieren, wodurch gültige Promo-/Beta-Codes per Brute-Force
-- erratbar waren (insbesondere kurze/einfache Codes).
--
-- Diese Migration protokolliert jeden Einlöseversuch pro Nutzer und
-- begrenzt atomar auf maximal N Versuche innerhalb eines Zeitfensters.
CREATE TABLE IF NOT EXISTS public.redeem_code_attempts (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempted_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS redeem_code_attempts_user_time_idx
  ON public.redeem_code_attempts (user_id, attempted_at);

ALTER TABLE public.redeem_code_attempts ENABLE ROW LEVEL SECURITY;

-- Tabelle ist nur für den Service-Role-Key (Edge Functions) erreichbar.
CREATE POLICY "no_direct_access" ON public.redeem_code_attempts
  FOR ALL USING (false);

-- Prüft atomar, ob der Nutzer innerhalb des Zeitfensters noch einen Versuch
-- frei hat, und protokolliert den Versuch sofort (vor der eigentlichen
-- Code-Prüfung) — so zählt jeder Aufruf als Versuch, unabhängig davon, ob
-- der Code gültig war, und lässt sich nicht durch paralleles Feuern
-- umgehen (Zeilen-Lock durch DELETE+INSERT in derselben Transaktion).
CREATE OR REPLACE FUNCTION public.check_and_record_redeem_attempt(
  p_user_id uuid,
  p_window_minutes int DEFAULT 15,
  p_max_attempts int DEFAULT 10
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_recent_count int;
BEGIN
  DELETE FROM public.redeem_code_attempts
  WHERE user_id = p_user_id
    AND attempted_at < now() - (p_window_minutes || ' minutes')::interval;

  SELECT count(*) INTO v_recent_count
  FROM public.redeem_code_attempts
  WHERE user_id = p_user_id;

  IF v_recent_count >= p_max_attempts THEN
    RETURN false;
  END IF;

  INSERT INTO public.redeem_code_attempts (user_id) VALUES (p_user_id);
  RETURN true;
END;
$$;

-- Nur der Service-Role-Key (Edge Functions) darf diese Funktion aufrufen.
REVOKE EXECUTE ON FUNCTION public.check_and_record_redeem_attempt(uuid, int, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_and_record_redeem_attempt(uuid, int, int) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_and_record_redeem_attempt(uuid, int, int) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_record_redeem_attempt(uuid, int, int) TO service_role;
