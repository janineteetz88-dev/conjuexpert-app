-- Promo-Codes hatten bisher kein Ablaufdatum — nur `active` (manueller Schalter)
-- und `max_uses`/`current_uses` (Mengenlimit). Für zeitlich befristete Aktionen
-- (z.B. "Feedback100", Ablauf 8 Wochen nach Aktivierung) fehlte ein
-- automatisches Ablaufdatum.
ALTER TABLE public.promo_codes
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;
