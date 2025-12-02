import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, MonthSummary, DayTotal } from '../types';
import { groupTransactionsByDay } from '../utils/dateHelpers';
import { databaseService } from '../libs/db/database';
import { getCurrentMonthISO } from '../utils/dateHelpers';

interface HistoryState {
  transactions: Transaction[];
  dayTotals: Record<string, DayTotal>;
  monthSummary: MonthSummary;
  currentMonth: string;
  isLoading: boolean;
  error: string | null;
  selectedDate: string | null;
}

export const getMonthSummary = (dayTotals: Record<string, DayTotal>): MonthSummary => {
  let totalSpent = 0;
  let totalReceived = 0;
  let transactionCount = 0;

  Object.values(dayTotals).forEach(day => {
    totalSpent += day.debitTotal;
    totalReceived += day.creditTotal;
    transactionCount += day.count;
  });

  return {
    month: getCurrentMonthISO(),
    totalSpent,
    totalReceived,
    net: totalReceived - totalSpent,
    transactionCount,
  };
};

const initialState: HistoryState = {
  transactions: [],
  dayTotals: {},
  monthSummary: getMonthSummary({}),
  currentMonth: getCurrentMonthISO(),
  isLoading: false,
  error: null,
  selectedDate: null,
};

export const fetchTransactionsForMonth = createAsyncThunk(
  'history/fetchTransactionsForMonth',
  async (monthISO: string) => {
    try {
      const transactions = await databaseService.getTransactionsForMonth(monthISO);
      return transactions;
    } catch {
      throw new Error('Failed to fetch transactions');
    }
  }
);

export const syncTransactions = createAsyncThunk(
  'history/syncTransactions',
  async () => {
    try {
      // Mock sync - in real app, this would call bank adapter
      // and sync new transactions from the bank
      const existingTransactions = await databaseService.getTransactions();
      
      // Simulate adding some new transactions
      const newTransactions: Transaction[] = [
        {
          id: `txn_${Date.now()}_1`,
          accountId: 'acc_1',
          timestamp: new Date().toISOString(),
          amount: -25.50,
          currency: 'USD',
          merchantName: 'Coffee Shop',
          type: 'debit',
          status: 'completed',
          rawMeta: { category: 'Food & Drink' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `txn_${Date.now()}_2`,
          accountId: 'acc_1',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          amount: 1200.00,
          currency: 'USD',
          merchantName: 'Salary Deposit',
          type: 'credit',
          status: 'completed',
          rawMeta: { category: 'Income' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Save new transactions to database
      for (const transaction of newTransactions) {
        await databaseService.insertTransaction(transaction);
      }

      return [...existingTransactions, ...newTransactions];
    } catch {
      throw new Error('Failed to sync transactions');
    }
  }
);

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setCurrentMonth: (state, action: PayloadAction<string>) => {
      state.currentMonth = action.payload;
      state.selectedDate = null;
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
      // Recalculate day totals and month summary
      state.dayTotals = groupTransactionsByDay(state.transactions);
      state.monthSummary = getMonthSummary(state.dayTotals);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionsForMonth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsForMonth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        state.dayTotals = groupTransactionsByDay(action.payload);
        state.monthSummary = {
          month: state.currentMonth,
          totalSpent: 0,
          totalReceived: 0,
          net: 0,
          transactionCount: 0,
        };
      })
      .addCase(fetchTransactionsForMonth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
        state.monthSummary = {
          month: '',
          totalSpent: 0,
          totalReceived: 0,
          net: 0,
          transactionCount: 0,
        };
      })
      .addCase(syncTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        state.dayTotals = groupTransactionsByDay(action.payload);
        state.monthSummary = getMonthSummary(state.dayTotals);
      })
      .addCase(syncTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to sync transactions';
      });
  },
});

export const { setCurrentMonth, setSelectedDate, clearError, addTransaction } = historySlice.actions;
export default historySlice.reducer;
