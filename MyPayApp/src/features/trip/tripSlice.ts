import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface TripWallet {
  id: string;
  name: string;
  description?: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripTransaction {
  id: string;
  tripId: string;
  amount: number;
  merchantName: string;
  description?: string;
  category: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

interface TripState {
  trips: TripWallet[];
  transactions: TripTransaction[];
  currentTrip: TripWallet | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TripState = {
  trips: [],
  transactions: [],
  currentTrip: null,
  isLoading: false,
  error: null,
};

// Async thunks for wallet operations
export const createTripWallet = createAsyncThunk(
  'trip/createWallet',
  async (walletData: Omit<TripWallet, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWallet: TripWallet = {
      ...walletData,
      id: `trip_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // In a real app, save to backend/database
    return newWallet;
  }
);

export const addToTripWallet = createAsyncThunk(
  'trip/addToWallet',
  async ({ tripId, amount }: { tripId: string; amount: number }) => {
    // In a real app, update in backend/database
    return { tripId, amount };
  }
);

export const addTripTransaction = createAsyncThunk(
  'trip/addTransaction',
  async (transactionData: Omit<TripTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: TripTransaction = {
      ...transactionData,
      id: `trip_txn_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // In a real app, save to backend/database
    return newTransaction;
  }
);

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setCurrentTrip: (state, action: PayloadAction<TripWallet | null>) => {
      state.currentTrip = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    deleteTrip: (state, action: PayloadAction<string>) => {
      state.trips = state.trips.filter(trip => trip.id !== action.payload);
      if (state.currentTrip?.id === action.payload) {
        state.currentTrip = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTripWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTripWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips.push(action.payload);
        if (state.trips.length === 1) {
          state.currentTrip = action.payload;
        }
      })
      .addCase(createTripWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create trip wallet';
      })
      .addCase(addToTripWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToTripWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        const { tripId, amount } = action.payload;
        const tripIndex = state.trips.findIndex(trip => trip.id === tripId);
        if (tripIndex !== -1) {
          state.trips[tripIndex].balance += amount;
          state.trips[tripIndex].updatedAt = new Date().toISOString();
          
          // Update current trip if it's the same
          if (state.currentTrip?.id === tripId) {
            state.currentTrip.balance = state.trips[tripIndex].balance;
            state.currentTrip.updatedAt = state.trips[tripIndex].updatedAt;
          }
        }
      })
      .addCase(addToTripWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add money to trip wallet';
      })
      .addCase(addTripTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTripTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload);
        
        // Deduct from current trip balance if transaction is for current trip
        if (state.currentTrip && action.payload.tripId === state.currentTrip.id) {
          state.currentTrip.balance -= Math.abs(action.payload.amount);
          
          // Update in trips array as well
          const tripIndex = state.trips.findIndex(t => t.id === state.currentTrip?.id);
          if (tripIndex !== -1) {
            state.trips[tripIndex].balance = state.currentTrip.balance;
          }
        }
      })
      .addCase(addTripTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add trip transaction';
      });
  },
});

export const { setCurrentTrip, clearError, deleteTrip } = tripSlice.actions;
export default tripSlice.reducer;
