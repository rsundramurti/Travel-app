-- Our Hanoi Journey: run once in Supabase → SQL Editor → New query → Run.
-- 1) The one shared login the password screen uses. Nothing to change here.
create table if not exists public.members (email text primary key);
insert into public.members(email) values ('board@our-hanoi-journey.app') on conflict do nothing;

-- 2) The board's data: one row per item, plus a daily safety copy.
create table if not exists public.docs (
  path text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text default (auth.jwt()->>'email')
);
create table if not exists public.backups (
  day date primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- 3) Only the two members can read or change anything.
create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where lower(email) = lower(auth.jwt()->>'email'))
$$;
alter table public.members enable row level security;
alter table public.docs enable row level security;
alter table public.backups enable row level security;
drop policy if exists "members only" on public.docs;
create policy "members only" on public.docs for all to authenticated using (public.is_member()) with check (public.is_member());
drop policy if exists "members only" on public.backups;
create policy "members only" on public.backups for all to authenticated using (public.is_member()) with check (public.is_member());

-- 4) Live updates between your phones.
alter publication supabase_realtime add table public.docs;

-- 5) Storage for photos you add (hotel covers, profile pictures).
insert into storage.buckets (id, name, public) values ('board', 'board', true) on conflict do nothing;
drop policy if exists "members upload" on storage.objects;
create policy "members upload" on storage.objects for insert to authenticated with check (bucket_id = 'board' and public.is_member());
drop policy if exists "members delete" on storage.objects;
create policy "members delete" on storage.objects for delete to authenticated using (bucket_id = 'board' and public.is_member());
