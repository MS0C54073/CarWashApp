alter table profiles enable row level security;
alter table vehicles enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table notifications enable row level security;

create policy "Users can view own profile"
on profiles
for select
using (id = auth.uid());

create policy "Clients manage own vehicles"
on vehicles
for all
using (client_id = auth.uid())
with check (client_id = auth.uid());

create policy "Clients view own bookings"
on bookings
for select
using (client_id = auth.uid());

create policy "Drivers view assigned bookings"
on bookings
for select
using (driver_id = auth.uid());

create policy "Clients view own payments"
on payments
for select
using (
  booking_id in (
    select id from bookings where client_id = auth.uid()
  )
);

create policy "Users read own notifications"
on notifications
for select
using (user_id = auth.uid());


