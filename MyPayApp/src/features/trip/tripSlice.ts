import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface TripGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  description?: string;
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
  goals: TripGoal[];
  transactions: TripTransaction[];
  currentGoal: TripGoal | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TripState = {
  goals: [],
  transactions: [],
  currentGoal: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const createTripGoal = createAsyncThunk(
  'trip/createGoal',
  async (goalData: Omit<TripGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: TripGoal = {
      ...goalData,
      id: `trip_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // In a real app, save to backend/database
    return newGoal;
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

export const updateTripGoalAmount = createAsyncThunk(
  'trip/updateGoalAmount',
  async ({ goalId, amount }: { goalId: string; amount: number }) => {
    // In a real app, update in backend/database
    return { goalId, amount };
  }
);

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setCurrentGoal: (state, action: PayloadAction<TripGoal | null>) => {
      state.currentGoal = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    deleteGoal: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter(goal => goal.id !== action.payload);
      if (state.currentGoal?.id === action.payload) {
        state.currentGoal = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTripGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTripGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goals.push(action.payload);
        if (state.goals.length === 1) {
          state.currentGoal = action.payload;
        }
      })
      .addCase(createTripGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create trip goal';
      })
      .addCase(addTripTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTripTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload);
        
        // Update current goal amount if transaction is for current goal
        if (state.currentGoal && action.payload.tripId === state.currentGoal.id) {
          state.currentGoal.currentAmount += action.payload.amount;
          
          // Update in goals array as well
          const goalIndex = state.goals.findIndex(g => g.id === state.currentGoal?.id);
          if (goalIndex !== -1) {
            state.goals[goalIndex].currentAmount = state.currentGoal.currentAmount;
          }
        }
      })
      .addCase(addTripTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add trip transaction';
      })
      .addCase(updateTripGoalAmount.fulfilled, (state, action) => {
        const { goalId, amount } = action.payload;
        const goalIndex = state.goals.findIndex(goal => goal.id === goalId);
        if (goalIndex !== -1) {
          state.goals[goalIndex].currentAmount = amount;
          if (state.currentGoal?.id === goalId) {
            state.currentGoal.currentAmount = amount;
          }
        }
      });
  },
});

export const { setCurrentGoal, clearError, deleteGoal } = tripSlice.actions;
export default tripSlice.reducer;
