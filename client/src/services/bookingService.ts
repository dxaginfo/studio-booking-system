import axios from 'axios';
import { Booking } from '../features/bookings/bookingSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Setup axios instance with credentials and auth token
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Get all bookings
const getBookings = async (): Promise<Booking[]> => {
  const response = await api.get('/bookings');
  return response.data;
};

// Get booking by ID
const getBookingById = async (id: string): Promise<Booking> => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

// Create new booking
const createBooking = async (bookingData: Partial<Booking>): Promise<Booking> => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

// Update booking
const updateBooking = async (id: string, bookingData: Partial<Booking>): Promise<Booking> => {
  const response = await api.put(`/bookings/${id}`, bookingData);
  return response.data;
};

// Delete booking
const deleteBooking = async (id: string): Promise<void> => {
  await api.delete(`/bookings/${id}`);
};

const bookingService = {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
};

export default bookingService;
