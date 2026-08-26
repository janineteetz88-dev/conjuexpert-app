-- Kauf-Protokoll: jede Stripe-Webhook-Transaktion als Historie (für den
-- wöchentlichen Kaufstrecken-Check und "0-Verkäufe"-Alarm). Nur Service-Role
-- darf lesen/schreiben — RLS an, keine Policies für anon/authenticated.
-- (Am 26.08.2026 bereits live angewendet via Supabase MCP, Migration
-- "purchase_events_log"; diese Datei ist der Repo-Spiegel.)
create table if not exists public.purchase_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  event_type text not null,
  user_id uuid,
  stripe_customer_id text,
  stripe_subscription_id text
);

alter table public.purchase_events enable row level security;

create index if not exists purchase_events_created_at_idx
  on public.purchase_events (created_at desc);
