import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from './store';
import { checkAuth } from './features/auth/authSlice';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import BookingCalendar from './pages/bookings/BookingCalendar';
import StudioList from './pages/studios/StudioList';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    // You might want to add a loading spinner here
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/bookings" 
          element={isAuthenticated ? <BookingCalendar /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/studios" 
          element={isAuthenticated ? <StudioList /> : <Navigate to="/login" />} 
        />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
