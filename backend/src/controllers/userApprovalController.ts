/**
 * User Approval Controller
 * Handles user creation with approval workflow
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createUserWithApproval,
  approveUser,
  rejectUser,
  getPendingApprovals,
  getUserApprovalHistory,
} from '../services/userApprovalService';

/**
 * Create a new user (with approval workflow)
 */
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Please log in again.' });
      return;
    }

    // Validate that user is admin or sub-admin
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only administrators can create users.'
      });
      return;
    }

    // Basic validation
    const { name, email, password, phone, nrc, role } = req.body;

    if (!name || !email || !password || !phone || !nrc || !role) {
      res.status(400).json({
        success: false,
        message: 'All required fields must be provided: name, email, password, phone, NRC, and role.',
      });
      return;
    }

    // Validate role
    const validRoles = ['client', 'driver', 'carwash', 'admin', 'subadmin'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
      return;
    }

    const result = await createUserWithApproval(req.body, {
      id: req.user.id,
      role: req.user.role,
      adminLevel: req.user.adminLevel,
    });

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        requiresApproval: result.requiresApproval,
        message: result.requiresApproval
          ? 'User created successfully. Awaiting admin approval.'
          : 'User created and approved successfully.',
      },
    });
  } catch (error: any) {
    console.error('Error creating user:', error);

    // Determine appropriate status code
    let statusCode = 400;
    if (error.message?.includes('already exists')) {
      statusCode = 409; // Conflict
    } else if (error.message?.includes('Unauthorized') || error.message?.includes('permission')) {
      statusCode = 403;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create user. Please check all fields and try again.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

/**
 * Get pending user approvals
 */
export const getPendingUserApprovals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can view pending approvals
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can view pending approvals',
      });
      return;
    }

    const pending = await getPendingApprovals();

    res.json({
      success: true,
      count: pending.length,
      data: pending,
    });
  } catch (error: any) {
    console.error('Error getting pending approvals:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get pending approvals',
    });
  }
};

/**
 * Approve a pending user
 */
export const approvePendingUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can approve users
    if (req.user?.role !== 'admin' ||
      (req.user.adminLevel !== 'super_admin' && req.user.adminLevel !== 'admin')) {
      res.status(403).json({
        success: false,
        message: 'Only admins can approve users',
      });
      return;
    }

    const { userId } = req.params;
    const { notes } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const approvedUser = await approveUser(userId, {
      id: req.user.id,
      name: req.user.name || 'Admin',
    }, notes);

    res.json({
      success: true,
      data: approvedUser,
      message: 'User approved successfully',
    });
  } catch (error: any) {
    console.error('Error approving user:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to approve user',
    });
  }
};

/**
 * Reject a pending user
 */
export const rejectPendingUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can reject users
    if (req.user?.role !== 'admin' ||
      (req.user.adminLevel !== 'super_admin' && req.user.adminLevel !== 'admin')) {
      res.status(403).json({
        success: false,
        message: 'Only admins can reject users',
      });
      return;
    }

    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const rejectedUser = await rejectUser(userId, {
      id: req.user.id,
      name: req.user.name || 'Admin',
    }, reason);

    res.json({
      success: true,
      data: rejectedUser,
      message: 'User rejected successfully',
    });
  } catch (error: any) {
    console.error('Error rejecting user:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reject user',
    });
  }
};

/**
 * Get approval history for a user
 */
export const getUserApprovalHistoryController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const history = await getUserApprovalHistory(userId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error('Error getting approval history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get approval history',
    });
  }
};
