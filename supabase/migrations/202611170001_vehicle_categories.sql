-- Category assignments are reviewed independently of the vehicle catalogue.
create table public.vehicle_categories (
  id text primary key,
  name text not null unique,
  requires_review boolean not null default false
);

insert into public.vehicle_categories (id, name, requires_review) values
  ('small_hatchback', 'Small hatchback', false),
  ('large_hatch_compact_sedan', 'Large hatchback / compact sedan', false),
  ('sedan', 'Sedan', false),
  ('compact_suv', 'Compact SUV / crossover', false),
  ('large_suv_mpv', 'Large SUV / MPV', false),
  ('needs_review', 'Needs review', true);

create table public.vehicle_models (
  id bigint generated always as identity primary key,
  make text not null,
  model text not null,
  category_id text not null default 'needs_review' references public.vehicle_categories(id),
  unique (make, model)
);

alter table public.vehicle_categories enable row level security;
alter table public.vehicle_models enable row level security;
create policy "Anyone can read vehicle categories" on public.vehicle_categories for select to anon, authenticated using (true);
create policy "Anyone can read vehicle models" on public.vehicle_models for select to anon, authenticated using (true);
create policy "Admins can update model categories" on public.vehicle_models for update to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
grant select on public.vehicle_categories, public.vehicle_models to anon, authenticated;
grant update (category_id) on public.vehicle_models to authenticated;
