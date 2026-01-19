import { supabase } from '../config/supabase';

export interface CreateNotificationDTO {
    userId: string;
    type: 'booking_update' | 'message' | 'payment' | 'system' | 'promotion';
    title: string;
    message: string;
    data?: any;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export class NotificationService {
    /**
     * Create a notification for a user
     */
    static async createNotification(dto: CreateNotificationDTO) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .insert({
                    user_id: dto.userId,
                    type: dto.type,
                    title: dto.title,
                    message: dto.message,
                    data: dto.data || {},
                    priority: dto.priority || 'medium',
                    is_read: false,
                })
                .select()
                .single();

            if (error) {
                console.error('❌ Error creating notification:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('❌ Critical error creating notification:', error);
            return null;
        }
    }

    /**
     * Get notifications for a user
     */
    static async getNotifications(userId: string, filter: 'all' | 'unread' | 'read' = 'all') {
        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (filter === 'unread') {
            query = query.eq('is_read', false);
        } else if (filter === 'read') {
            query = query.eq('is_read', true);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(id: string, userId: string) {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(userId: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    }

    /**
     * Notify all Admins
     */
    static async notifyAdmins(title: string, message: string, data?: any) {
        try {
            // Get all admins
            const { data: admins, error } = await supabase
                .from('users')
                .select('id')
                .in('role', ['admin', 'subadmin']);

            if (error || !admins) return;

            const notifications = admins.map(admin => ({
                user_id: admin.id,
                type: 'system',
                title,
                message,
                data: data || {},
                priority: 'medium',
                is_read: false
            }));

            await supabase.from('notifications').insert(notifications);
        } catch (error) {
            console.error('❌ Error notifying admins:', error);
        }
    }
}
