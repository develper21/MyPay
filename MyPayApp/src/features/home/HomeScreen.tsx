import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchAccounts } from '../payments/paymentsSlice';
import { syncTransactions } from '../../history/historySlice';
import { RootState, AppDispatch } from '../../store/store';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import QRScanner from '../../components/ui/QRScanner';
import { formatCurrency } from '../../utils/dateHelpers';
import Icon from 'react-native-vector-icons/MaterialIcons';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { accounts, isLoading: accountsLoading } = useSelector((state: RootState) => state.payments);
  const { transactions, isLoading: transactionsLoading, monthSummary } = useSelector((state: RootState) => state.history);
  const { user } = useSelector((state: RootState) => state.auth);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const fadeAnim = new Animated.Value(0);

  const isLoading = accountsLoading || transactionsLoading;

  const handleRefresh = React.useCallback(() => {
    dispatch(fetchAccounts());
    dispatch(syncTransactions());
  }, [dispatch]);

  useEffect(() => {
    handleRefresh();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [handleRefresh]);

  const totalBalance = accounts.reduce((sum, _account) => {
    // In a real app, you'd calculate actual balance from transactions
    return sum + 2500; // Mock balance
  }, 0);

  const recentTransactions = transactions.slice(0, 5);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeLeft}>
              <Icon name="wb-sunny" size={24} color="#FFA500" />
              <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
            </View>
            <View style={styles.welcomeRight}>
            <View style={styles.avatar}>
              <Icon name="person" size={30} color="#1976d2" />
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.balanceCard, { opacity: fadeAnim }]}>
        <View style={styles.balanceHeader}>
          <Icon name="account-balance-wallet" size={28} color="#1976d2" />
          <Text style={styles.balanceLabel}>Total Balance</Text>
        </View>
        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
        <Text style={styles.balanceSubtext}>Across {accounts.length} accounts</Text>
        <View style={styles.balanceActions}>
          <TouchableOpacity style={styles.balanceAction}>
            <Icon name="add-circle-outline" size={24} color="#4caf50" />
            <Text style={styles.balanceActionText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.balanceAction}>
            <Icon name="history" size={24} color="#FF9800" />
            <Text style={styles.balanceActionText}>History</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <Button
            title="Send Money"
            onPress={() => {}}
            style={styles.actionButton}
          />
          <Button
            title="Scan & Pay"
            onPress={() => setShowQRScanner(true)}
            style={styles.actionButton}
          />
        </View>
        <View style={styles.actionButtons}>
          <Button
            title="Trip Goals"
            variant="secondary"
            onPress={() => navigation.navigate('TripGoals')}
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
      <QRScanner
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={(data) => {
          console.log('QR Code Scanned:', data);
          // Handle QR scan result
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  welcomeRight: {
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  balanceSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceAction: {
    alignItems: 'center',
  },
  balanceActionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
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
