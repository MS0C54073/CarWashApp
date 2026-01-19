/**
 * Booking Repository
 * Handles all booking-related database operations
 */
import { BaseRepository } from './base.repository';
import { supabase } from '../config/supabase';
import { toCamelCase, toSnakeCase } from '../services/db-service';

export interface Booking {
  id: string;
  clientId: string | any;
  driverId?: string | any;
  carWashId: string | any;
  vehicleId: string | any;
  serviceId: string | any;
  status: string;
  bookingType: 'pickup_delivery' | 'drive_in';
  totalAmount: number;
  paymentStatus: string;
  pickupLocation?: string;
  pickupCoordinates?: any;
  scheduledPickupTime?: string;
  [key: string]: any;
}

export class BookingRepository extends BaseRepository<Booking> {
  protected tableName = 'bookings';
  protected primaryKey = 'id';

  /**
   * Find bookings with relations
   */
  async findAll(filters?: any): Promise<Booking[]> {
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        client:users!bookings_client_id_fkey(id, name, email, phone),
        driver:users!bookings_driver_id_fkey(id, name, phone, availability),
        car_wash:users!bookings_car_wash_id_fkey(id, name, car_wash_name, location),
        vehicle:vehicles(*),
        service:services(*)
      `);

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        query = query.eq(snakeKey, value);
      }
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find bookings: ${error.message}`);
    }

    const rawData = data || [];
    if (!Array.isArray(rawData)) {
      return [];
    }

    const results = toCamelCase(rawData) as Booking[];

    // Map relations to expected format
    return results.map((result: any) => {
      if (result.client) result.clientId = result.client;
      if (result.driver) result.driverId = result.driver;
      if (result.carWash) result.carWashId = result.carWash;
      if (result.vehicle) result.vehicleId = result.vehicle;
      if (result.service) result.serviceId = result.service;
      return result;
    });
  }

  /**
   * Find booking by ID with relations
   */
  async findById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        client:users!bookings_client_id_fkey(id, name, email, phone),
        driver:users!bookings_driver_id_fkey(id, name, phone, availability),
        car_wash:users!bookings_car_wash_id_fkey(id, name, car_wash_name, location),
        vehicle:vehicles(*),
        service:services(*)
      `)
      .eq(this.primaryKey, id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find booking by ID: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    const result = toCamelCase(data) as any;
    
    // Map relations
    if (result.client) result.clientId = result.client;
    if (result.driver) result.driverId = result.driver;
    if (result.carWash) result.carWashId = result.carWash;
    if (result.vehicle) result.vehicleId = result.vehicle;
    if (result.service) result.serviceId = result.service;

    return result as Booking;
  }
}
