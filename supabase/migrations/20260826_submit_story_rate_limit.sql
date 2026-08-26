-- submit-story hatte gar keine Auth-Prüfung im Code (nur Feldgrenzen) und
-- war ausschließlich durch das inzwischen kaputte "verify_jwt: true"-Gateway-
-- Gate geschützt. Die Funktion muss aber auch anonyme Trial-Gäste ohne Login
-- bedienen (hasPaidAccess() prüft zuerst den lokalen Trial-Timer, erst danach
-- supaUser), daher kein user_id-Rate-Limit wie bei redeem_code_attempts
-- möglich — hier wird stattdessen nach Client-IP begrenzt.
--
-- Risiko war nicht nur DB-Müll: texte_stories ist ein geteilter Cache
-- (libFetch() spielt jede Themen/Level/Sprache-Kombination an alle Nutzer
-- aus), ein offener Endpunkt hätte also beliebigen Text als "KI-generierte
-- Lerngeschichte" an echte Nutzer ausspielen können.
CREATE TABLE IF NOT EXISTS public.submit_story_attempts (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ip           text        NOT NULL,
  attempted_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS submit_story_attempts_ip_time_idx
  ON public.submit_story_attempts (ip, attempted_at);

ALTER TABLE public.submit_story_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "no_direct_access" ON public.submit_story_attempts
  FOR ALL USING (false);

-- Grenze bewusst großzügiger als bei redeem_code_attempts: das ist keine
-- Errate-Attacke, sondern normale Feature-Nutzung, die auch über ein
-- gemeinsames NAT (Schule/Firma/Mobilfunk) laufen kann.
CREATE OR REPLACE FUNCTION public.check_and_record_story_attempt(
  p_ip text,
  p_window_minutes int DEFAULT 60,
  p_max_attempts int DEFAULT 20
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_recent_count int;
BEGIN
  DELETE FROM public.submit_story_attempts
  WHERE ip = p_ip
    AND attempted_at < now() - (p_window_minutes || ' minutes')::interval;

  SELECT count(*) INTO v_recent_count
  FROM public.submit_story_attempts
  WHERE ip = p_ip;

  IF v_recent_count >= p_max_attempts THEN
    RETURN false;
  END IF;

  INSERT INTO public.submit_story_attempts (ip) VALUES (p_ip);
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_and_record_story_attempt(text, int, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_and_record_story_attempt(text, int, int) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_and_record_story_attempt(text, int, int) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_record_story_attempt(text, int, int) TO service_role;
