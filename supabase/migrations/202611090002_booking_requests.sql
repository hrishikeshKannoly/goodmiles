-- Customer booking requests. A request is not a confirmed appointment or subscription.
create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  apartment_id uuid not null references public.apartments(id),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (char_length(phone) between 8 and 20),
  vehicle_number text not null check (char_length(vehicle_number) between 4 and 20),
  vehicle_category text not null check (vehicle_category in ('Hatchback','Sedan','SUV')),
  parking_location text not null check (char_length(parking_location) between 1 and 120),
  preferred_date date not null check (preferred_date >= current_date),
  status text not null default 'requested' check (status in ('requested','confirmed','cancelled')),
  created_at timestamptz not null default now()
);
alter table public.booking_requests enable row level security;
create policy "Customers can create their own requests" on public.booking_requests for insert to authenticated with check (customer_id = (select auth.uid()) and status = 'requested' and exists (select 1 from public.apartments where id = apartment_id and is_active));
create policy "Customers can view their own requests" on public.booking_requests for select to authenticated using (customer_id = (select auth.uid()));
grant select, insert on public.booking_requests to authenticated;
