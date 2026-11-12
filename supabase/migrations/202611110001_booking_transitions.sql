-- Keep administrative booking changes consistent with the service workflow.
create function public.validate_booking_admin_transition() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.admin_users where user_id = auth.uid())
     and not (coalesce(old.assigned_worker_id = auth.uid(), false) and (
       (old.status = 'confirmed' and new.status = 'in_progress') or
       (old.status = 'in_progress' and new.status = 'completed')
     )) then
    if new.status is distinct from old.status and not (
      (old.status = 'requested' and new.status in ('confirmed', 'cancelled')) or
      (old.status = 'confirmed' and new.status = 'cancelled')
    ) then
      raise exception 'Invalid administrative status transition';
    end if;
    if new.assigned_worker_id is distinct from old.assigned_worker_id
       and old.status not in ('requested', 'confirmed') then
      raise exception 'Assignment cannot be changed for this visit';
    end if;
    if new.status = 'confirmed' and (new.assigned_worker_id is null or not exists (
      select 1 from public.workers where user_id = new.assigned_worker_id and active
    )) then
      raise exception 'An active worker is required for confirmation';
    end if;
  end if;
  return new;
end $$;
create trigger validate_booking_admin_transition
before update on public.booking_requests
for each row execute function public.validate_booking_admin_transition();
