import express from 'express';
import { body } from 'express-validator';
import {
  getServices,
  getCarWashes,
  createOrUpdateService,
  getCarWashBookings,
  getCarWashDashboard,
} from '../controllers/carWashController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

const serviceValidation = [
  body('name').trim().notEmpty().withMessage('Service name is required').isLength({ min: 1, max: 100 }).withMessage('Service name must be between 1 and 100 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Public routes
router.get('/list', getCarWashes);
router.get('/services', getServices);

// Protected routes
router.use(protect);
router.get('/dashboard', authorize('carwash'), getCarWashDashboard);
router.get('/bookings', authorize('carwash'), getCarWashBookings);
router.post('/services', authorize('carwash'), serviceValidation, createOrUpdateService);
router.put('/services/:id', authorize('carwash'), serviceValidation, createOrUpdateService);

export default router;
