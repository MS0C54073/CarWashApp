import { supabase } from '../config/supabase';

export interface CreateLogDTO {
    userId?: string;
    action: string;
    resource?: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
}

export class LogService {
    /**
     * Create a system log
     */
    static async log(dto: CreateLogDTO) {
        try {
            const { error } = await supabase
                .from('system_logs')
                .insert({
                    user_id: dto.userId,
                    action: dto.action,
                    resource: dto.resource,
                    resource_id: dto.resourceId,
                    details: dto.details || {},
                    ip_address: dto.ipAddress,
                    severity: dto.severity || 'info',
                });

            if (error) {
                console.error('❌ Error creating system log:', error);
            }
        } catch (error) {
            console.error('❌ Critical error creating system log:', error);
        }
    }

    /**
     * Get logs for admin
     */
    static async getLogs(limit: number = 100, offset: number = 0) {
        const { data, error, count } = await supabase
            .from('system_logs')
            .select(`
        *,
        user:users(id, name, email, role)
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { logs: data || [], total: count || 0 };
    }
}
