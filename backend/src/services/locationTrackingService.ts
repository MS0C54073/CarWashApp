/**
 * Location Tracking Service
 * 
 * Handles real-time location tracking for drivers and bookings
 * - Updates driver locations at controlled intervals
 * - Tracks booking-related location updates
 * - Provides role-based location access
 */

import { supabase } from '../config/supabase';
import { DBService } from './db-service';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationUpdate {
  userId: string;
  bookingId?: string;
  coordinates: LocationCoordinates;
  accuracy?: number;
  heading?: number;
  speed?: number;
  status: 'idle' | 'en_route' | 'at_pickup' | 'at_wash' | 'at_dropoff';
}

export interface DriverLocation {
  userId: string;
  name: string;
  coordinates: LocationCoordinates;
  lastUpdate: Date;
  status: string;
  currentBookingId?: string;
}

export interface BookingLocation {
  bookingId: string;
  pickupCoordinates: LocationCoordinates;
  driverLocation?: LocationCoordinates;
  carWashCoordinates?: LocationCoordinates;
  status: string;
  queuePosition?: number;
  estimatedWaitTime?: number;
}

export class LocationTrackingService {
  // Minimum interval between location updates (30 seconds)
  private static readonly MIN_UPDATE_INTERVAL = 30000;
  
  // Location cache to prevent excessive writes
  private static locationCache = new Map<string, { 
    coordinates: LocationCoordinates; 
    timestamp: number;
  }>();

  /**
   * Update driver location
   * Throttles updates to prevent excessive database writes
   */
  static async updateDriverLocation(update: LocationUpdate): Promise<void> {
    try {
      const cacheKey = `${update.userId}-${update.bookingId || 'idle'}`;
      const cached = this.locationCache.get(cacheKey);
      const now = Date.now();

      // Check if update is too frequent
      if (cached && (now - cached.timestamp) < this.MIN_UPDATE_INTERVAL) {
        // Update cache but don't write to DB yet
        this.locationCache.set(cacheKey, {
          coordinates: update.coordinates,
          timestamp: now,
        });
        return;
      }

      // Write to database
      const { error: trackingError } = await supabase
        .from('location_tracking')
        .insert({
          user_id: update.userId,
          booking_id: update.bookingId || null,
          coordinates: update.coordinates,
          accuracy: update.accuracy || null,
          heading: update.heading || null,
          speed: update.speed || null,
          status: update.status,
        });

      if (trackingError) {
        console.error('Error inserting location tracking:', trackingError);
        throw trackingError;
      }

      // Update user's last location and current booking
      const updateData: any = {
        last_location_update: new Date().toISOString(),
        location_coordinates: update.coordinates,
      };

      if (update.bookingId) {
        updateData.current_booking_id = update.bookingId;
      }

      const { error: userError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', update.userId);

      if (userError) {
        console.error('Error updating user location:', userError);
        throw userError;
      }

      // Update cache
      this.locationCache.set(cacheKey, {
        coordinates: update.coordinates,
        timestamp: now,
      });

      // Clean old cache entries (older than 5 minutes)
      this.cleanCache();
    } catch (error) {
      console.error('Error in updateDriverLocation:', error);
      throw error;
    }
  }

  /**
   * Get latest driver location
   */
  static async getDriverLocation(userId: string): Promise<LocationCoordinates | null> {
    try {
      // First check user's location_coordinates (most recent)
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('location_coordinates, last_location_update')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user location:', userError);
        return null;
      }

      if (user?.location_coordinates) {
        return user.location_coordinates as LocationCoordinates;
      }

      // Fallback to latest tracking entry
      const { data: tracking, error: trackingError } = await supabase
        .from('location_tracking')
        .select('coordinates')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (trackingError || !tracking) {
        return null;
      }

      return tracking.coordinates as LocationCoordinates;
    } catch (error) {
      console.error('Error in getDriverLocation:', error);
      return null;
    }
  }

