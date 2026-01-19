/**
 * Validation Middleware
 * Provides request validation using express-validator
 */
import { Request, Response, NextFunction } from 'express';
import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import { ValidationError } from '../shared/errors/AppError';

/**
 * Validate request and throw ValidationError if invalid
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMap: Record<string, string[]> = {};
      errors.array().forEach((error: any) => {
        const field = error.param || error.location || 'general';
        if (!errorMap[field]) {
          errorMap[field] = [];
        }
        errorMap[field].push(error.msg || error.message);
      });
      throw new ValidationError('Validation failed', errorMap);
    }

    next();
  };
};

/**
 * Common validation rules
 */
export const commonValidations = {
  // ID validation
  id: (field: string = 'id') => param(field)
    .isUUID()
    .withMessage(`${field} must be a valid UUID`),

  // Email validation
  email: (field: string = 'email') => body(field)
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  // Password validation
  password: (field: string = 'password') => body(field)
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Name validation
  name: (field: string = 'name') => body(field)
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage(`${field} must be between 2 and 100 characters`),

  // Phone validation
  phone: (field: string = 'phone') => body(field)
    .trim()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),

  // Role validation
  role: (field: string = 'role') => body(field)
    .isIn(['client', 'driver', 'carwash', 'admin'])
    .withMessage('Role must be one of: client, driver, carwash, admin'),

  // Status validation
  status: (field: string = 'status', allowedStatuses: string[] = []) => body(field)
    .isIn(allowedStatuses)
    .withMessage(`Status must be one of: ${allowedStatuses.join(', ')}`),

  // Price validation
  price: (field: string = 'price') => body(field)
    .isFloat({ min: 0 })
    .withMessage(`${field} must be a positive number`),

  // Coordinates validation
  coordinates: (field: string = 'coordinates') => body(field)
    .optional()
    .isObject()
    .withMessage(`${field} must be an object`)
    .custom((value) => {
      if (value && (typeof value.lat !== 'number' || typeof value.lng !== 'number')) {
        throw new Error(`${field} must have lat and lng as numbers`);
      }
      return true;
    }),

  // Optional string
  optionalString: (field: string, minLength: number = 0, maxLength: number = 1000) => 
    body(field)
      .optional()
      .trim()
      .isLength({ min: minLength, max: maxLength })
      .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`),
};

/**
 * Validation schemas for different endpoints
 */
export const validationSchemas = {
  // Auth validations
  register: [
    commonValidations.name('name'),
    commonValidations.email('email'),
    commonValidations.password('password'),
    commonValidations.phone('phone'),
    body('nrc')
      .trim()
      .isLength({ min: 5, max: 20 })
      .withMessage('NRC must be between 5 and 20 characters'),
    commonValidations.role('role'),
  ],

  login: [
    commonValidations.email('email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],

  // Vehicle validations
  createVehicle: [
    body('make')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Make is required and must be between 1 and 50 characters'),
    body('model')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Model is required and must be between 1 and 50 characters'),
    body('plateNo')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Plate number is required and must be between 3 and 20 characters'),
    body('color')
      .trim()
      .isLength({ min: 1, max: 30 })
      .withMessage('Color is required and must be between 1 and 30 characters'),
  ],

  // Booking validations
  createBooking: [
    body('vehicleId')
      .isUUID()
      .withMessage('Vehicle ID must be a valid UUID'),
    body('carWashId')
      .isUUID()
      .withMessage('Car wash ID must be a valid UUID'),
    body('serviceId')
      .isUUID()
      .withMessage('Service ID must be a valid UUID'),
    body('bookingType')
      .optional()
      .isIn(['pickup_delivery', 'drive_in'])
      .withMessage('Booking type must be either pickup_delivery or drive_in'),
    body('pickupLocation')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Pickup location must be between 5 and 200 characters'),
    commonValidations.coordinates('pickupCoordinates'),
    body('scheduledPickupTime')
      .optional()
      .isISO8601()
      .withMessage('Scheduled pickup time must be a valid ISO 8601 date'),
  ],

  updateBookingStatus: [
    commonValidations.status('status', [
      'pending',
      'accepted',
      'declined',
      'picked_up',
      'at_wash',
      'waiting_bay',
      'washing_bay',
      'drying_bay',
      'wash_completed',
      'delivered_to_client',
      'completed',
      'cancelled',
    ]),
  ],

  // Service validations
  createService: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Service name is required and must be between 1 and 100 characters'),
    commonValidations.price('price'),
    commonValidations.optionalString('description', 0, 500),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
};
