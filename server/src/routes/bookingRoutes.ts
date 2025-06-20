import express from 'express';
import { body } from 'express-validator';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Get all bookings
router.get('/', protect, getBookings);

// Get booking by ID
router.get('/:id', protect, getBookingById);

// Create new booking
router.post(
  '/',
  protect,
  [
    body('roomId').notEmpty().withMessage('Room ID is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
  ],
  createBooking
);

// Update booking
router.put('/:id', protect, updateBooking);

// Delete booking
router.delete('/:id', protect, deleteBooking);

export default router;
