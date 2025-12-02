import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Account, PaymentRequest, PaymentResult } from '../../types';
import { databaseService } from '../../libs/db/database';

interface PaymentsState {
  accounts: Account[];
  isLoading: boolean;
  isSendingPayment: boolean;
  error: string | null;
  lastPaymentResult: PaymentResult | null;
}

const initialState: PaymentsState = {
  accounts: [],
  isLoading: false,
  isSendingPayment: false,
  error: null,
  lastPaymentResult: null,
};

export const fetchAccounts = createAsyncThunk(
  'payments/fetchAccounts',
  async () => {
    try {
      // In a real app, this would call the bank adapter
      const accounts = await databaseService.getAccounts();
      return accounts;
    } catch {
      throw new Error('Failed to fetch accounts');
    }
  }
);

export const sendPayment = createAsyncThunk(
  'payments/sendPayment',
  async (_paymentRequest: PaymentRequest) => {
    try {
      // Mock payment processing - replace with actual payment gateway
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
      
      // Simulate 90% success rate
      if (Math.random() > 0.1) {
        const result: PaymentResult = {
          success: true,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        
        // In a real app, you'd save the transaction to the database
        return result;
      } else {
        throw new Error('Payment failed - insufficient funds');
      }
    } catch (error) {
      const result: PaymentResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
      throw result;
    }
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPaymentResult: (state) => {
      state.lastPaymentResult = null;
    },
    addAccount: (state, action: PayloadAction<Account>) => {
      state.accounts.push(action.payload);
    },
    updateAccount: (state, action: PayloadAction<Account>) => {
      const index = state.accounts.findIndex(acc => acc.id === action.payload.id);
      if (index !== -1) {
        state.accounts[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch accounts';
      })
      .addCase(sendPayment.pending, (state) => {
        state.isSendingPayment = true;
        state.error = null;
        state.lastPaymentResult = null;
      })
      .addCase(sendPayment.fulfilled, (state, action) => {
        state.isSendingPayment = false;
        state.lastPaymentResult = action.payload;
      })
      .addCase(sendPayment.rejected, (state, action) => {
        state.isSendingPayment = false;
        if (action.error.message && typeof action.error.message === 'object') {
          state.lastPaymentResult = action.error.message as PaymentResult;
        } else {
          state.error = action.error.message || 'Payment failed';
          state.lastPaymentResult = {
            success: false,
            error: action.error.message || 'Payment failed',
          };
        }
      });
  },
});

export const { clearError, clearPaymentResult, addAccount, updateAccount } = paymentsSlice.actions;
export default paymentsSlice.reducer;
