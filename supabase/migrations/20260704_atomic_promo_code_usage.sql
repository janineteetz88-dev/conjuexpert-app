-- Schließt eine Race-Condition (Read-then-Write / TOCTOU) beim Einlösen von
-- Promo-Codes: die redeem-code Edge Function las bisher current_uses per
-- SELECT, prüfte gegen max_uses im Anwendungscode und schrieb den neuen Wert
-- separat zurück. Zwei parallele Redemptions kurz vor Erreichen von max_uses
-- konnten so beide die Prüfung bestehen und den Code öfter einlösen, als
-- max_uses erlaubt.
--
-- Diese Funktion führt Prüfung + Inkrement als einzelnes atomares
-- UPDATE ... WHERE ... RETURNING aus. Postgres sperrt die betroffene Zeile
-- für die Dauer des Updates, sodass eine zweite parallele Anfrage erst
-- nach dem Commit der ersten liest — die WHERE-Bedingung sieht dann bereits
-- den erhöhten Zählerstand.
CREATE OR REPLACE FUNCTION public.increment_promo_code_usage(p_code text)
RETURNS SETOF public.promo_codes
LANGUAGE sql
AS $$
  UPDATE public.promo_codes
  SET current_uses = current_uses + 1,
      active = (max_uses IS NULL OR current_uses + 1 < max_uses)
  WHERE code = p_code
    AND (max_uses IS NULL OR current_uses < max_uses)
  RETURNING *;
$$;

-- Nur der Service-Role-Key (Edge Functions) darf diese Funktion aufrufen —
-- sonst könnte jeder eingeloggte Nutzer über die auto-generierte RPC-Route
-- Zähler beliebiger Codes hochzählen, ohne die übrige Redeem-Logik zu
-- durchlaufen.
REVOKE EXECUTE ON FUNCTION public.increment_promo_code_usage(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_promo_code_usage(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_promo_code_usage(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_promo_code_usage(text) TO service_role;
