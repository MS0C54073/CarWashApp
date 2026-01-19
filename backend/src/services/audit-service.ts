import { createClient } from '@supabase/supabase-js';
import { toCamelCase } from './db-service';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export type AuditActionType =
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_suspended'
  | 'user_reactivated'
  | 'role_changed'
  | 'admin_level_changed'
  | 'booking_created'
  | 'booking_updated'
  | 'booking_cancelled'
  | 'payment_processed'
  | 'driver_assigned'
  | 'status_changed'
  | 'feature_flag_created'
  | 'feature_flag_updated'
  | 'feature_flag_deleted'
  | 'retention_policy_updated'
  | 'user_data_anonymized'
  | 'incident_created'
  | 'incident_updated'
  | 'incident_assigned'
  | 'incident_resolved'
  | 'incident_escalated'
  | 'user_creation_pending'
  | 'user_approved'
  | 'user_rejected';

export interface AuditLog {
  id: string;
  adminId: string;
  actionType: AuditActionType;
  entityType: string;
  entityId?: string;
  description: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export class AuditService {
  /**
   * Create an audit log entry
   */
  static async log(
    adminId: string,
    actionType: AuditActionType,
    entityType: string,
    description: string,
    options: {
      entityId?: string;
      oldValue?: any;
      newValue?: any;
      ipAddress?: string;
      userAgent?: string;
    } = {}
  ): Promise<void> {
    try {
      const { entityId, oldValue, newValue, ipAddress, userAgent } = options;

      const logData = {
        admin_id: adminId,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId || null,
        description,
        old_value: oldValue ? JSON.stringify(oldValue) : null,
        new_value: newValue ? JSON.stringify(newValue) : null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      };

      const { error } = await supabase.from('audit_logs').insert(logData);

      if (error) {
        console.error('Error creating audit log:', error);
        // Don't throw - audit logging should not break the main flow
      }
    } catch (error) {
      console.error('Error in audit logging:', error);
      // Silently fail - audit logging should not break main operations
    }
  }

  /**
   * Get audit logs with filters
   */
  static async getLogs(filters: {
    adminId?: string;
    actionType?: string;
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_logs')
      .select('*, admin:users!audit_logs_admin_id_fkey(id, name, email)')
      .order('created_at', { ascending: false });

    if (filters.adminId) {
      query = query.eq('admin_id', filters.adminId);
    }
    if (filters.actionType) {
      query = query.eq('action_type', filters.actionType);
    }
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters.entityId) {
      query = query.eq('entity_id', filters.entityId);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(1000); // Default limit
    }

    const { data, error } = await query;

    if (error) throw error;

    return toCamelCase(data || []).map((log: any) => {
      if (log.admin) {
        log.adminName = log.admin.name;
        log.adminEmail = log.admin.email;
      }
      if (log.oldValue) {
        try {
          log.oldValue = JSON.parse(log.oldValue);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
      if (log.newValue) {
        try {
          log.newValue = JSON.parse(log.newValue);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
      return log;
    });
  }

  /**
   * Get audit logs for a specific entity
   */
  static async getEntityLogs(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.getLogs({ entityType, entityId });
  }

  /**
   * Log an action (simplified interface for user approval service and other services)
   */
  static async logAction(params: {
    userId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    details?: any;
  }): Promise<void> {
    try {
      // Map the action to AuditActionType if possible, otherwise use user_updated as default
      let actionType: AuditActionType = 'user_updated';
      
      // Map common actions to AuditActionType
      const actionMap: Record<string, AuditActionType> = {
        'user_created': 'user_created',
        'user_creation_pending': 'user_created',
        'user_updated': 'user_updated',
        'user_deleted': 'user_deleted',
        'user_suspended': 'user_suspended',
        'user_reactivated': 'user_reactivated',
        'user_approved': 'user_updated',
        'user_rejected': 'user_updated',
        'role_changed': 'role_changed',
        'admin_level_changed': 'admin_level_changed',
        'booking_created': 'booking_created',
        'booking_updated': 'booking_updated',
        'booking_cancelled': 'booking_cancelled',
        'payment_processed': 'payment_processed',
        'driver_assigned': 'driver_assigned',
        'status_changed': 'status_changed',
      };

      if (actionMap[params.action]) {
        actionType = actionMap[params.action];
      }

      const description = `${params.action} for ${params.resourceType}${params.resourceId ? ` (ID: ${params.resourceId})` : ''}`;
      
      await this.log(
        params.userId,
        actionType,
        params.resourceType,
        description,
        {
          entityId: params.resourceId,
          newValue: params.details,
        }
      );
    } catch (error) {
      console.error('Error in audit logAction:', error);
      // Silently fail - audit logging should not break main operations
    }
  }
}
