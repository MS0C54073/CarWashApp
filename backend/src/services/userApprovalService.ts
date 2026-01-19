/**
 * User Approval Service
 * Handles user creation with approval workflow
 */

import { supabase } from '../config/supabase';
import { DBService } from './db-service';
import bcrypt from 'bcryptjs';
import { AuditService } from './audit-service';

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

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone: string;
  nrc: string;
  role: 'client' | 'driver' | 'carwash' | 'admin';
  [key: string]: any; // For role-specific fields
}

/**
 * Create a new user with approval workflow
 * - Admin: User is auto-approved
 * - Sub-Admin: User requires approval
 */
export async function createUserWithApproval(
  userData: CreateUserData,
  createdBy: { id: string; role: string; adminLevel?: string }
): Promise<{ user: any; requiresApproval: boolean }> {
  try {
    // Validate required fields
    if (!userData.name || !userData.email || !userData.password || !userData.phone || !userData.nrc || !userData.role) {
      throw new Error('All required fields must be provided');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user with same email already exists (case-insensitive)
    const normalizedEmail = userData.email.toLowerCase().trim();
    const existingUserByEmail = await DBService.findUserByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error(`A user with this email already exists. Email: ${existingUserByEmail.email || userData.email}`);
    }

    // Check if user with same NRC already exists
    const existingUserByNrc = await DBService.findUserByNrc(userData.nrc);
    if (existingUserByNrc) {
      throw new Error(`A user with this NRC number already exists. NRC: ${existingUserByNrc.nrc || userData.nrc}`);
    }

    // Validate role-specific required fields
    if (userData.role === 'driver') {
      if (!userData.licenseNo || !userData.licenseType || !userData.licenseExpiry || !userData.address) {
        throw new Error('Driver requires: License Number, License Type, License Expiry, and Address');
      }
    } else if (userData.role === 'carwash') {
      if (!userData.carWashName || !userData.location || !userData.washingBays) {
        throw new Error('Car Wash requires: Car Wash Name, Location, and Number of Washing Bays');
      }
      if (userData.washingBays < 1 || userData.washingBays > 20) {
        throw new Error('Number of washing bays must be between 1 and 20');
      }
    }

    // Check if creator is admin (auto-approve) or sub-admin (requires approval)
    const isAdmin = createdBy.role === 'admin' && 
                   (createdBy.adminLevel === 'super_admin' || createdBy.adminLevel === 'admin');
    
    const requiresApproval = !isAdmin;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Prepare user data
    const userToCreate: any = {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      phone: userData.phone,
      nrc: userData.nrc,
      role: userData.role,
      is_active: !requiresApproval, // Only inactive if requires approval
    };

    // Add role-specific fields first
    if (userData.role === 'driver') {
      userToCreate.license_no = userData.licenseNo;
      userToCreate.license_type = userData.licenseType;
      userToCreate.license_expiry = userData.licenseExpiry;
      userToCreate.address = userData.address;
      userToCreate.marital_status = userData.maritalStatus;
      userToCreate.availability = !requiresApproval; // Available only if approved
    } else if (userData.role === 'carwash') {
      userToCreate.car_wash_name = userData.carWashName;
      userToCreate.location = userData.location;
      userToCreate.washing_bays = userData.washingBays;
    } else if (userData.role === 'client') {
      userToCreate.business_name = userData.businessName;
      userToCreate.is_business = userData.isBusiness || false;
    } else if (userData.role === 'admin') {
      userToCreate.admin_level = userData.adminLevel || 'support';
    }

    // Try to insert with approval workflow fields
    // If columns don't exist, Supabase will return an error which we'll handle
    let data, error;
    
    // First, try with approval workflow fields
    const userWithApproval: any = {
      ...userToCreate,
      approval_status: requiresApproval ? 'pending' : 'approved',
      created_by: createdBy.id,
    };
    
    if (requiresApproval) {
      userWithApproval.approval_requested_at = new Date().toISOString();
    } else {
      userWithApproval.approved_at = new Date().toISOString();
      userWithApproval.approved_by = createdBy.id;
    }

    const result = await supabase
      .from('users')
      .insert(userWithApproval)
      .select()
      .single();
    
    data = result.data;
    error = result.error;

    // If error is due to missing approval_status column, retry without it
    if (error && (error.code === '42703' || error.message?.includes('column') || error.message?.includes('approval_status'))) {
      console.log('Approval workflow columns not available, creating user without approval workflow');
      // Retry without approval fields
      const resultWithoutApproval = await supabase
        .from('users')
        .insert(userToCreate)
        .select()
        .single();
      data = resultWithoutApproval.data;
      error = resultWithoutApproval.error;
    }

    if (error) {
      console.error('Error creating user:', error);
      
      // Provide user-friendly error messages
      if (error.code === '23505') { // Unique constraint violation
        if (error.message?.includes('email') || error.details?.includes('email')) {
          throw new Error('A user with this email already exists');
        } else if (error.message?.includes('nrc') || error.details?.includes('nrc')) {
          throw new Error('A user with this NRC number already exists');
        } else {
          throw new Error('A user with this information already exists');
        }
      } else if (error.code === '23503') { // Foreign key constraint
        throw new Error('Invalid reference. Please check all fields.');
      } else if (error.code === '23502') { // Not null constraint
        throw new Error('Required fields are missing');
      } else if (error.code === '42703') { // Column does not exist
        throw new Error('Database schema mismatch. Please run migrations: backend/migrations/add-user-approval-fields.sql');
      } else {
        throw new Error(error.message || 'Failed to create user. Please check all fields and try again.');
      }
    }

    // Log audit trail
    await AuditService.logAction({
      userId: createdBy.id,
      action: requiresApproval ? 'user_creation_pending' : 'user_created',
      resourceType: 'user',
      resourceId: data.id,
      details: {
        createdUserRole: userData.role,
        createdUserName: userData.name,
        requiresApproval,
      },
    });

    return {
      user: toCamelCase(data),
      requiresApproval,
    };
  } catch (error: any) {
    console.error('Error in createUserWithApproval:', error);
    throw error;
  }
}

