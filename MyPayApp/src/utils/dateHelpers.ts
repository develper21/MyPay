import { format, parseISO, isWithinInterval } from 'date-fns';
import { Transaction, DayTotal } from '../types';

export const getCurrentMonthISO = (): string => {
  return format(new Date(), 'yyyy-MM');
};

export const formatDateToISO = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const convertUTCToLocal = (utcTimestamp: string): Date => {
  const utcDate = parseISO(utcTimestamp);
  // #region UTC DATE
  return utcDate;
};

export const groupTransactionsByDay = (transactions: Transaction[]): Record<string, DayTotal> => {
  const dayTotals: Record<string, DayTotal> = {};

  transactions.forEach(transaction => {
    const localDate = convertUTCToLocal(transaction.timestamp);
    const dateKey = formatDateToISO(localDate);

    if (!dayTotals[dateKey]) {
      dayTotals[dateKey] = {
        date: dateKey,
        total: 0,
        count: 0,
        creditTotal: 0,
        debitTotal: 0,
      };
    }

    const dayTotal = dayTotals[dateKey];
    dayTotal.total += transaction.amount;
    dayTotal.count += 1;

    if (transaction.type === 'credit' || transaction.type === 'refund') {
      dayTotal.creditTotal += Math.abs(transaction.amount);
    } else {
      dayTotal.debitTotal += Math.abs(transaction.amount);
    }
  });

  return dayTotals;
};

export const getMonthSummary = (dayTotals: Record<string, DayTotal>) => {
  let totalSpent = 0;
  let totalReceived = 0;
  let transactionCount = 0;

  Object.values(dayTotals).forEach(day => {
    totalSpent += day.debitTotal;
    totalReceived += day.creditTotal;
    transactionCount += day.count;
  });

  return {
    totalSpent,
    totalReceived,
    net: totalReceived - totalSpent,
    transactionCount,
  };
};

export const getTransactionsForDate = (transactions: Transaction[], date: string): Transaction[] => {
  return transactions.filter(transaction => {
    const localDate = convertUTCToLocal(transaction.timestamp);
    const dateKey = formatDateToISO(localDate);
    return dateKey === date;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getTransactionsForMonth = (transactions: Transaction[], monthISO: string): Transaction[] => {
  const [year, month] = monthISO.split('-').map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  return transactions.filter(transaction => {
    const localDate = convertUTCToLocal(transaction.timestamp);
    return isWithinInterval(localDate, { start: monthStart, end: monthEnd });
  });
};
