import { Account, Transaction, AuthToken } from '../types';

// Abstract interface for bank integration
export interface BankAdapter {
  connect(credentials: BankCredentials): Promise<AuthToken>;
  getAccounts(token: string): Promise<Account[]>;
  getTransactions(accountId: string, since: Date, until: Date): Promise<Transaction[]>;
  sendPayment(request: PaymentRequest): Promise<PaymentResult>;
}

export interface BankCredentials {
  username: string;
  password: string;
  // Add other bank-specific fields as needed
}

export interface PaymentRequest {
  toAccountIdentifier: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  status: 'pending' | 'completed' | 'failed';
}

// Mock implementation for development and testing
export class MockBankAdapter implements BankAdapter {
  async connect(credentials: BankCredentials): Promise<AuthToken> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication
    if (credentials.username === 'testuser' && credentials.password === 'testpass') {
      return {
        id: 'mock-token-123',
        token: 'mock-jwt-token-abc123',
        refreshToken: 'mock-refresh-token-def456',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      };
    }

    throw new Error('Invalid credentials');
  }

  async disconnect(token: AuthToken): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock disconnect - in reality would invalidate token
  }

  async getAccounts(token: AuthToken): Promise<Account[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock accounts data
    return [
      {
        id: 'acc_1',
        providerId: 'bank_1',
        maskedAccountNumber: '****1234',
        accountName: 'Checking Account',
        currency: 'USD',
        balance: 5432.10,
        type: 'checking',
        lastSync: new Date(),
      },
      {
        id: 'acc_2',
        providerId: 'bank_1',
        maskedAccountNumber: '****5678',
        accountName: 'Savings Account',
        currency: 'USD',
        balance: 12345.67,
        type: 'savings',
        lastSync: new Date(),
      },
    ];
  }

  async getTransactions(token: AuthToken, accountId: string, since?: Date, until?: Date): Promise<Transaction[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock transaction data
    const mockTransactions: Transaction[] = [
      {
        id: 'txn_1',
        accountId,
        timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        amount: -45.67,
        currency: 'USD',
        merchantName: 'Starbucks',
        type: 'debit',
        status: 'completed',
        rawMeta: { category: 'Food & Drink', location: 'San Francisco' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'txn_2',
        accountId,
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        amount: 1200.00,
        currency: 'USD',
        merchantName: 'Salary Deposit',
        type: 'credit',
        status: 'completed',
        rawMeta: { category: 'Income', source: 'Employer' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'txn_3',
        accountId,
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        amount: -89.99,
        currency: 'USD',
        merchantName: 'Amazon',
        type: 'debit',
        status: 'completed',
        rawMeta: { category: 'Shopping', orderNumber: '123-456789' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Filter by date range if provided
    let filteredTransactions = mockTransactions;
    if (since || until) {
      filteredTransactions = mockTransactions.filter(tx => {
        const txDate = new Date(tx.timestamp);
        if (since && txDate < since) return false;
        if (until && txDate > until) return false;
        return true;
      });
    }

    return filteredTransactions;
  }

  async sendPayment(token: AuthToken, request: PaymentRequest): Promise<PaymentResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock payment processing
    if (request.amount <= 0) {
      return {
        success: false,
        transactionId: null,
        error: 'Invalid amount',
        timestamp: new Date(),
      };
    }

    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      return {
        success: false,
        transactionId: null,
        error: 'Insufficient funds',
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
      error: null,
      timestamp: new Date(),
    };
  }

  private getRandomMerchant(): string {
    const merchants = [
      'Coffee Shop',
      'Grocery Store',
      'Gas Station',
      'Restaurant',
      'Online Shopping',
      'Subscription Service',
      'Utility Company',
      'Salary Deposit',
      'Freelance Payment',
      'Transfer from Friend',
    ];
    return merchants[Math.floor(Math.random() * merchants.length)];
  }

  private getRandomCategory(): string {
    const categories = [
      'Food & Drink',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Bills & Utilities',
      'Income',
      'Transfer',
      'Healthcare',
    ];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private getRandomTag(): string {
    const tags = ['essential', 'discretionary', 'recurring', 'one-time', 'business', 'personal'];
    return tags[Math.floor(Math.random() * tags.length)];
  }
}

// Production implementation would extend this interface
export class ProductionBankAdapter implements BankAdapter {
  // This would integrate with real banking APIs like:
  // - Plaid
  // - Stripe Connect
  // - Bank-specific APIs
  // - Payment processors

  async connect(credentials: BankCredentials): Promise<AuthToken> {
    // Implement real bank connection
    throw new Error('Production adapter not implemented');
  }

  async getAccounts(token: string): Promise<Account[]> {
    // Implement real account fetching
    throw new Error('Production adapter not implemented');
  }

  async getTransactions(accountId: string, since: Date, until: Date): Promise<Transaction[]> {
    // Implement real transaction fetching
    throw new Error('Production adapter not implemented');
  }

  async sendPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Implement real payment sending
    throw new Error('Production adapter not implemented');
  }
}

// Factory to get the appropriate adapter
export class BankAdapterFactory {
  static createAdapter(environment: 'mock' | 'production' = 'mock'): BankAdapter {
    switch (environment) {
      case 'mock':
        return new MockBankAdapter();
      case 'production':
        return new ProductionBankAdapter();
      default:
        return new MockBankAdapter();
    }
  }
}

// Export singleton instance
export const bankAdapter = BankAdapterFactory.createAdapter(
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ? 'production' : 'mock'
);
