import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bookingService from '../../services/bookingService';

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  room?: {
    id: string;
    name: string;
    studioId: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk(
  'bookings/fetchAll',
  async (_, thunkAPI) => {
    try {
      return await bookingService.getBookings();
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchById',
  async (id: string, thunkAPI) => {
    try {
      return await bookingService.getBookingById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch booking');
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData: Partial<Booking>, thunkAPI) => {
    try {
      return await bookingService.createBooking(bookingData);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

export const updateBooking = createAsyncThunk(
  'bookings/update',
  async ({ id, bookingData }: { id: string; bookingData: Partial<Booking> }, thunkAPI) => {
    try {
      return await bookingService.updateBooking(id, bookingData);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update booking');
    }
  }
);

export const deleteBooking = createAsyncThunk(
  'bookings/delete',
  async (id: string, thunkAPI) => {
    try {
      await bookingService.deleteBooking(id);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete booking');
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex((booking) => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        state.selectedBooking = action.payload;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.filter((booking) => booking.id !== action.payload);
        if (state.selectedBooking && state.selectedBooking.id === action.payload) {
          state.selectedBooking = null;
        }
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedBooking, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
