import axios from 'axios';
import { User } from '../features/auth/authSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Setup axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Register user
const register = async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Login user
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Logout user
const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
};

// Check authentication status
const checkAuthStatus = async (): Promise<User> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }
  
  const response = await api.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  checkAuthStatus,
};

export default authService;
