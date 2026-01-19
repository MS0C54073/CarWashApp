/**
 * Recommendation Routes
 */

import express from 'express';
import {
  getRecommendedCarWashes,
  getRecommendedDrivers,
  getNearbyCarWashesController,
  getNearbyDriversController
} from '../controllers/recommendationController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Recommendation endpoints
router.get('/carwashes', protect, getRecommendedCarWashes);
router.get('/drivers', protect, getRecommendedDrivers);

// Nearby search endpoints
router.get('/nearby/carwashes', protect, getNearbyCarWashesController);
router.get('/nearby/drivers', protect, getNearbyDriversController);

export default router;
