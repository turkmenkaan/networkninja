-- Progress sync for authenticated users (one row per user + unit).
-- Anonymous learners keep their progress in localStorage; this table holds only
-- signed-in users' progress so it can follow them across devices.

create table if not exists public.progress (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  unit_id    text        not null,
  complete   boolean     not null default false,
  objectives jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, unit_id)
);

alter table public.progress enable row level security;

-- Every policy is scoped to the row's owner: the authenticated browser client
-- can read and write ONLY its own rows. No service role / API route needed.
create policy "progress_select_own"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "progress_insert_own"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "progress_update_own"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "progress_delete_own"
  on public.progress for delete
  using (auth.uid() = user_id);
