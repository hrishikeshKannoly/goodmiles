create table public.customer_profiles (
  customer_id uuid primary key references auth.users(id) on delete cascade,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (char_length(phone) between 8 and 20),
  vehicle_number text not null check (char_length(vehicle_number) between 4 and 20),
  vehicle_category text not null check (vehicle_category in ('Hatchback', 'Sedan', 'SUV')),
  vehicle_make text not null check (char_length(vehicle_make) between 1 and 80),
  vehicle_model text not null check (char_length(vehicle_model) between 1 and 80)
);
alter table public.customer_profiles enable row level security;
create policy "Customers view their profile" on public.customer_profiles for select to authenticated using (customer_id = (select auth.uid()));
create policy "Customers create their profile" on public.customer_profiles for insert to authenticated with check (customer_id = (select auth.uid()));
create policy "Customers update their profile" on public.customer_profiles for update to authenticated using (customer_id = (select auth.uid())) with check (customer_id = (select auth.uid()));
grant select, insert, update on public.customer_profiles to authenticated;
