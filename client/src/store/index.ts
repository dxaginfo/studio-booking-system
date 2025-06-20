import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
import bookingReducer from '../features/bookings/bookingSlice';
import studioReducer from '../features/studios/studioSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bookings: bookingReducer,
    studios: studioReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
