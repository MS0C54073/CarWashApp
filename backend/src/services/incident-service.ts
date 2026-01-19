import { supabase } from '../config/supabase';
import { toCamelCase, toSnakeCase } from './db-service';

export type IncidentType =
  | 'failed_booking'
  | 'failed_transaction'
  | 'suspicious_activity'
  | 'technical_alert'
  | 'operational_alert'
  | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  assignedTo?: string;
  createdBy: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  affectedUsers?: string[];
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  userId: string;
  comment: string;
  statusChange?: string;
  createdAt: string;
}

export class IncidentService {
  /**
   * Get all incidents with filters
   */
  static async getIncidents(filters: {
    status?: IncidentStatus;
    type?: IncidentType;
    severity?: IncidentSeverity;
    assignedTo?: string;
    limit?: number;
  } = {}): Promise<Incident[]> {
    let query = supabase
      .from('incidents')
      .select(`
        *,
        created_by_user:users!incidents_created_by_fkey(id, name, email),
        assigned_to_user:users!incidents_assigned_to_fkey(id, name, email),
        resolved_by_user:users!incidents_resolved_by_fkey(id, name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(100);
    }

    const { data, error } = await query;
    if (error) throw error;

    return toCamelCase(data || []).map((incident: any) => {
      if (incident.createdByUser) {
        incident.createdByName = incident.createdByUser.name;
        incident.createdByEmail = incident.createdByUser.email;
      }
      if (incident.assignedToUser) {
        incident.assignedToName = incident.assignedToUser.name;
        incident.assignedToEmail = incident.assignedToUser.email;
      }
      if (incident.resolvedByUser) {
        incident.resolvedByName = incident.resolvedByUser.name;
        incident.resolvedByEmail = incident.resolvedByUser.email;
      }
      return incident;
    });
  }

  /**
   * Get single incident with updates
   */
  static async getIncidentById(id: string): Promise<any> {
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .select(`
        *,
        created_by_user:users!incidents_created_by_fkey(id, name, email),
        assigned_to_user:users!incidents_assigned_to_fkey(id, name, email),
        resolved_by_user:users!incidents_resolved_by_fkey(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (incidentError) throw incidentError;

    const { data: updates, error: updatesError } = await supabase
      .from('incident_updates')
      .select('*, user:users!incident_updates_user_id_fkey(id, name, email)')
      .eq('incident_id', id)
      .order('created_at', { ascending: true });

    if (updatesError) throw updatesError;

    const incidentData = toCamelCase(incident);
    if (incidentData.createdByUser) {
      incidentData.createdByName = incidentData.createdByUser.name;
    }
    if (incidentData.assignedToUser) {
      incidentData.assignedToName = incidentData.assignedToUser.name;
    }
    if (incidentData.resolvedByUser) {
      incidentData.resolvedByName = incidentData.resolvedByUser.name;
    }

    return {
      ...incidentData,
      updates: toCamelCase(updates || []).map((update: any) => {
        if (update.user) {
          update.userName = update.user.name;
        }
        return update;
      }),
    };
  }

  /**
   * Create incident
   */
  static async createIncident(
    incidentData: Partial<Incident>,
    createdBy: string
  ): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .insert(
        toSnakeCase({
          ...incidentData,
          createdBy,
          status: 'open',
        })
      )
      .select(`
        *,
        created_by_user:users!incidents_created_by_fkey(id, name, email)
      `)
      .single();

    if (error) throw error;
    const result = toCamelCase(data);
    if (result.createdByUser) {
      result.createdByName = result.createdByUser.name;
    }
    return result;
  }

  /**
   * Update incident
   */
  static async updateIncident(
    id: string,
    updateData: Partial<Incident>
  ): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .update(toSnakeCase(updateData))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data);
  }

  /**
   * Add incident update/comment
   */
  static async addIncidentUpdate(
    incidentId: string,
    userId: string,
    comment: string,
    statusChange?: IncidentStatus
  ): Promise<IncidentUpdate> {
    const { data, error } = await supabase
      .from('incident_updates')
      .insert({
        incident_id: incidentId,
        user_id: userId,
        comment,
        status_change: statusChange || null,
      })
      .select()
      .single();

    if (error) throw error;

    // If status changed, update incident
    if (statusChange) {
      const updateData: any = { status: statusChange };
      if (statusChange === 'resolved' || statusChange === 'closed') {
        updateData.resolvedAt = new Date().toISOString();
        updateData.resolvedBy = userId;
      }
      await this.updateIncident(incidentId, updateData);
    }

    return toCamelCase(data);
  }

  /**
   * Assign incident
   */
  static async assignIncident(
    id: string,
    assignedTo: string
  ): Promise<Incident> {
    return this.updateIncident(id, {
      assignedTo,
      status: 'assigned',
    });
  }

  /**
   * Resolve incident
   */
  static async resolveIncident(
    id: string,
    resolvedBy: string,
    resolutionNotes: string
  ): Promise<Incident> {
    return this.updateIncident(id, {
      status: 'resolved',
      resolvedBy,
      resolvedAt: new Date().toISOString(),
      resolutionNotes,
    });
  }
}
