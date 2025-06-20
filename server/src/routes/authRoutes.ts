import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Register user
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
  ],
  registerUser
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  loginUser
);

// Get user profile
router.get('/me', protect, getMe);

// Logout user
router.post('/logout', protect, logoutUser);

export default router;
