-- Restrict worker reads to a purpose-built, minimal assignment listing.
drop policy if exists "Workers view assigned requests" on public.booking_requests;
create or replace function public.worker_assignments()
returns table (id uuid, vehicle_number text, vehicle_category text, parking_location text, preferred_date date, status text)
language sql stable security definer set search_path = '' as $$
  select b.id, b.vehicle_number, b.vehicle_category, b.parking_location, b.preferred_date, b.status
  from public.booking_requests b
  where b.assigned_worker_id = (select auth.uid())
    and b.status in ('confirmed','in_progress','completed')
    and exists (select 1 from public.workers w where w.user_id = (select auth.uid()) and w.active)
  order by b.preferred_date;
$$;
revoke all on function public.worker_assignments() from public, anon;
grant execute on function public.worker_assignments() to authenticated;

-- Validate assignment without granting the worker access to the full booking row.
create or replace function public.can_report_assigned_incident(job_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.booking_requests b join public.workers w on w.user_id = b.assigned_worker_id
    where b.id = job_id and b.assigned_worker_id = (select auth.uid()) and w.active
      and b.status in ('confirmed','in_progress'));
$$;
revoke all on function public.can_report_assigned_incident(uuid) from public, anon;
grant execute on function public.can_report_assigned_incident(uuid) to authenticated;
drop policy if exists "Workers can report issues for assigned jobs" on public.service_incidents;
create policy "Workers can report issues for assigned jobs" on public.service_incidents for insert to authenticated
with check (worker_id = (select auth.uid()) and status = 'open' and public.can_report_assigned_incident(booking_id));
