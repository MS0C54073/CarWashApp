import { Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../shared/errors/errorHandler';
import { ApiSuccessResponse } from '../shared/types/api.types';
import { BadRequestError, ForbiddenError, InternalServerError } from '../shared/errors/AppError';

/**
 * Get notifications for the authenticated user
 */
export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
        throw new ForbiddenError('User not authenticated');
    }

    const { filter } = req.query;
    const notifications = await NotificationService.getNotifications(
        req.user.id,
        (filter as 'all' | 'unread' | 'read') || 'all'
    );

    const response: ApiSuccessResponse = {
        success: true,
        data: notifications,
    };

    res.json(response);
});

/**
 * Handle marking a notification as read
 */
export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
        throw new ForbiddenError('User not authenticated');
    }

    const { id } = req.params;
    if (!id) {
        throw new BadRequestError('Notification ID is required');
    }

    const updated = await NotificationService.markAsRead(id, req.user.id);

    if (!updated) {
        throw new InternalServerError('Failed to mark notification as read');
    }

    const response: ApiSuccessResponse = {
        success: true,
        data: updated,
    };

    res.json(response);
});

/**
 * Handle marking all notifications as read
 */
export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
        throw new ForbiddenError('User not authenticated');
    }

    await NotificationService.markAllAsRead(req.user.id);

    const response: ApiSuccessResponse = {
        success: true,
        message: 'All notifications marked as read',
        data: null
    };

    res.json(response);
});
