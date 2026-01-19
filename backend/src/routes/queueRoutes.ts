import express from 'express';
import {
  getQueue,
  getBookingQueuePosition,
  addToQueue,
  startService,
  completeService,
  updateServiceDuration,
} from '../controllers/queueController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/carwash/:carWashId', getQueue);
router.get('/booking/:bookingId', getBookingQueuePosition);
router.post('/add', addToQueue);
router.put('/:queueId/start', startService);
router.put('/:queueId/complete', completeService);
router.put('/:queueId/duration', updateServiceDuration);

export default router;
