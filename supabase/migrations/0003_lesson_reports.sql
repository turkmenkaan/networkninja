-- Phase 1: per-unit issue reports ("Report an issue" on a lesson/lab page).
-- Run in the Supabase SQL editor, or via `supabase db push` with the CLI.

create table if not exists public.lesson_reports (
  id          uuid primary key default gen_random_uuid(),
  unit_id     text not null,
  unit_title  text,
  unit_type   text,                              -- 'lesson' | 'lab'
  category    text not null,                     -- fixed slug (see reports/categories.ts)
  description text not null,
  email       text,                              -- optional reporter email
  user_id     uuid references auth.users(id),    -- attached when the reporter is signed in
  created_at  timestamptz not null default now()
);

-- Keep reports private: enable RLS and add NO policies, so anon/publishable
-- access is denied. Only the secret key (used server-side in /api/report-issue)
-- can read or write, because it bypasses RLS.
alter table public.lesson_reports enable row level security;

create index if not exists lesson_reports_unit_id_idx on public.lesson_reports (unit_id);
create index if not exists lesson_reports_created_at_idx on public.lesson_reports (created_at desc);
