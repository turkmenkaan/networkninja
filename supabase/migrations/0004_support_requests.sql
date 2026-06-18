-- Phase 1: site-wide support requests ("Support" link in the footer, on every
-- page). Run in the Supabase SQL editor, or via `supabase db push` with the CLI.

create table if not exists public.support_requests (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,                     -- fixed slug (see support/categories.ts)
  description text not null,
  email       text not null,                     -- required: how we reply
  page_path   text,                              -- the page the reader was on
  user_id     uuid references auth.users(id),    -- attached when the sender is signed in
  created_at  timestamptz not null default now()
);

-- Keep requests private: enable RLS and add NO policies, so anon/publishable
-- access is denied. Only the secret key (used server-side in /api/support) can
-- read or write, because it bypasses RLS.
alter table public.support_requests enable row level security;

create index if not exists support_requests_created_at_idx on public.support_requests (created_at desc);
