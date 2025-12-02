import { Account, Transaction, AuthToken } from '../types';

// Declare process for React Native compatibility
declare const process: { env?: { NODE_ENV?: string } } | undefined;

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
}

export interface PaymentRequest {
  toAccountIdentifier: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string | null;
  error?: string | null;
  status: 'pending' | 'completed' | 'failed';
}

// Mock implementation for development and testing
export class MockBankAdapter implements BankAdapter {
  async connect(credentials: BankCredentials): Promise<AuthToken> {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));

    if (credentials.username === 'testuser' && credentials.password === 'testpass') {
      return {
        id: 'mock-token-123',
        token: 'mock-jwt-token-abc123',
        refreshToken: 'mock-refresh-token-def456',
        expiresAt: new Date(Date.now() + 3600000),
      };
    }

    throw new Error('Invalid credentials');
  }

  async disconnect(_token: string): Promise<void> {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
  }

  async getAccounts(_token: string): Promise<Account[]> {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));

    return [
      {
        id: 'acc_1',
        providerId: 'bank_1',
        maskedAccountNumber: '****1234',
        accountName: 'Checking Account',
        currency: 'USD',
        type: 'checking',
        lastSync: new Date(),
      },
      {
        id: 'acc_2',
        providerId: 'bank_1',
        maskedAccountNumber: '****5678',
        accountName: 'Savings Account',
        currency: 'USD',
        type: 'savings',
        lastSync: new Date(),
      },
    ];
  }

  async getTransactions(_accountId: string, _since: Date, _until: Date): Promise<Transaction[]> {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));

    const mockTransactions: Transaction[] = [
      {
        id: 'txn_1',
        accountId: 'acc_1',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
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
        accountId: 'acc_1',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        amount: 1200.00,
        currency: 'USD',
        merchantName: 'Salary Deposit',
        type: 'credit',
        status: 'completed',
        rawMeta: { category: 'Income', source: 'Employer' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return mockTransactions;
  }

  async sendPayment(_request: PaymentRequest): Promise<PaymentResult> {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));

    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
      error: null,
      status: 'completed',
    };
  }
}

// Production adapter (to be implemented with real bank API)
export class ProductionBankAdapter implements BankAdapter {
  async connect(_credentials: BankCredentials): Promise<AuthToken> {
    throw new Error('Production adapter not implemented');
  }

  async disconnect(_token: string): Promise<void> {
    throw new Error('Production adapter not implemented');
  }

  async getAccounts(_token: string): Promise<Account[]> {
    throw new Error('Production adapter not implemented');
  }

  async getTransactions(_accountId: string, _since: Date, _until: Date): Promise<Transaction[]> {
    throw new Error('Production adapter not implemented');
  }

  async sendPayment(_request: PaymentRequest): Promise<PaymentResult> {
    throw new Error('Production adapter not implemented');
  }
}

// Factory function to get the appropriate adapter
export function getBankAdapter(): BankAdapter {
  // In React Native, process is not available; default to mock adapter for development
  try {
    // Try to access process (available in Node.js environments)
    const env = (typeof process !== 'undefined' && process.env?.NODE_ENV) || 'development';
    return env === 'production' ? new ProductionBankAdapter() : new MockBankAdapter();
  } catch {
    // In React Native or browser environments, default to mock adapter
    return new MockBankAdapter();
  }
}

export const bankAdapter = getBankAdapter();
