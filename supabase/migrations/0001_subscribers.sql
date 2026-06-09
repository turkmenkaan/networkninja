-- Phase 1: email subscribers ("notify me of new lessons/labs").
-- Run in the Supabase SQL editor, or via `supabase db push` with the CLI.

create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text,
  created_at timestamptz not null default now()
);

-- Keep the list private: enable RLS and add NO policies, so anon/publishable
-- access is denied. Only the secret key (used server-side in /api/subscribe)
-- can read or write, because it bypasses RLS.
alter table public.subscribers enable row level security;
