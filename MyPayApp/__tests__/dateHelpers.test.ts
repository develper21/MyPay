import { 
  getCurrentMonthISO, 
  formatCurrency, 
  convertUTCToLocal, 
  groupTransactionsByDay,
  getMonthSummary,
  getTransactionsForDate,
  getTransactionsForMonth 
} from '../src/utils/dateHelpers';
import { Transaction } from '../src/types';

describe('dateHelpers', () => {
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      accountId: 'acc1',
      timestamp: '2025-12-01T10:00:00.000Z',
      amount: -25.50,
      currency: 'USD',
      merchantName: 'Coffee Shop',
      type: 'debit',
      status: 'completed',
      rawMeta: { category: 'Food' },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      accountId: 'acc1',
      timestamp: '2025-12-01T15:30:00.000Z',
      amount: 1200.00,
      currency: 'USD',
      merchantName: 'Salary',
      type: 'credit',
      status: 'completed',
      rawMeta: { category: 'Income' },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      accountId: 'acc1',
      timestamp: '2025-12-02T08:00:00.000Z',
      amount: -50.00,
      currency: 'USD',
      merchantName: 'Grocery Store',
      type: 'debit',
      status: 'completed',
      rawMeta: { category: 'Food' },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe('getCurrentMonthISO', () => {
    it('should return current month in ISO format', () => {
      const result = getCurrentMonthISO();
      expect(result).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('formatCurrency', () => {
    it('should format positive amounts correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format negative amounts correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('should format zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle different currencies', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
    });
  });

  describe('convertUTCToLocal', () => {
    it('should convert UTC timestamp to local date', () => {
      const utcTimestamp = '2025-12-01T10:00:00.000Z';
      const result = convertUTCToLocal(utcTimestamp);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('groupTransactionsByDay', () => {
    it('should group transactions by day correctly', () => {
      const result = groupTransactionsByDay(mockTransactions);
      
      expect(Object.keys(result)).toHaveLength(2);
      expect(result['2025-12-01']).toBeDefined();
      expect(result['2025-12-02']).toBeDefined();
    });

    it('should calculate daily totals correctly', () => {
      const result = groupTransactionsByDay(mockTransactions);
      
      // Dec 1: -25.50 + 1200.00 = 1174.50
      expect(result['2025-12-01'].total).toBe(1174.50);
      expect(result['2025-12-01'].count).toBe(2);
      expect(result['2025-12-01'].creditTotal).toBe(1200.00);
      expect(result['2025-12-01'].debitTotal).toBe(25.50);
      
      // Dec 2: -50.00
      expect(result['2025-12-02'].total).toBe(-50.00);
      expect(result['2025-12-02'].count).toBe(1);
      expect(result['2025-12-02'].creditTotal).toBe(0);
      expect(result['2025-12-02'].debitTotal).toBe(50.00);
    });

    it('should handle empty transactions array', () => {
      const result = groupTransactionsByDay([]);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('getMonthSummary', () => {
    it('should calculate month summary correctly', () => {
      const dayTotals = groupTransactionsByDay(mockTransactions);
      const result = getMonthSummary(dayTotals);
      
      expect(result.totalSpent).toBe(75.50); // 25.50 + 50.00
      expect(result.totalReceived).toBe(1200.00);
      expect(result.net).toBe(1124.50); // 1200.00 - 75.50
      expect(result.transactionCount).toBe(3);
    });

    it('should handle empty dayTotals', () => {
      const result = getMonthSummary({});
      expect(result.totalSpent).toBe(0);
      expect(result.totalReceived).toBe(0);
      expect(result.net).toBe(0);
      expect(result.transactionCount).toBe(0);
    });
  });

  describe('getTransactionsForDate', () => {
    it('should return transactions for specific date', () => {
      const result = getTransactionsForDate(mockTransactions, '2025-12-01');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('2'); // Should be sorted by timestamp descending
      expect(result[1].id).toBe('1');
    });

    it('should return empty array for date with no transactions', () => {
      const result = getTransactionsForDate(mockTransactions, '2025-12-03');
      expect(result).toHaveLength(0);
    });
  });

  describe('getTransactionsForMonth', () => {
    it('should return transactions for specific month', () => {
      const result = getTransactionsForMonth(mockTransactions, '2025-12');
      expect(result).toHaveLength(3);
    });

    it('should return empty array for month with no transactions', () => {
      const result = getTransactionsForMonth(mockTransactions, '2025-11');
      expect(result).toHaveLength(0);
    });
  });
});
