import SQLite from 'react-native-sqlite-storage';
import { Account, Transaction } from '../../types';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

export class DatabaseService {
  private database: SQLite.SQLiteDatabase | null = null;

  async initDatabase(): Promise<void> {
    try {
      this.database = await SQLite.openDatabase({
        name: 'MyPayApp.db',
        location: 'default',
      });

      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const createAccountsTable = `
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        providerId TEXT NOT NULL,
        maskedAccountNumber TEXT NOT NULL,
        accountName TEXT NOT NULL,
        currency TEXT NOT NULL,
        lastSync TEXT NOT NULL
      );
    `;

    const createTransactionsTable = `
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        accountId TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        merchantName TEXT,
        type TEXT NOT NULL CHECK(type IN ('debit', 'credit', 'refund')),
        status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'failed')),
        rawMeta TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (accountId) REFERENCES accounts (id)
      );
    `;

    await this.database.executeSql(createAccountsTable);
    await this.database.executeSql(createTransactionsTable);
  }

  async insertAccount(account: Account): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO accounts 
      (id, providerId, maskedAccountNumber, accountName, currency, lastSync)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      account.id,
      account.providerId,
      account.maskedAccountNumber,
      account.accountName,
      account.currency,
      account.lastSync.toISOString(),
    ];

    await this.database.executeSql(query, params);
  }

  async getAccounts(): Promise<Account[]> {
    if (!this.database) throw new Error('Database not initialized');

    const query = 'SELECT * FROM accounts ORDER BY accountName';
    const [results] = await this.database.executeSql(query);

    const accounts: Account[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      accounts.push({
        id: row.id,
        providerId: row.providerId,
        maskedAccountNumber: row.maskedAccountNumber,
        accountName: row.accountName,
        currency: row.currency,
        lastSync: new Date(row.lastSync),
      });
    }

    return accounts;
  }

  async insertTransaction(transaction: Transaction): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO transactions 
      (id, accountId, timestamp, amount, currency, merchantName, type, status, rawMeta, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      transaction.id,
      transaction.accountId,
      transaction.timestamp,
      transaction.amount,
      transaction.currency,
      transaction.merchantName,
      transaction.type,
      transaction.status,
      JSON.stringify(transaction.rawMeta),
      transaction.createdAt.toISOString(),
      transaction.updatedAt.toISOString(),
    ];

    await this.database.executeSql(query, params);
  }

  async getTransactions(accountId?: string, limit = 100): Promise<Transaction[]> {
    if (!this.database) throw new Error('Database not initialized');

    let query = 'SELECT * FROM transactions';
    const params: any[] = [];

    if (accountId) {
      query += ' WHERE accountId = ?';
      params.push(accountId);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    const [results] = await this.database.executeSql(query, params);

    const transactions: Transaction[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      transactions.push({
        id: row.id,
        accountId: row.accountId,
        timestamp: row.timestamp,
        amount: row.amount,
        currency: row.currency,
        merchantName: row.merchantName,
        type: row.type,
        status: row.status,
        rawMeta: JSON.parse(row.rawMeta || '{}'),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      });
    }

    return transactions;
  }

  async getTransactionsForMonth(monthISO: string, accountId?: string): Promise<Transaction[]> {
    if (!this.database) throw new Error('Database not initialized');

    const [year, month] = monthISO.split('-');
    const startDate = `${year}-${month}-01T00:00:00.000Z`;
    const endDate = `${year}-${month}-31T23:59:59.999Z`;

    let query = `
      SELECT * FROM transactions 
      WHERE timestamp >= ? AND timestamp <= ?
    `;
    const params = [startDate, endDate];

    if (accountId) {
      query += ' AND accountId = ?';
      params.push(accountId);
    }

    query += ' ORDER BY timestamp DESC';

    const [results] = await this.database.executeSql(query, params);

    const transactions: Transaction[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      transactions.push({
        id: row.id,
        accountId: row.accountId,
        timestamp: row.timestamp,
        amount: row.amount,
        currency: row.currency,
        merchantName: row.merchantName,
        type: row.type,
        status: row.status,
        rawMeta: JSON.parse(row.rawMeta || '{}'),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      });
    }

    return transactions;
  }

  async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = null;
    }
  }
}

export const databaseService = new DatabaseService();
