import { supabase } from '../config/supabase';
import { toCamelCase, toSnakeCase } from './db-service';

export interface DataRetentionPolicy {
  id: string;
  entityType: string;
  retentionDays: number;
  autoDelete: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserConsent {
  id: string;
  userId: string;
  consentType: string;
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataAnonymization {
  id: string;
  userId: string;
  anonymizedBy: string;
  reason: string;
  anonymizedFields: string[];
  createdAt: string;
}

export class ComplianceService {
  /**
   * Get all data retention policies
   */
  static async getRetentionPolicies(): Promise<DataRetentionPolicy[]> {
    const { data, error } = await supabase
      .from('data_retention_policies')
      .select('*')
      .order('entity_type', { ascending: true });

    if (error) throw error;
    return toCamelCase(data || []);
  }

  /**
   * Update data retention policy
   */
  static async updateRetentionPolicy(
    id: string,
    policyData: Partial<DataRetentionPolicy>
  ): Promise<DataRetentionPolicy> {
    const { data, error } = await supabase
      .from('data_retention_policies')
      .update(toSnakeCase(policyData))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  }

  /**
   * Get user consent records
   */
  static async getUserConsents(userId: string): Promise<UserConsent[]> {
    const { data, error } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return toCamelCase(data || []);
  }

  /**
   * Create or update user consent
   */
  static async updateUserConsent(
    userId: string,
    consentType: string,
    granted: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserConsent> {
    // Check if consent exists
    const { data: existing } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .single();

    const consentData: any = {
      user_id: userId,
      consent_type: consentType,
      granted,
      ip_address: ipAddress,
      user_agent: userAgent,
    };

    if (granted) {
      consentData.granted_at = new Date().toISOString();
      consentData.revoked_at = null;
    } else {
      consentData.revoked_at = new Date().toISOString();
    }

    let data, error;
    if (existing) {
      ({ data, error } = await supabase
        .from('user_consents')
        .update(consentData)
        .eq('id', existing.id)
        .select()
        .single());
    } else {
      ({ data, error } = await supabase
        .from('user_consents')
        .insert(consentData)
        .select()
        .single());
    }

    if (error) throw error;
    return toCamelCase(data);
  }

  /**
   * Anonymize user data
   */
  static async anonymizeUserData(
    userId: string,
    anonymizedBy: string,
    reason: string,
    fields: string[]
  ): Promise<DataAnonymization> {
    // Anonymize user data
    const anonymizedData: any = {};
    fields.forEach((field) => {
      if (field === 'email') anonymizedData.email = `anonymized_${userId.substring(0, 8)}@deleted.local`;
      if (field === 'name') anonymizedData.name = 'Anonymized User';
      if (field === 'phone') anonymizedData.phone = '0000000000';
      if (field === 'nrc') anonymizedData.nrc = 'ANONYMIZED';
    });

    // Update user
    await supabase.from('users').update(anonymizedData).eq('id', userId);

    // Create anonymization record
    const { data, error } = await supabase
      .from('data_anonymizations')
      .insert({
        user_id: userId,
        anonymized_by: anonymizedBy,
        reason,
        anonymized_fields: fields,
      })
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  }

  /**
   * Get anonymization records for a user
   */
  static async getAnonymizationRecords(userId: string): Promise<DataAnonymization[]> {
    const { data, error } = await supabase
      .from('data_anonymizations')
      .select('*, anonymized_by:users!data_anonymizations_anonymized_by_fkey(id, name, email)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return toCamelCase(data || []);
  }

  /**
   * Get user data summary for compliance review
   */
  static async getUserDataSummary(userId: string): Promise<any> {
    // Get user
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();

    // Get related data counts
    const { count: bookingsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', userId);

    const { count: vehiclesCount } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', userId);

    const consents = await this.getUserConsents(userId);
    const anonymizations = await this.getAnonymizationRecords(userId);

    return {
      user: toCamelCase(user),
      dataCounts: {
        bookings: bookingsCount || 0,
        vehicles: vehiclesCount || 0,
      },
      consents,
      anonymizations,
    };
  }
}
