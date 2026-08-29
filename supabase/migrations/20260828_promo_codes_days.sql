-- Wochen-genaue Laufzeit für Promo-Codes (z. B. "4 Wochen Premium" statt nur
-- ganzer Monate). Optionale Spalte, die in redeem-code Vorrang vor `months`
-- hat, wenn gesetzt — bestehende Codes (months-basiert, z. B. WILLKOMMEN)
-- bleiben unverändert funktionsfähig.

alter table promo_codes add column if not exists days integer;
