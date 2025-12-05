export interface Account {
  id: string;
  providerId: string;
  maskedAccountNumber: string;
  accountName: string;
  currency: string;
  type?: 'checking' | 'savings' | 'credit' | 'other';
  lastSync: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  timestamp: string; // ISO8601
  amount: number; // positive for outgoing or incoming with sign
  currency: string;
  merchantName: string | null;
  type: 'debit' | 'credit' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  rawMeta: Record<string, any>;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

export interface AuthToken {
  id: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface DayTotal {
  date: string; // YYYY-MM-DD
  total: number;
  count: number;
  creditTotal: number;
  debitTotal: number;
}

export interface MonthSummary {
  month: string; // YYYY-MM
  totalSpent: number;
  totalReceived: number;
  net: number;
  transactionCount: number;
}

export interface PaymentRequest {
  toAccountId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

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
