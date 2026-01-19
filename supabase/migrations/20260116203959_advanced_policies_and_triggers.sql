create policy "Admins full access profiles"
on profiles
for all
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Admins full access bookings"
on bookings
for all
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);


create policy "Drivers read assigned bookings"
on bookings
for select
using (driver_id = auth.uid());

create policy "Drivers update own bookings"
on bookings
for update
using (driver_id = auth.uid())
with check (driver_id = auth.uid());

create policy "Car wash read own bookings"
on bookings
for select
using (car_wash_id = auth.uid());

create policy "Car wash update wash stages"
on bookings
for update
using (car_wash_id = auth.uid())
with check (car_wash_id = auth.uid());

create policy "Clients create bookings"
on bookings
for insert
with check (client_id = auth.uid());

create policy "Clients cancel own bookings"
on bookings
for update
using (
  client_id = auth.uid()
  and status in ('created', 'accepted')
)
with check (client_id = auth.uid());

create policy "Clients create payment"
on payments
for insert
with check (
  booking_id in (
    select id from bookings where client_id = auth.uid()
  )
);

create policy "Payments readable by owner or admin"
on payments
for select
using (
  booking_id in (
    select id from bookings where client_id = auth.uid()
  )
  or exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create or replace function log_booking_status_change()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into booking_status_history (
      booking_id,
      status,
      changed_by
    ) values (
      new.id,
      new.status,
      auth.uid()
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger booking_status_audit
after update on bookings
for each row
execute function log_booking_status_change();

create or replace function validate_booking_status()
returns trigger as $$
begin
  if old.status = 'created' and new.status not in ('accepted', 'cancelled') then
    raise exception 'Invalid status transition';
  end if;

  if old.status = 'accepted' and new.status not in ('picked_up', 'cancelled') then
    raise exception 'Invalid status transition';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger booking_status_validation
before update on bookings
for each row
execute function validate_booking_status();
