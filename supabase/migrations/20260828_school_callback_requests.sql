-- Rückruf-Anfragen von Sprachschulen (kein fester Slot, nur Wunsch-Wochentag —
-- die Bestätigung des genauen Zeitpunkts läuft manuell per Rückruf/Mail).
-- Öffentlich erreichbar über die request-school-callback Edge Function
-- (verify_jwt = false); die Tabelle selbst bleibt ohne RLS-Policies, also nur
-- per Service-Role beschreibbar/lesbar.

create table if not exists school_callback_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  preferred_day text not null check (preferred_day in ('Dienstag', 'Donnerstag')),
  created_at timestamptz not null default now()
);

alter table school_callback_requests enable row level security;
