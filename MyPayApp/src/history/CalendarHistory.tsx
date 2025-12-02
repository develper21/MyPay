import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchTransactionsForMonth } from './historySlice';
import { RootState } from '../store/store';
import { formatCurrency } from '../utils/dateHelpers';
import { DayTotal } from '../types';
import Card from '../components/ui/Button';

type RootStackParamList = {
  Main: undefined;
  DayDetail: { date: string; transactions: any[] };
};

type CalendarHistoryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const CalendarHistory: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<CalendarHistoryNavigationProp>();
  
  const { 
    currentMonth, 
    dayTotals, 
    monthSummary, 
    isLoading 
  } = useSelector((state: RootState) => state.history);

  useEffect(() => {
    dispatch(fetchTransactionsForMonth(currentMonth) as any);
  }, [dispatch, currentMonth]);

  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {};
    Object.entries(dayTotals).forEach(([date, info]) => {
      marked[date] = {
        marked: true,
        dotColor: (info as DayTotal).total > 0 ? '#d32f2f' : '#4caf50',
      };
    });
    return marked;
  }, [dayTotals]);

  const handleDayPress = (day: any) => {
    navigation.navigate('DayDetail' as any, { date: day.dateString });
  };

  const handleMonthChange = (month: any) => {
    const monthISO = month.dateString.slice(0, 7);
    dispatch(fetchTransactionsForMonth(monthISO) as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.subtitle}>
          {new Date(currentMonth + '-01').toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          })}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Spent:</Text>
              <Text style={styles.spentAmount}>
                {formatCurrency(monthSummary?.totalSpent || 0)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Received:</Text>
              <Text style={styles.receivedAmount}>
                {formatCurrency(monthSummary?.totalReceived || 0)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Net:</Text>
              <Text style={[
                styles.netAmount,
                { color: (monthSummary?.net || 0) >= 0 ? '#4caf50' : '#d32f2f' }
              ]}>
                {formatCurrency(monthSummary?.net || 0)}
              </Text>
            </View>
          </Card>

          <Calendar
            current={currentMonth}
            markedDates={markedDates}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#1976d2',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#1976d2',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              arrowColor: '#1976d2',
              monthTextColor: '#2d4150',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
            }}
          />
        </ScrollView>
      )}
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
    paddingTop: 40,
    backgroundColor: '#1976d2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    margin: 20,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  spentAmount: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  receivedAmount: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  netAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CalendarHistory;
