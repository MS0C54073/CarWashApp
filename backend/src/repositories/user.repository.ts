/**
 * User Repository
 * Handles all user-related database operations
 */
import { BaseRepository } from './base.repository';
import { supabase } from '../config/supabase';
import { toCamelCase, toSnakeCase } from '../services/db-service';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  nrc: string;
  role: 'client' | 'driver' | 'carwash' | 'admin';
  isActive: boolean;
  isSuspended?: boolean;
  [key: string]: any;
}

export class UserRepository extends BaseRepository<User> {
  protected tableName = 'users';
  protected primaryKey = 'id';

  /**
   * Find user by email (case-insensitive)
   */
  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Try exact match first
    let { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    // If not found, try lowercase
    if (!data && (error?.code === 'PGRST116' || !error)) {
      const { data: data2, error: error2 } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();
      
      if (data2) {
        data = data2;
        error = error2;
      }
    }
    
    // If still not found, do case-insensitive search
    if (!data) {
      const { data: allUsers, error: allError } = await supabase
        .from(this.tableName)
        .select('*')
        .limit(1000);
      
      if (!allError && allUsers) {
        const user = allUsers.find((u: any) => 
          u.email && u.email.toLowerCase().trim() === normalizedEmail
        );
        
        if (user) {
          return toCamelCase(user) as User;
        }
      }
    }
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
    
    return data ? (toCamelCase(data) as User) : null;
  }

  /**
   * Find user by NRC
   */
  async findByNrc(nrc: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('nrc', nrc)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find user by NRC: ${error.message}`);
    }

    return data ? (toCamelCase(data) as User) : null;
  }

  /**
   * Create user with password hashing
   */
  async create(data: Partial<User>): Promise<User> {
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    return super.create(data);
  }

  /**
   * Compare password
   */
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get users by role
   */
  async findByRole(role: string): Promise<User[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find users by role: ${error.message}`);
    }

    return (toCamelCase(data || []) as User[]);
  }

  /**
   * Get available drivers
   */
  async getAvailableDrivers(): Promise<User[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('role', 'driver')
      .eq('is_active', true)
      .eq('availability', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get available drivers: ${error.message}`);
    }

    return (toCamelCase(data || []) as User[]);
  }

  /**
   * Get all car washes
   */
  async getCarWashes(): Promise<User[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('role', 'carwash')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get car washes: ${error.message}`);
    }

    return (toCamelCase(data || []) as User[]);
  }
}
