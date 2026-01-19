import { Response } from 'express';
import { validationResult } from 'express-validator';
import { DBService } from '../services/db-service';
import { AuthRequest } from '../middleware/auth';
import { 
  BadRequestError, 
  NotFoundError, 
  ForbiddenError, 
  ValidationError,
  InternalServerError 
} from '../shared/errors/AppError';
import { asyncHandler } from '../shared/errors/errorHandler';
import { ApiSuccessResponse } from '../shared/types/api.types';

// @desc    Get user vehicles
// @route   GET /api/vehicles
// @access  Private (Client)
export const getVehicles = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || !req.user.id) {
    throw new ForbiddenError('User not authenticated');
  }

  const vehicles = await DBService.getVehiclesByClient(req.user.id);

  // Validate vehicles array
  if (!Array.isArray(vehicles)) {
    console.error('❌ getVehiclesByClient returned non-array:', vehicles);
    throw new InternalServerError('Invalid data format received from database');
  }

  const response: ApiSuccessResponse = {
    success: true,
    count: vehicles.length,
    data: vehicles,
  };

  res.json(response);
});

// @desc    Create vehicle
// @route   POST /api/vehicles
// @access  Private (Client)
export const createVehicle = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMap: Record<string, string[]> = {};
    errors.array().forEach((error: any) => {
      const field = error.param || 'general';
      if (!errorMap[field]) {
        errorMap[field] = [];
      }
      errorMap[field].push(error.msg || error.message);
    });
    throw new ValidationError('Validation failed', errorMap);
  }

  if (!req.user || !req.user.id) {
    throw new ForbiddenError('User not authenticated');
  }

  const { make, model, plateNo, color } = req.body;

  // Validate required fields
  if (!make || !model || !plateNo || !color) {
    throw new BadRequestError('Make, model, plate number, and color are required');
  }

  const vehicle = await DBService.createVehicle({
    clientId: req.user.id,
    make: make.trim(),
    model: model.trim(),
    plateNo: plateNo.trim().toUpperCase(),
    color: color.trim(),
  });

  if (!vehicle || !vehicle.id) {
    throw new InternalServerError('Failed to create vehicle');
  }

  const response: ApiSuccessResponse = {
    success: true,
    data: vehicle,
  };

  res.status(201).json(response);
});

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Client)
export const updateVehicle = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMap: Record<string, string[]> = {};
    errors.array().forEach((error: any) => {
      const field = error.param || 'general';
      if (!errorMap[field]) {
        errorMap[field] = [];
      }
      errorMap[field].push(error.msg || error.message);
    });
    throw new ValidationError('Validation failed', errorMap);
  }

  if (!req.user || !req.user.id) {
    throw new ForbiddenError('User not authenticated');
  }

  if (!req.params.id) {
    throw new BadRequestError('Vehicle ID is required');
  }

  const vehicle = await DBService.getVehicleById(req.params.id);
  
  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  if (vehicle.clientId !== req.user.id) {
    throw new ForbiddenError('Vehicle does not belong to you');
  }

  const updatedVehicle = await DBService.updateVehicle(req.params.id, req.body);

  if (!updatedVehicle) {
    throw new InternalServerError('Failed to update vehicle');
  }

  const response: ApiSuccessResponse = {
    success: true,
    data: updatedVehicle,
  };

  res.json(response);
});

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Client)
export const deleteVehicle = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || !req.user.id) {
    throw new ForbiddenError('User not authenticated');
  }

  if (!req.params.id) {
    throw new BadRequestError('Vehicle ID is required');
  }

  const vehicle = await DBService.getVehicleById(req.params.id);
  
  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }

  if (vehicle.clientId !== req.user.id) {
    throw new ForbiddenError('Vehicle does not belong to you');
  }

  await DBService.deleteVehicle(req.params.id);

  const response: ApiSuccessResponse = {
    success: true,
    data: { id: req.params.id },
    message: 'Vehicle deleted successfully',
  };

  res.json(response);
});
