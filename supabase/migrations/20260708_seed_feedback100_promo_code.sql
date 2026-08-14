-- Beta-Launch-Kampagne "Wir suchen 100" (Notion: Beta-Code "Feedback100" sicher
-- umsetzen). Janine-Entscheidung 05.07.2026: 30 Tage Premium gratis, Cap 100
-- Einlösungen, Ablauf 8 Wochen nach Aktivierung.
-- Serverseitig angelegt (kein Hardcoding im Client) — Lehre aus dem früheren
-- LIA100-Vorfall (öffentlich abrufbarer Code im Frontend-Bundle).
--
-- active=false: Code ist vollständig eingerichtet, aber bewusst noch
-- deaktiviert — "Nichts geht live ohne Janines Freigabe" (Copy-Freigabe
-- steht laut Kampagnen-Doc noch aus). Vor dem Marketing-Launch manuell auf
-- active=true setzen; expires_at (8 Wochen) dann bei Bedarf ab dem echten
-- Aktivierungsdatum neu setzen.
INSERT INTO public.promo_codes (code, months, active, max_uses, current_uses, expires_at)
VALUES ('FEEDBACK100', 1, false, 100, 0, now() + interval '8 weeks')
ON CONFLICT (code) DO NOTHING;
