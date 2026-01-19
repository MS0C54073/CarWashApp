import express from 'express';
import {
  getAvailableDrivers,
  getDriverBookings,
  acceptBooking,
  declineBooking,
  updateAvailability,
  getDriverEarnings,
} from '../controllers/driverController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/available', protect, getAvailableDrivers);
router.get('/bookings', protect, authorize('driver'), getDriverBookings);
router.put('/bookings/:id/accept', protect, authorize('driver'), acceptBooking);
router.put('/bookings/:id/decline', protect, authorize('driver'), declineBooking);
router.put('/availability', protect, authorize('driver'), updateAvailability);
router.get('/earnings', protect, authorize('driver'), getDriverEarnings);

export default router;
