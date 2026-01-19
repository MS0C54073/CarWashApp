import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateProfile, googleLogin, sendOTP, verifyOTP } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('nrc').trim().notEmpty().withMessage('NRC is required'),
  body('role').isIn(['client', 'driver', 'carwash', 'admin']).withMessage('Invalid role'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/google', googleLogin);
router.post('/phone/send-code', sendOTP);
router.post('/phone/verify', verifyOTP);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
