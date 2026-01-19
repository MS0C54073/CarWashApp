import { supabase } from '../config/supabase';
import { DBService } from './db-service';

export interface QueueEntry {
  id: string;
  carWashId: string;
  bookingId: string;
  position: number;
  estimatedStartTime: Date | null;
  estimatedCompletionTime: Date | null;
  serviceDurationMinutes: number;
  status: 'waiting' | 'in_progress' | 'completed';
}

export class QueueService {
  // Add booking to queue
  static async addToQueue(
    carWashId: string,
    bookingId: string,
    serviceDurationMinutes: number = 30
  ) {
    // Get current max position for this car wash
    const { data: maxPosition } = await supabase
      .from('car_wash_queue')
      .select('position')
      .eq('car_wash_id', carWashId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const nextPosition = (maxPosition?.position || 0) + 1;

    // Calculate estimated times
    const now = new Date();
    const { data: activeBookings } = await supabase
      .from('car_wash_queue')
      .select('service_duration_minutes')
      .eq('car_wash_id', carWashId)
      .in('status', ['waiting', 'in_progress'])
      .order('position', { ascending: true });

    let totalWaitMinutes = 0;
    if (activeBookings) {
      totalWaitMinutes = activeBookings.reduce(
        (sum, entry) => sum + (entry.service_duration_minutes || 30),
        0
      );
    }

    const estimatedStartTime = new Date(now.getTime() + totalWaitMinutes * 60000);
    const estimatedCompletionTime = new Date(
      estimatedStartTime.getTime() + serviceDurationMinutes * 60000
    );

    const { data, error } = await supabase
      .from('car_wash_queue')
      .insert({
        car_wash_id: carWashId,
        booking_id: bookingId,
        position: nextPosition,
        estimated_start_time: estimatedStartTime.toISOString(),
        estimated_completion_time: estimatedCompletionTime.toISOString(),
        service_duration_minutes: serviceDurationMinutes,
        status: 'waiting',
      })
      .select()
      .single();

    if (error) throw error;

    // Update booking with queue info
    await DBService.updateBooking(bookingId, {
      queuePosition: nextPosition,
      estimatedWaitTime: totalWaitMinutes,
    });

    return data;
  }

  // Get queue for a car wash
  static async getQueue(carWashId: string) {
    const { data, error } = await supabase
      .from('car_wash_queue')
      .select(`
        *,
        booking:bookings(
          id,
          status,
          vehicle:vehicles(*),
          client:users!bookings_client_id_fkey(id, name, phone)
        )
      `)
      .eq('car_wash_id', carWashId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Get queue position for a booking
  static async getBookingQueuePosition(bookingId: string) {
    const { data, error } = await supabase
      .from('car_wash_queue')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  // Start service (move from waiting to in_progress)
  static async startService(queueId: string) {
    const { data, error } = await supabase
      .from('car_wash_queue')
      .update({ status: 'in_progress' })
      .eq('id', queueId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Complete service
  static async completeService(queueId: string) {
    const { data, error } = await supabase
      .from('car_wash_queue')
      .update({ status: 'completed' })
      .eq('id', queueId)
      .select()
      .single();

    if (error) throw error;

    // Update queue positions - this is handled by the database trigger

    return data;
  }

  // Update service duration
  static async updateServiceDuration(
    queueId: string,
    durationMinutes: number
  ) {
    const queueEntry = await supabase
      .from('car_wash_queue')
      .select('*')
      .eq('id', queueId)
      .single();

    if (queueEntry.error) throw queueEntry.error;

    const estimatedCompletionTime = new Date(
      new Date(queueEntry.data.estimated_start_time).getTime() +
        durationMinutes * 60000
    );

    const { data, error } = await supabase
      .from('car_wash_queue')
      .update({
        service_duration_minutes: durationMinutes,
        estimated_completion_time: estimatedCompletionTime.toISOString(),
      })
      .eq('id', queueId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Calculate wait time for a position
  static async calculateWaitTime(carWashId: string, position: number) {
    const { data, error } = await supabase
      .from('car_wash_queue')
      .select('service_duration_minutes')
      .eq('car_wash_id', carWashId)
      .lt('position', position)
      .in('status', ['waiting', 'in_progress'])
      .order('position', { ascending: true });

    if (error) throw error;

    const waitMinutes = (data || []).reduce(
      (sum, entry) => sum + (entry.service_duration_minutes || 30),
      0
    );

    return waitMinutes;
  }
}
