import express from 'express';
import { body } from 'express-validator';
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

const vehicleValidation = [
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('plateNo').trim().notEmpty().withMessage('Plate number is required'),
  body('color').trim().notEmpty().withMessage('Color is required'),
];

router.use(protect);
router.use(authorize('client'));

router.get('/', getVehicles);
router.post('/', vehicleValidation, createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
