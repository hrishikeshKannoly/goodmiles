create table public.service_incidents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.booking_requests(id),
  worker_id uuid not null references public.workers(user_id),
  category text not null check (category in ('Existing damage','Unsafe contamination','Customer unavailable','Vehicle inaccessible','Equipment problem','Accidental damage','Other')),
  notes text not null check (char_length(trim(notes)) between 3 and 2000),
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);
alter table public.service_incidents enable row level security;
create policy "Workers can report issues for assigned jobs" on public.service_incidents for insert to authenticated with check (worker_id = (select auth.uid()) and status = 'open' and exists (select 1 from public.booking_requests b where b.id = booking_id and b.assigned_worker_id = (select auth.uid()) and b.status in ('confirmed','in_progress')) and exists (select 1 from public.workers w where w.user_id = (select auth.uid()) and w.active));
create policy "Workers see their own incidents" on public.service_incidents for select to authenticated using (worker_id = (select auth.uid()));
create policy "Admins see incidents" on public.service_incidents for select to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admins update incidents" on public.service_incidents for update to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
grant select, insert on public.service_incidents to authenticated;
grant update (status) on public.service_incidents to authenticated;
