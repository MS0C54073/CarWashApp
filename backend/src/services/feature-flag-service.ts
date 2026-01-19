import { supabase } from '../config/supabase';
import { toCamelCase, toSnakeCase } from './db-service';

export type FeatureFlagStatus = 'active' | 'inactive' | 'limited';

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  status: FeatureFlagStatus;
  rolloutPercentage: number;
  enabledRoles: string[];
  enabledRegions: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export class FeatureFlagService {
  /**
   * Get all feature flags
   */
  static async getAllFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return toCamelCase(data || []);
  }

  /**
   * Get a feature flag by name
   */
  static async getFlagByName(name: string): Promise<FeatureFlag | null> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('name', name)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? toCamelCase(data) : null;
  }

  /**
   * Get a feature flag by ID
   */
  static async getFlagById(id: string): Promise<FeatureFlag | null> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return toCamelCase(data);
  }

  /**
   * Create a new feature flag
   */
  static async createFlag(flagData: Partial<FeatureFlag>, updatedBy: string): Promise<FeatureFlag> {
    const snakeCaseData = toSnakeCase({
      ...flagData,
      updatedBy,
    });

    const { data, error } = await supabase
      .from('feature_flags')
      .insert(snakeCaseData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  }

  /**
   * Update a feature flag
   */
  static async updateFlag(
    id: string,
    flagData: Partial<FeatureFlag>,
    updatedBy: string
  ): Promise<FeatureFlag> {
    const snakeCaseData = toSnakeCase({
      ...flagData,
      updatedBy,
    });

    const { data, error } = await supabase
      .from('feature_flags')
      .update(snakeCaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  }

  /**
   * Delete a feature flag
   */
  static async deleteFlag(id: string): Promise<void> {
    const { error } = await supabase.from('feature_flags').delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Check if a feature is enabled for a user
   */
  static async isFeatureEnabled(
    featureName: string,
    userRole: string,
    userId?: string
  ): Promise<boolean> {
    const flag = await this.getFlagByName(featureName);

    if (!flag) return false;

    // If inactive, always return false
    if (flag.status === 'inactive') return false;

    // If active with 100% rollout, check role
    if (flag.status === 'active' && flag.rolloutPercentage === 100) {
      return flag.enabledRoles.length === 0 || flag.enabledRoles.includes(userRole);
    }

    // If limited rollout, check role and percentage
    if (flag.status === 'limited') {
      // Check role first
      if (flag.enabledRoles.length > 0 && !flag.enabledRoles.includes(userRole)) {
        return false;
      }

      // For limited rollout, use a deterministic hash based on userId
      // This ensures consistent behavior for the same user
      if (userId) {
        // Simple hash function for consistent rollout
        const hash = this.simpleHash(userId + featureName);
        const userPercentage = (hash % 100) + 1;
        return userPercentage <= flag.rolloutPercentage;
      }

      // If no userId, use random (for testing)
      return Math.random() * 100 <= flag.rolloutPercentage;
    }

    return false;
  }

  /**
   * Simple hash function for consistent user-based rollout
   */
  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get feature flags with change history from audit logs
   */
  static async getFlagsWithHistory(): Promise<any[]> {
    const flags = await this.getAllFlags();
    // In a full implementation, you'd join with audit_logs
    // For now, we'll return flags with their update info
    return flags;
  }
}
