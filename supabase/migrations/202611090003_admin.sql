-- Admin membership is granted only by a trusted database administrator.
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
create policy "Users can read their own admin membership" on public.admin_users for select to authenticated using (user_id = (select auth.uid()));
grant select on public.admin_users to authenticated;
create policy "Admins can read booking requests" on public.booking_requests for select to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins can update booking requests" on public.booking_requests for update to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
grant update (status) on public.booking_requests to authenticated;
