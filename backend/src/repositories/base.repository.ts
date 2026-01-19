/**
 * Base Repository Interface
 * Defines common CRUD operations for all repositories
 */
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: any): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: any): Promise<number>;
}

/**
 * Base Repository Implementation
 * Provides common CRUD operations using Supabase
 */
import { supabase } from '../config/supabase';
import { toCamelCase, toSnakeCase } from '../services/db-service';

export abstract class BaseRepository<T> implements IRepository<T> {
  protected abstract tableName: string;
  protected abstract primaryKey: string;

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq(this.primaryKey, id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find ${this.tableName} by ID: ${error.message}`);
    }

    return data ? (toCamelCase(data) as T) : null;
  }

  /**
   * Find all entities with optional filters
   */
  async findAll(filters?: any): Promise<T[]> {
    let query = supabase.from(this.tableName).select('*');

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        const snakeKey = toSnakeCase({ [key]: value });
        const actualKey = Object.keys(snakeKey)[0];
        query = query.eq(actualKey, value);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find ${this.tableName}: ${error.message}`);
    }

    return (toCamelCase(data || []) as T[]);
  }

  /**
   * Create new entity
   */
  async create(data: Partial<T>): Promise<T> {
    const snakeData = toSnakeCase(data);
    const { data: created, error } = await supabase
      .from(this.tableName)
      .insert(snakeData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
    }

    return toCamelCase(created) as T;
  }

  /**
   * Update entity
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    const snakeData = toSnakeCase(data);
    const { data: updated, error } = await supabase
      .from(this.tableName)
      .update(snakeData)
      .eq(this.primaryKey, id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
    }

    return updated ? (toCamelCase(updated) as T) : null;
  }

  /**
   * Delete entity (soft delete by setting isActive to false)
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ is_active: false })
      .eq(this.primaryKey, id);

    if (error) {
      throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
    }

    return true;
  }

  /**
   * Count entities with optional filters
   */
  async count(filters?: any): Promise<number> {
    let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true });

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        const snakeKey = toSnakeCase({ [key]: value });
        const actualKey = Object.keys(snakeKey)[0];
        query = query.eq(actualKey, value);
      }
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count ${this.tableName}: ${error.message}`);
    }

    return count || 0;
  }
}
