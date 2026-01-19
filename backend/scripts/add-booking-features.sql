-- Add booking_type column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20) DEFAULT 'pickup_delivery' 
CHECK (booking_type IN ('pickup_delivery', 'drive_in'));

-- Add queue_position and estimated_wait_time to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS queue_position INTEGER,
ADD COLUMN IF NOT EXISTS estimated_wait_time INTEGER; -- in minutes

-- Create messages table for chat system
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Create car_wash_queue table for managing queues
CREATE TABLE IF NOT EXISTS car_wash_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_wash_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  estimated_start_time TIMESTAMP WITH TIME ZONE,
  estimated_completion_time TIMESTAMP WITH TIME ZONE,
  service_duration_minutes INTEGER DEFAULT 30,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(car_wash_id, booking_id)
);

-- Create indexes for queue
CREATE INDEX IF NOT EXISTS idx_queue_car_wash_id ON car_wash_queue(car_wash_id);
CREATE INDEX IF NOT EXISTS idx_queue_booking_id ON car_wash_queue(booking_id);
CREATE INDEX IF NOT EXISTS idx_queue_position ON car_wash_queue(car_wash_id, position);

-- Create function to update queue positions
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- When a booking is removed or completed, update positions
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status = 'completed') THEN
    UPDATE car_wash_queue
    SET position = position - 1
    WHERE car_wash_id = COALESCE(OLD.car_wash_id, NEW.car_wash_id)
      AND position > COALESCE(OLD.position, NEW.position);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for queue position updates
DROP TRIGGER IF EXISTS trigger_update_queue_positions ON car_wash_queue;
CREATE TRIGGER trigger_update_queue_positions
  AFTER DELETE OR UPDATE OF status ON car_wash_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_queue_positions();

-- Add RLS policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their bookings"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = messages.booking_id
        AND (bookings.client_id = auth.uid() 
             OR bookings.driver_id = auth.uid()
             OR bookings.car_wash_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages for their bookings"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = messages.booking_id
        AND (bookings.client_id = auth.uid() 
             OR bookings.driver_id = auth.uid()
             OR bookings.car_wash_id = auth.uid())
    )
    AND sender_id = auth.uid()
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Add RLS policies for car_wash_queue
ALTER TABLE car_wash_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Car wash can manage their queue"
  ON car_wash_queue FOR ALL
  USING (car_wash_id = auth.uid());

CREATE POLICY "Clients can view queue for their bookings"
  ON car_wash_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = car_wash_queue.booking_id
        AND bookings.client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all queues"
  ON car_wash_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );
