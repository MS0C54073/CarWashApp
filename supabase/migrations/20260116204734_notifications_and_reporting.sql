create or replace function notify_booking_status()
returns trigger as $$
declare
  client uuid;
  driver uuid;
begin
  select client_id, driver_id
  into client, driver
  from bookings
  where id = new.id;

  -- Notify client
  insert into notifications (user_id, message)
  values (
    client,
    'Booking ' || new.id || ' status changed to ' || new.status
  );

  -- Notify driver if assigned
  if driver is not null then
    insert into notifications (user_id, message)
    values (
      driver,
      'Booking ' || new.id || ' updated to ' || new.status
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger booking_status_notifications
after update on bookings
for each row
when (old.status is distinct from new.status)
execute function notify_booking_status();

create or replace function validate_booking_status()
returns trigger as $$
begin
  case old.status
    when 'created' then
      if new.status not in ('accepted', 'cancelled') then
        raise exception 'Invalid transition from created';
      end if;

    when 'accepted' then
      if new.status not in ('picked_up', 'cancelled') then
        raise exception 'Invalid transition from accepted';
      end if;

    when 'picked_up' then
      if new.status != 'delivered_to_wash' then
        raise exception 'Invalid transition from picked_up';
      end if;

    when 'delivered_to_wash' then
      if new.status != 'waiting_bay' then
        raise exception 'Invalid transition from delivered_to_wash';
      end if;

    when 'waiting_bay' then
      if new.status != 'washing_bay' then
        raise exception 'Invalid transition from waiting_bay';
      end if;

    when 'washing_bay' then
      if new.status != 'drying_bay' then
        raise exception 'Invalid transition from washing_bay';
      end if;

    when 'drying_bay' then
      if new.status != 'done' then
        raise exception 'Invalid transition from drying_bay';
      end if;

    when 'done' then
      if new.status != 'delivered_to_client' then
        raise exception 'Invalid transition from done';
      end if;

    else
      raise exception 'Invalid booking status';
  end case;

  return new;
end;
$$ language plpgsql;

create view daily_revenue as
select
  date(paid_at) as day,
  sum(amount) as total_revenue
from payments
where status = 'paid'
group by day;

create view driver_performance as
select
  d.id as driver_id,
  count(b.id) as completed_jobs
from drivers d
join bookings b on b.driver_id = d.id
where b.status = 'delivered_to_client'
group by d.id;
