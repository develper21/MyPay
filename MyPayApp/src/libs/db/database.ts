import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account, Transaction } from '../../types';

export class DatabaseService {
  private readonly ACCOUNTS_KEY = 'mypay_accounts';
  private readonly TRANSACTIONS_KEY = 'mypay_transactions';

  async initDatabase(): Promise<void> {
    try {
      console.log('Database initialized successfully with AsyncStorage');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async insertAccount(account: Account): Promise<void> {
    try {
      const accounts = await this.getAccounts();
      const existingIndex = accounts.findIndex(acc => acc.id === account.id);
      
      if (existingIndex >= 0) {
        accounts[existingIndex] = account;
      } else {
        accounts.push(account);
      }
      
      await AsyncStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (error) {
      console.error('Failed to insert account:', error);
      throw error;
    }
  }

  async getAccounts(): Promise<Account[]> {
    try {
      const data = await AsyncStorage.getItem(this.ACCOUNTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get accounts:', error);
      return [];
    }
  }

  async insertTransaction(transaction: Transaction): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const existingIndex = transactions.findIndex(tx => tx.id === transaction.id);
      
      if (existingIndex >= 0) {
        transactions[existingIndex] = transaction;
      } else {
        transactions.push(transaction);
      }
      
      await AsyncStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to insert transaction:', error);
      throw error;
    }
  }

  async getTransactions(accountId?: string, limit = 100): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(this.TRANSACTIONS_KEY);
      let transactions: Transaction[] = data ? JSON.parse(data) : [];
      
      if (accountId) {
        transactions = transactions.filter(tx => tx.accountId === accountId);
      }
      
      return transactions
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get transactions:', error);
      return [];
    }
  }

  async getTransactionsForMonth(monthISO: string, accountId?: string): Promise<Transaction[]> {
    try {
      const [year, month] = monthISO.split('-');
      const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-${month}-31T23:59:59.999Z`);
      
      const transactions = await this.getTransactions();
      
      return transactions
        .filter(tx => {
          const txDate = new Date(tx.timestamp);
          const matchesAccount = !accountId || tx.accountId === accountId;
          const matchesDate = txDate >= startDate && txDate <= endDate;
          return matchesAccount && matchesDate;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Failed to get transactions for month:', error);
      return [];
    }
  }

  async closeDatabase(): Promise<void> {
    console.log('Database connection closed');
  }
}

export const databaseService = new DatabaseService();
