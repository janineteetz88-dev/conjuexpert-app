-- Härtung (Supabase Advisor WARN function_search_path_mutable):
-- fester leerer search_path für increment_promo_code_usage — die Funktion
-- qualifiziert alle Objekte bereits vollständig (public.promo_codes),
-- daher keine Verhaltensänderung, nur Schutz vor search_path-Hijacking.
ALTER FUNCTION public.increment_promo_code_usage(text) SET search_path = '';
