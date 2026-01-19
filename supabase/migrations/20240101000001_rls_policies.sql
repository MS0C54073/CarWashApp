-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text OR auth.role() = 'service_role');

-- Vehicles policies
CREATE POLICY "Clients can view their own vehicles"
  ON vehicles FOR SELECT
  USING (
    client_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Clients can create their own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (
    client_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Clients can update their own vehicles"
  ON vehicles FOR UPDATE
  USING (
    client_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Clients can delete their own vehicles"
  ON vehicles FOR DELETE
  USING (
    client_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
    OR auth.role() = 'service_role'
  );

-- Services policies
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (is_active = true OR auth.role() = 'service_role');

CREATE POLICY "Car wash can manage their services"
  ON services FOR ALL
  USING (
    car_wash_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text AND role = 'carwash')
    OR auth.role() = 'service_role'
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (
    client_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
    OR driver_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
    OR car_wash_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Clients can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    client_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Authorized users can update bookings"
  ON bookings FOR UPDATE
  USING (
    client_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
    OR driver_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
    OR car_wash_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
    OR auth.role() = 'service_role'
  );

-- Payments policies
CREATE POLICY "Users can view payments for their bookings"
  ON payments FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE
        client_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
        OR driver_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
        OR car_wash_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
    )
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Authorized users can create payments"
  ON payments FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE
        client_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
        OR auth.role() = 'service_role'
    )
  );

CREATE POLICY "Authorized users can update payments"
  ON payments FOR UPDATE
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE
        client_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
        OR car_wash_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
        OR auth.role() = 'service_role'
    )
  );
