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
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchAccounts } from '../payments/paymentsSlice';
import { syncTransactions } from '../../history/historySlice';
import { RootState, AppDispatch } from '../../store/store';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientCard from '../../components/ui/GradientCard';
import QRScanner from '../../components/ui/QRScanner';
import { formatCurrency } from '../../utils/dateHelpers';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { accounts, isLoading: accountsLoading } = useSelector((state: RootState) => state.payments);
  const { transactions, isLoading: transactionsLoading, monthSummary } = useSelector((state: RootState) => state.history);
  const { user } = useSelector((state: RootState) => state.auth);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  const isLoading = accountsLoading || transactionsLoading;

  const handleRefresh = React.useCallback(() => {
    dispatch(fetchAccounts());
    dispatch(syncTransactions());
  }, [dispatch]);

  useEffect(() => {
    handleRefresh();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
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
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.headerTop}>
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={20} color={colors.textSecondary} />
              <Text style={styles.locationText}>Mumbai, India</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Icon name="notifications-none" size={24} color={colors.text} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
        </Animated.View>

        {/* Balance Card with Gradient */}
        <Animated.View style={[styles.balanceCardContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <GradientCard gradientColors={['#6366F1', '#8B5CF6']} padding={0}>
            <View style={styles.balanceContent}>
              <View style={styles.balanceHeader}>
                <View style={styles.balanceTitleRow}>
                  <Icon name="account-balance-wallet" size={32} color="#FFFFFF" />
                  <Text style={styles.balanceLabel}>Total Balance</Text>
                </View>
                <TouchableOpacity style={styles.eyeBtn}>
                  <Icon name="visibility" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
              <Text style={styles.balanceSubtext}>Across {accounts.length} accounts</Text>
              
              <View style={styles.balanceActions}>
                <TouchableOpacity style={styles.balanceAction}>
                  <View style={styles.actionIcon}>
                    <Icon name="add" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.balanceActionText}>Add Money</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.balanceAction}>
                  <View style={styles.actionIcon}>
                    <Icon name="history" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.balanceActionText}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.balanceAction}>
                  <View style={styles.actionIcon}>
                    <Icon name="download" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.balanceActionText}>Withdraw</Text>
                </TouchableOpacity>
              </View>
            </View>
          </GradientCard>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Icon name="send" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Send Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Icon name="qr-code-scanner" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Scan & Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Icon name="request" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Icon name="phone-android" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Recharge</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

      {/* Recent Transactions */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => {/* Navigate to history */}}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <Card key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionLeft}>
                    <View style={styles.transactionIcon}>
                      <Icon 
                        name={transaction.type === 'credit' ? 'arrow-downward' : 'arrow-upward'} 
                        size={20} 
                        color={transaction.type === 'credit' ? colors.secondary : colors.danger} 
                      />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.merchantName}>
                        {transaction.merchantName || 'Transaction'}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
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
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Icon name="receipt-long" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No recent transactions</Text>
              <Text style={styles.emptySubtext}>Your transactions will appear here</Text>
            </Card>
          )}
        </Animated.View>

        {/* Monthly Summary */}
        {monthSummary && (
          <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.sectionTitle}>This Month</Text>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Monthly Overview</Text>
                <TouchableOpacity>
                  <Icon name="more-vert" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Spent</Text>
                  <Text style={styles.summaryValueSpent}>
                    {formatCurrency(monthSummary.totalSpent)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Received</Text>
                  <Text style={styles.summaryValueReceived}>
                    {formatCurrency(monthSummary.totalReceived)}
                  </Text>
                </View>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowBorder]}>
                <Text style={styles.summaryLabel}>Net Balance</Text>
                <Text
                  style={[
                    styles.summaryValueNet,
                    monthSummary.net >= 0 ? styles.credit : styles.debit,
                  ]}
                >
                  {monthSummary.net >= 0 ? '+' : ''}
                  {formatCurrency(monthSummary.net)}
                </Text>
              </View>
            </Card>
          </Animated.View>
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
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  notificationBtn: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  greetingSection: {
    marginTop: spacing.sm,
  },
  greeting: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  userName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  balanceCardContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  balanceContent: {
    padding: spacing.xl,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  balanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  balanceLabel: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  eyeBtn: {
    padding: spacing.xs,
  },
  balanceAmount: {
    fontSize: typography.fontSize.massive,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  balanceSubtext: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xl,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceAction: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceActionText: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: typography.fontWeight.medium,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (screenWidth - spacing.lg * 3) / 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  transactionCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  merchantName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  transactionDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  transactionAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  credit: {
    color: colors.secondary,
  },
  debit: {
    color: colors.danger,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    fontWeight: typography.fontWeight.medium,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  summaryCard: {
    padding: spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  summaryRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.lg,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValueSpent: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.danger,
  },
  summaryValueReceived: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary,
  },
  summaryValueNet: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
});

export default HomeScreen;
