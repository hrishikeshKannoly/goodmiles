-- Initial customer booking foundation. Run in Supabase SQL Editor once.
create table if not exists public.apartments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.apartments enable row level security;
create policy "Authenticated users can view active apartments" on public.apartments for select to authenticated using (is_active = true);
grant select on public.apartments to authenticated;
