import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

import { errorHandler } from './middleware/errorMiddleware';
import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';
import studioRoutes from './routes/studioRoutes';
import roomRoutes from './routes/roomRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import userRoutes from './routes/userRoutes';
import paymentRoutes from './routes/paymentRoutes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
