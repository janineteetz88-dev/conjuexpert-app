-- Verhindert, dass ein Nutzer denselben Promo-Code mehrfach einlöst.
-- Ausgeführt vor dem Deployment der redeem-code Edge Function.
CREATE TABLE IF NOT EXISTS public.user_promo_redemptions (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_code  text        NOT NULL,
  redeemed_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT user_promo_redemptions_unique UNIQUE (user_id, promo_code)
);

ALTER TABLE public.user_promo_redemptions ENABLE ROW LEVEL SECURITY;

-- Tabelle ist nur für den Service-Role-Key (Edge Functions) erreichbar.
CREATE POLICY "no_direct_access" ON public.user_promo_redemptions
  FOR ALL USING (false);
