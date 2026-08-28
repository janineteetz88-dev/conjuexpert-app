-- Terminbuchungen für Sprachschulen-Kennenlerngespräche (20 Min., Di–Do 11:00–12:30).
-- Öffentlich erreichbar über die book-school-call Edge Function (verify_jwt = false);
-- die Tabelle selbst bleibt ohne RLS-Policies, also nur per Service-Role beschreibbar/lesbar.

create table if not exists school_call_bookings (
  id uuid primary key default gen_random_uuid(),
  school_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  slot_date date not null,
  slot_time time not null,
  interested_model text,
  message text,
  created_at timestamptz not null default now(),
  -- verhindert, dass zwei Schulen denselben Slot doppelt buchen
  unique (slot_date, slot_time)
);

alter table school_call_bookings enable row level security;
