import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { RootState } from '../store/store';
import { formatCurrency, getTransactionsForDate, groupTransactionsByDay } from '../utils/dateHelpers';
import Card from '../components/ui/Card';
import { fetchTransactionsForMonth } from './historySlice';

type DayDetailRouteProp = RouteProp<RootStackParamList, 'DayDetail'>;
type DayDetailNavigationProp = StackNavigationProp<RootStackParamList, 'DayDetail'>;

interface Props {
  route: DayDetailRouteProp;
  navigation: DayDetailNavigationProp;
}

const DayDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { date } = route.params;
  const dispatch = useDispatch();
  
  const { transactions, currentMonth, isLoading } = useSelector((state: RootState) => state.history);

  useEffect(() => {
    // Ensure we have transactions for the current month
    dispatch(fetchTransactionsForMonth(currentMonth));
  }, [dispatch, currentMonth]);

  const dayTransactions = getTransactionsForDate(transactions, date);
  const dayTotal = groupTransactionsByDay(transactions)[date];

  const renderTransaction = ({ item }: { item: any }) => (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.merchantName}>
            {item.merchantName || 'Transaction'}
          </Text>
          <Text style={styles.transactionTime}>
            {new Date(item.timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <Text style={[
          styles.transactionAmount,
          item.type === 'credit' || item.type === 'refund' ? styles.credit : styles.debit
        ]}>
          {item.type === 'credit' || item.type === 'refund' ? '+' : '-'}
          {formatCurrency(Math.abs(item.amount))}
        </Text>
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionStatus}>
          Status: {item.status}
        </Text>
        <Text style={styles.transactionType}>
          Type: {item.type}
        </Text>
      </View>

      {item.rawMeta && Object.keys(item.rawMeta).length > 0 && (
        <View style={styles.metadataContainer}>
          <Text style={styles.metadataTitle}>Additional Info:</Text>
          {Object.entries(item.rawMeta).map(([key, value]) => (
            <Text key={key} style={styles.metadataItem}>
              {key}: {String(value)}
            </Text>
          ))}
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateTitle}>
          {new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        
        {dayTotal && (
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Spent</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(dayTotal.debitTotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Received</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(dayTotal.creditTotal)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowBorder]}>
              <Text style={styles.summaryLabel}>Net</Text>
              <Text style={[
                styles.summaryValue,
                dayTotal.total >= 0 ? styles.credit : styles.debit
              ]}>
                {dayTotal.total >= 0 ? '+' : ''}
                {formatCurrency(dayTotal.total)}
              </Text>
            </View>
            <View style={styles.countRow}>
              <Text style={styles.countText}>
                {dayTotal.count} transaction{dayTotal.count !== 1 ? 's' : ''}
              </Text>
            </View>
          </Card>
        )}
      </View>

      <FlatList
        data={dayTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => dispatch(fetchTransactionsForMonth(currentMonth))} />
        }
        ListEmptyComponent={() => (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No transactions on this date</Text>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 20,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  countRow: {
    alignItems: 'center',
    paddingTop: 8,
  },
  countText: {
    fontSize: 12,
    color: '#999',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: '#999',
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
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionStatus: {
    fontSize: 12,
    color: '#666',
  },
  transactionType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  metadataContainer: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  metadataTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  metadataItem: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default DayDetailScreen;
