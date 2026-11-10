create table public.workers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  active boolean not null default true
);
alter table public.workers enable row level security;
create policy "Workers see their own profile" on public.workers for select to authenticated using (user_id = (select auth.uid()));
create policy "Admins see workers" on public.workers for select to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
grant select on public.workers to authenticated;
alter table public.booking_requests add column assigned_worker_id uuid references public.workers(user_id);
alter table public.booking_requests add column service_started_at timestamptz;
alter table public.booking_requests add column service_completed_at timestamptz;
alter table public.booking_requests add column service_checklist jsonb;
alter table public.booking_requests drop constraint booking_requests_status_check;
alter table public.booking_requests add constraint booking_requests_status_check check (status in ('requested','confirmed','in_progress','completed','cancelled'));
create policy "Workers view assigned requests" on public.booking_requests for select to authenticated using (assigned_worker_id = (select auth.uid()) and exists (select 1 from public.workers where user_id = (select auth.uid()) and active));
grant update (assigned_worker_id) on public.booking_requests to authenticated;
create function public.start_assigned_service(request_id uuid) returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.booking_requests set status = 'in_progress', service_started_at = now()
  where id = request_id and assigned_worker_id = auth.uid() and status = 'confirmed' and exists (select 1 from public.workers where user_id = auth.uid() and active);
  if not found then raise exception 'Service cannot be started'; end if;
end $$;
create function public.complete_assigned_service(request_id uuid, checklist jsonb) returns void language plpgsql security definer set search_path = '' as $$
begin
  if checklist <> '{"inspection":true,"exterior":true,"interior":true,"final_check":true}'::jsonb then raise exception 'Complete the checklist'; end if;
  update public.booking_requests set status = 'completed', service_completed_at = now(), service_checklist = checklist
  where id = request_id and assigned_worker_id = auth.uid() and status = 'in_progress' and exists (select 1 from public.workers where user_id = auth.uid() and active);
  if not found then raise exception 'Service cannot be completed'; end if;
end $$;
revoke all on function public.start_assigned_service(uuid) from public, anon;
revoke all on function public.complete_assigned_service(uuid,jsonb) from public, anon;
grant execute on function public.start_assigned_service(uuid) to authenticated;
grant execute on function public.complete_assigned_service(uuid,jsonb) to authenticated;