  /**
   * Get all active driver locations (for admin/map view)
   */
  static async getActiveDriverLocations(): Promise<DriverLocation[]> {
    try {
      // Get drivers with recent location updates (within last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data: drivers, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          location_coordinates,
          last_location_update,
          current_booking_id,
          availability
        `)
        .eq('role', 'driver')
        .eq('is_active', true)
        .gte('last_location_update', fiveMinutesAgo)
        .not('location_coordinates', 'is', null);

      if (error) {
        console.error('Error fetching active drivers:', error);
        return [];
      }

      return (drivers || [])
        .filter((driver) => driver.location_coordinates)
        .map((driver) => ({
          userId: driver.id,
          name: driver.name,
          coordinates: driver.location_coordinates as LocationCoordinates,
          lastUpdate: new Date(driver.last_location_update),
          status: driver.availability ? 'available' : 'unavailable',
          currentBookingId: driver.current_booking_id || undefined,
        }));
    } catch (error) {
      console.error('Error in getActiveDriverLocations:', error);
      return [];
    }
  }

  /**
   * Get booking location data (role-based)
   */
  static async getBookingLocation(
    bookingId: string,
    requestingUserId: string,
    requestingUserRole: string
  ): Promise<BookingLocation | null> {
    try {
      // Get booking with proper relations
      const { supabase } = await import('../config/supabase');
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          client:users!bookings_client_id_fkey(id, name),
          driver:users!bookings_driver_id_fkey(id, name),
          car_wash:users!bookings_car_wash_id_fkey(id, name, location_coordinates)
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError || !bookingData) {
        return null;
      }

      const booking = bookingData;
      if (!booking) {
        return null;
      }

      // Role-based access control
      const clientId = booking.client_id || booking.client?.id;
      const driverId = booking.driver_id || booking.driver?.id;
      const carWashId = booking.car_wash_id || booking.car_wash?.id;

      if (requestingUserRole === 'client' && clientId !== requestingUserId) {
        throw new Error('Unauthorized: Cannot access this booking');
      }

      if (requestingUserRole === 'driver' && driverId !== requestingUserId) {
        throw new Error('Unauthorized: Cannot access this booking');
      }

      if (requestingUserRole === 'carwash' && carWashId !== requestingUserId) {
        throw new Error('Unauthorized: Cannot access this booking');
      }

      // Admin can access all bookings
      if (requestingUserRole !== 'admin' && 
          clientId !== requestingUserId && 
          driverId !== requestingUserId && 
          carWashId !== requestingUserId) {
        throw new Error('Unauthorized: Cannot access this booking');
      }

      const result: BookingLocation = {
        bookingId: booking.id,
        pickupCoordinates: booking.pickup_coordinates || { lat: 0, lng: 0 },
        status: booking.status,
        queuePosition: booking.queue_position || undefined,
        estimatedWaitTime: booking.estimated_wait_time || undefined,
      };

      // Get driver location if booking has a driver
      if (driverId) {
        const driverLocation = await this.getDriverLocation(driverId);
        if (driverLocation) {
          result.driverLocation = driverLocation;
        }
      }

      // Get car wash location from booking relation
      if (booking.car_wash?.location_coordinates) {
        result.carWashCoordinates = 
          typeof booking.car_wash.location_coordinates === 'string'
            ? JSON.parse(booking.car_wash.location_coordinates)
            : booking.car_wash.location_coordinates;
      }

      return result;
    } catch (error) {
      console.error('Error in getBookingLocation:', error);
      throw error;
    }
  }

  /**
   * Get location history for a booking
   */
  static async getBookingLocationHistory(
    bookingId: string,
    limit: number = 50
  ): Promise<Array<{ coordinates: LocationCoordinates; timestamp: Date; status: string }>> {
    try {
      const { data, error } = await supabase
        .from('location_tracking')
        .select('coordinates, timestamp, status')
        .eq('booking_id', bookingId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching location history:', error);
        return [];
      }

      return (data || []).map((entry) => ({
        coordinates: entry.coordinates as LocationCoordinates,
        timestamp: new Date(entry.timestamp),
        status: entry.status,
      }));
    } catch (error) {
      console.error('Error in getBookingLocationHistory:', error);
      return [];
    }
  }

  /**
   * Clean old cache entries
   */
  private static cleanCache(): void {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [key, value] of this.locationCache.entries()) {
      if (value.timestamp < fiveMinutesAgo) {
        this.locationCache.delete(key);
      }
    }
  }

  /**
   * Calculate queue position and estimated wait time
   */
  static async calculateQueueMetrics(
    carWashId: string,
    bookingId: string
  ): Promise<{ queuePosition: number; estimatedWaitTime: number }> {
    try {
      // Get all active bookings for this car wash
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, status, created_at, queue_position')
        .eq('car_wash_id', carWashId)
        .in('status', [
          'accepted',
          'picked_up',
          'at_wash',
          'waiting_bay',
          'washing_bay',
          'drying_bay',
        ])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error calculating queue metrics:', error);
        return { queuePosition: 0, estimatedWaitTime: 0 };
      }

      // Find position in queue
      const currentBookingIndex = bookings?.findIndex((b) => b.id === bookingId) ?? -1;
      const queuePosition = currentBookingIndex >= 0 ? currentBookingIndex + 1 : 0;

      // Estimate wait time (30 minutes per car, average)
      const averageServiceTime = 30; // minutes
      const estimatedWaitTime = queuePosition * averageServiceTime;

      // Update booking with queue metrics
      if (currentBookingIndex >= 0) {
        await supabase
          .from('bookings')
          .update({
            queue_position: queuePosition,
            estimated_wait_time: estimatedWaitTime,
          })
          .eq('id', bookingId);
      }

      return { queuePosition, estimatedWaitTime };
    } catch (error) {
      console.error('Error in calculateQueueMetrics:', error);
      return { queuePosition: 0, estimatedWaitTime: 0 };
    }
  }
}
