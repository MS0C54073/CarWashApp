/**
 * Location Routes
 * 
 * API routes for location tracking and management
 */

import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  updateLocation,
  getDriverLocation,
  getBookingLocation,
  getActiveDriverLocations,
  getBookingLocationHistory,
} from '../controllers/locationController';

const router = Router();

// All location routes require authentication
router.use(protect);

// Update driver location
router.post('/update', updateLocation);

// Get driver location
router.get('/driver/:driverId', getDriverLocation);

// Get booking location
router.get('/booking/:bookingId', getBookingLocation);

// Get location history for booking
router.get('/booking/:bookingId/history', getBookingLocationHistory);

// Get all active driver locations (admin only)
router.get('/drivers/active', getActiveDriverLocations);

export default router;