/**
 * Approve a pending user
 */
export async function approveUser(
  userId: string,
  approvedBy: { id: string; name: string },
  notes?: string
): Promise<any> {
  try {
    // Get the user
    const user = await DBService.findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const approvalStatus = (user as any).approval_status || user.approvalStatus;
    if (approvalStatus !== 'pending') {
      throw new Error(`User is not pending approval. Current status: ${approvalStatus}`);
    }

    // Update user
    const { data, error } = await supabase
      .from('users')
      .update({
        approval_status: 'approved',
        is_active: true,
        approved_by: approvedBy.id,
        approved_at: new Date().toISOString(),
        approval_notes: notes || null,
        availability: user.role === 'driver' ? true : undefined, // Enable driver availability
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log audit trail
    await AuditService.logAction({
      userId: approvedBy.id,
      action: 'user_approved',
      resourceType: 'user',
      resourceId: userId,
      details: {
        approvedUserName: user.name,
        approvedUserRole: user.role,
        notes,
      },
    });

    return toCamelCase(data);
  } catch (error: any) {
    console.error('Error approving user:', error);
    throw error;
  }
}

/**
 * Reject a pending user
 */
export async function rejectUser(
  userId: string,
  rejectedBy: { id: string; name: string },
  reason: string
): Promise<any> {
  try {
    // Get the user
    const user = await DBService.findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const approvalStatus = (user as any).approval_status || user.approvalStatus;
    if (approvalStatus !== 'pending') {
      throw new Error(`User is not pending approval. Current status: ${approvalStatus}`);
    }

    // Update user
    const { data, error } = await supabase
      .from('users')
      .update({
        approval_status: 'rejected',
        is_active: false,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log audit trail
    await AuditService.logAction({
      userId: rejectedBy.id,
      action: 'user_rejected',
      resourceType: 'user',
      resourceId: userId,
      details: {
        rejectedUserName: user.name,
        rejectedUserRole: user.role,
        reason,
      },
    });

    return toCamelCase(data);
  } catch (error: any) {
    console.error('Error rejecting user:', error);
    throw error;
  }
}

/**
 * Get all pending user approvals
 */
export async function getPendingApprovals(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        created_by_user:users!users_created_by_fkey(id, name, email, admin_level)
      `)
      .eq('approval_status', 'pending')
      .order('approval_requested_at', { ascending: true });

    if (error) throw error;
    return toCamelCase(data || []);
  } catch (error: any) {
    console.error('Error getting pending approvals:', error);
    throw error;
  }
}

/**
 * Get approval history for a user
 */
export async function getUserApprovalHistory(userId: string): Promise<any> {
  try {
    const user = await DBService.findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Get creator info
    let createdByUser = null;
    if (user.created_by) {
      createdByUser = await DBService.findUserById(user.created_by);
    }

    // Get approver info
    let approvedByUser = null;
    if (user.approved_by) {
      approvedByUser = await DBService.findUserById(user.approved_by);
    }

    return {
      user,
      createdBy: createdByUser ? {
        id: createdByUser.id,
        name: createdByUser.name,
        email: createdByUser.email,
        adminLevel: createdByUser.adminLevel,
      } : null,
      approvedBy: approvedByUser ? {
        id: approvedByUser.id,
        name: approvedByUser.name,
        email: approvedByUser.email,
      } : null,
      approvalStatus: user.approval_status,
      approvalRequestedAt: user.approval_requested_at,
      approvedAt: user.approved_at,
      rejectedAt: user.rejected_at,
      rejectionReason: user.rejection_reason,
      approvalNotes: user.approval_notes,
    };
  } catch (error: any) {
    console.error('Error getting approval history:', error);
    throw error;
  }
}
