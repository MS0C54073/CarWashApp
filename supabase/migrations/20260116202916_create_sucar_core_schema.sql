-- User roles
create type user_role as enum (
  'admin',
  'client',
  'driver',
  'car_wash'
);

-- Booking lifecycle status
create type booking_status as enum (
  'created',
  'accepted',
  'picked_up',
  'delivered_to_wash',
  'waiting_bay',
  'washing_bay',
  'drying_bay',
  'done',
  'delivered_to_client',
  'cancelled'
);

-- Payment status
create type payment_status as enum (
  'pending',
  'paid',
  'failed'
);
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  role user_role not null,
  created_at timestamptz default now()
);
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  make text not null,
  model text not null,
  plate_number text not null unique,
  color text,
  created_at timestamptz default now()
);
create table drivers (
  id uuid primary key references profiles(id) on delete cascade,
  license_number text not null,
  license_expiry date not null,
  availability boolean default true,
  created_at timestamptz default now()
);
create table car_washes (
  id uuid primary key references profiles(id) on delete cascade,
  name text not null,
  location text not null,
  washing_bays integer not null,
  created_at timestamptz default now()
);
create table services (
  id uuid primary key default gen_random_uuid(),
  car_wash_id uuid not null references car_washes(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  approved boolean default false,
  created_at timestamptz default now()
);
create table bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id),
  vehicle_id uuid not null references vehicles(id),
  driver_id uuid references drivers(id),
  car_wash_id uuid not null references car_washes(id),
  service_id uuid not null references services(id),
  pickup_location text not null,
  status booking_status default 'created',
  created_at timestamptz default now()
);
create table booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  status booking_status not null,
  changed_by uuid references profiles(id),
  changed_at timestamptz default now()
);
create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  amount numeric(10,2) not null,
  status payment_status default 'pending',
  method text,
  paid_at timestamptz
);
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);
