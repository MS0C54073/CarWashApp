import { supabase } from '../config/supabase';

// Helper to convert Supabase row to camelCase
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    const camelObj: any = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelObj[camelKey] = toCamelCase(obj[key]);
    }
    return camelObj;
  }
  return obj;
};

// Helper to convert camelCase to snake_case for database
const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  if (obj !== null && typeof obj === 'object') {
    const snakeObj: any = {};
    for (const key in obj) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      snakeObj[snakeKey] = toSnakeCase(obj[key]);
    }
    return snakeObj;
  }
  return obj;
};

export class SupabaseService {
  // Generic query methods
  static async findOne(table: string, filters: Record<string, any>) {
    let query = supabase.from(table).select('*');
    
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    
    const { data, error } = await query.single();
    if (error) throw error;
    return toCamelCase(data);
  }

  static async findMany(table: string, filters?: Record<string, any>, options?: {
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }) {
    let query = supabase.from(table).select('*');
    
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }
    
    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.orderDirection !== 'desc' });
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return toCamelCase(data || []);
  }

  static async create(table: string, data: Record<string, any>) {
    const snakeData = toSnakeCase(data);
    const { data: result, error } = await supabase
      .from(table)
      .insert(snakeData)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(result);
  }

  static async update(table: string, id: string, data: Record<string, any>) {
    const snakeData = toSnakeCase(data);
    const { data: result, error } = await supabase
      .from(table)
      .update(snakeData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(result);
  }

  static async delete(table: string, id: string) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Specific methods for complex queries
  static async findWithRelations(
    table: string,
    relations: string[],
    filters?: Record<string, any>
  ) {
    let query = supabase.from(table).select(`
      *,
      ${relations.map(rel => `${rel}(*)`).join(',')}
    `);
    
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return toCamelCase(data || []);
  }
}
