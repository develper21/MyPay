import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccounts } from '../payments/paymentsSlice';
import { syncTransactions } from '../../history/historySlice';
import { RootState } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/dateHelpers';

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { accounts, isLoading: accountsLoading } = useSelector((state: RootState) => state.payments);
  const { transactions, isLoading: transactionsLoading, monthSummary } = useSelector((state: RootState) => state.history);
  const { user } = useSelector((state: RootState) => state.auth);

  const isLoading = accountsLoading || transactionsLoading;

  const handleRefresh = () => {
    dispatch(fetchAccounts());
    dispatch(syncTransactions());
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const totalBalance = accounts.reduce((sum, account) => {
    // In a real app, you'd calculate actual balance from transactions
    return sum + 2500; // Mock balance
  }, 0);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name}</Text>
      </View>

      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
        <Text style={styles.balanceSubtext}>Across {accounts.length} accounts</Text>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <Button
            title="Send Money"
            onPress={() => {}}
            style={styles.actionButton}
          />
          <Button
            title="Request Money"
            variant="secondary"
            onPress={() => {}}
            style={styles.actionButton}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <Card key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <Text style={styles.merchantName}>
                  {transaction.merchantName || 'Transaction'}
                </Text>
                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.type === 'credit' ? styles.credit : styles.debit,
                  ]}
                >
                  {transaction.type === 'credit' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </Text>
              </View>
              <Text style={styles.transactionDate}>
                {new Date(transaction.timestamp).toLocaleDateString()}
              </Text>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No recent transactions</Text>
          </Card>
        )}
      </View>

      {monthSummary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Spent</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(monthSummary.totalSpent)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Received</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(monthSummary.totalReceived)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowBorder]}>
              <Text style={styles.summaryLabel}>Net</Text>
              <Text
                style={[
                  styles.summaryValue,
                  monthSummary.net >= 0 ? styles.credit : styles.debit,
                ]}
              >
                {monthSummary.net >= 0 ? '+' : ''}
                {formatCurrency(monthSummary.net)}
              </Text>
            </View>
          </Card>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 18,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    padding: 24,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  transactionCard: {
    marginHorizontal: 20,
    marginBottom: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  credit: {
    color: '#4caf50',
  },
  debit: {
    color: '#d32f2f',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyCard: {
    marginHorizontal: 20,
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  summaryCard: {
    marginHorizontal: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  summaryRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default HomeScreen;
