import { Transaction } from '../types';
import { databaseService } from '../libs/db/database';
import { getTransactionsForMonth, groupTransactionsByDay } from '../utils/dateHelpers';

export class HistoryService {
  /**
   * Fetch transactions for a specific month from local database
   */
  async fetchTransactionsForMonth(monthISO: string): Promise<Transaction[]> {
    try {
      const transactions = await databaseService.getTransactionsForMonth(monthISO);
      return transactions;
    } catch (error) {
      console.error('Failed to fetch transactions for month:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  /**
   * Sync transactions from bank adapter and save to local database
   */
  async syncTransactionsFromBank(): Promise<Transaction[]> {
    try {
      // In a real implementation, this would:
      // 1. Call bankAdapter.getTransactions() for all accounts
      // 2. Compare with existing local transactions
      // 3. Save only new/updated transactions
      // 4. Handle duplicates and conflicts

      // For now, return empty array (sync is handled in slice)
      return [];
    } catch (error) {
      console.error('Failed to sync transactions from bank:', error);
      throw new Error('Failed to sync transactions');
    }
  }

  /**
   * Export transactions for a month as CSV
   */
  async exportTransactionsToCSV(monthISO: string): Promise<string> {
    try {
      const transactions = await this.fetchTransactionsForMonth(monthISO);
      
      if (transactions.length === 0) {
        throw new Error('No transactions to export');
      }

      // CSV header
      const headers = [
        'Date',
        'Merchant',
        'Type',
        'Amount',
        'Currency',
        'Status',
        'Category'
      ];

      // CSV rows
      const rows = transactions.map(transaction => {
        const date = new Date(transaction.timestamp).toLocaleDateString();
        const merchant = transaction.merchantName || 'Unknown';
        const type = transaction.type;
        const amount = Math.abs(transaction.amount).toFixed(2);
        const currency = transaction.currency;
        const status = transaction.status;
        const category = transaction.rawMeta?.category || 'Uncategorized';

        return [
          `"${date}"`,
          `"${merchant}"`,
          `"${type}"`,
          amount,
          currency,
          `"${status}"`,
          `"${category}"`
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      return csvContent;
    } catch (error) {
      console.error('Failed to export transactions to CSV:', error);
      throw new Error('Failed to export transactions');
    }
  }

  /**
   * Get transaction statistics for a month
   */
  async getMonthlyStatistics(monthISO: string) {
    try {
      const transactions = await this.fetchTransactionsForMonth(monthISO);
      const dayTotals = groupTransactionsByDay(transactions);

      const totalSpent = Object.values(dayTotals).reduce((sum, day) => sum + day.debitTotal, 0);
      const totalReceived = Object.values(dayTotals).reduce((sum, day) => sum + day.creditTotal, 0);
      const transactionCount = transactions.length;

      // Category breakdown
      const categoryBreakdown = transactions.reduce((acc, transaction) => {
        const category = transaction.rawMeta?.category || 'Uncategorized';
        const amount = Math.abs(transaction.amount);
        
        if (!acc[category]) {
          acc[category] = { count: 0, total: 0 };
        }
        
        acc[category].count += 1;
        acc[category].total += amount;
        
        return acc;
      }, {} as Record<string, { count: number; total: number }>);

      // Daily averages
      const daysWithTransactions = Object.keys(dayTotals).length;
      const avgDailySpending = daysWithTransactions > 0 ? totalSpent / daysWithTransactions : 0;
      const avgDailyReceived = daysWithTransactions > 0 ? totalReceived / daysWithTransactions : 0;

      return {
        totalSpent,
        totalReceived,
        net: totalReceived - totalSpent,
        transactionCount,
        daysWithTransactions,
        avgDailySpending,
        avgDailyReceived,
        categoryBreakdown,
      };
    } catch (error) {
      console.error('Failed to get monthly statistics:', error);
      throw new Error('Failed to get statistics');
    }
  }

  /**
   * Search transactions by merchant name or category
   */
  async searchTransactions(query: string, monthISO?: string): Promise<Transaction[]> {
    try {
      const transactions = monthISO 
        ? await this.fetchTransactionsForMonth(monthISO)
        : await databaseService.getTransactions();

      const lowercaseQuery = query.toLowerCase();
      
      return transactions.filter(transaction => {
        const merchantMatch = transaction.merchantName?.toLowerCase().includes(lowercaseQuery);
        const categoryMatch = transaction.rawMeta?.category?.toLowerCase().includes(lowercaseQuery);
        const typeMatch = transaction.type.toLowerCase().includes(lowercaseQuery);
        
        return merchantMatch || categoryMatch || typeMatch;
      });
    } catch (error) {
      console.error('Failed to search transactions:', error);
      throw new Error('Failed to search transactions');
    }
  }

  /**
   * Get transactions for a specific date range
   */
  async getTransactionsForDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    try {
      // Convert dates to ISO strings for database query
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      // This would need to be implemented in the database service
      // For now, we'll fetch all transactions and filter in memory
      const allTransactions = await databaseService.getTransactions();
      
      return allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.timestamp);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    } catch (error) {
      console.error('Failed to get transactions for date range:', error);
      throw new Error('Failed to get transactions for date range');
    }
  }
}

export const historyService = new HistoryService();
