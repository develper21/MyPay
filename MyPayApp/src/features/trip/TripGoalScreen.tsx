import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { createTripWallet, addToTripWallet, setCurrentTrip } from './tripSlice';
import { TripWallet } from './tripSlice';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientCard from '../../components/ui/GradientCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatCurrency } from '../../utils/dateHelpers';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

const { width: screenWidth } = Dimensions.get('window');

const TripGoalScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { trips, currentTrip, isLoading } = useSelector((state: RootState) => state.trip);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [tripName, setTripName] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);

  const handleCreateTrip = () => {
    if (!tripName) {
      Alert.alert('Error', 'Please enter trip name');
      return;
    }

    const tripData = {
      name: tripName,
      description: tripDescription,
      balance: 0,
      currency: 'INR',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    dispatch(createTripWallet(tripData)).then((result: any) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setShowCreateModal(false);
        setTripName('');
        setTripDescription('');
        Alert.alert('Success', 'Trip wallet created successfully!');
      }
    });
  };

  const handleAddMoney = () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      Alert.alert('Error', 'Please enter valid amount');
      return;
    }

    if (!currentTrip) {
      Alert.alert('Error', 'Please select a trip first');
      return;
    }

    dispatch(addToTripWallet({ 
      tripId: currentTrip.id, 
      amount: parseFloat(addAmount) 
    })).then((result: any) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setShowAddMoneyModal(false);
        setAddAmount('');
        Alert.alert('Success', `Added ${formatCurrency(parseFloat(addAmount))} to ${currentTrip.name}`);
      }
    });
  };

  const handleSelectTrip = (trip: TripWallet) => {
    dispatch(setCurrentTrip(trip));
  };

  const getTotalBalance = () => {
    return trips.reduce((total: number, trip: TripWallet) => total + trip.balance, 0);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Trip Wallets</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Total Balance Card */}
      <GradientCard gradientColors={['#6366F1', '#8B5CF6']} padding={0}>
        <View style={styles.totalBalanceCard}>
          <Text style={styles.totalBalanceLabel}>Total Trip Balance</Text>
          <Text style={styles.totalBalanceAmount}>{formatCurrency(getTotalBalance())}</Text>
          <Text style={styles.totalBalanceSubtext}>Across {trips.length} trips</Text>
          
          <TouchableOpacity 
            style={styles.addMoneyButton}
            onPress={() => setShowAddMoneyModal(true)}
            disabled={!currentTrip}
          >
            <Icon name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
        </View>
      </GradientCard>

      {currentTrip && (
        <Card style={styles.currentTripCard}>
          <View style={styles.currentTripHeader}>
            <Text style={styles.currentTripTitle}>Current Trip</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
          
          <Text style={styles.tripName}>{currentTrip.name}</Text>
          <Text style={styles.tripDescription}>{currentTrip.description}</Text>
          
          <View style={styles.balanceContainer}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(currentTrip.balance)}</Text>
            </View>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => setShowAddMoneyModal(true)}
              >
                <Icon name="add" size={20} color={colors.primary} />
                <Text style={styles.quickActionText}>Add Money</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Icon name="history" size={20} color={colors.primary} />
                <Text style={styles.quickActionText}>History</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Trips</Text>
        {trips.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="flight-takeoff" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No trip wallets yet</Text>
            <Text style={styles.emptySubtext}>Create your first trip wallet to get started</Text>
          </Card>
        ) : (
          trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={[styles.tripCard, currentTrip?.id === trip.id && styles.selectedTripCard]}
              onPress={() => handleSelectTrip(trip)}
            >
              <View style={styles.tripCardHeader}>
                <Text style={styles.tripCardName}>{trip.name}</Text>
                <Text style={styles.tripCardBalance}>
                  {formatCurrency(trip.balance)}
                </Text>
              </View>
              <Text style={styles.tripCardDescription}>{trip.description}</Text>
              <View style={styles.tripCardFooter}>
                <Icon name="account-balance-wallet" size={16} color={colors.textSecondary} />
                <Text style={styles.tripCardDate}>Available for payments</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Create Trip Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Trip Wallet</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trip Name *</Text>
              <TextInput
                style={styles.input}
                value={tripName}
                onChangeText={setTripName}
                placeholder="e.g., Europe Trip 2024"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={tripDescription}
                onChangeText={setTripDescription}
                placeholder="Describe your trip..."
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setShowCreateModal(false)}
              style={styles.modalButton}
            />
            <Button
              title="Create Trip"
              onPress={handleCreateTrip}
              loading={isLoading}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Add Money Modal */}
      <Modal
        visible={showAddMoneyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Money to Trip</Text>
            <TouchableOpacity onPress={() => setShowAddMoneyModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount (INR) *</Text>
              <TextInput
                style={styles.input}
                value={addAmount}
                onChangeText={setAddAmount}
                placeholder="1000"
                keyboardType="numeric"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            
            {currentTrip && (
              <Card style={styles.tripInfoCard}>
                <Text style={styles.tripInfoLabel}>Adding to:</Text>
                <Text style={styles.tripInfoName}>{currentTrip.name}</Text>
                <Text style={styles.tripInfoBalance}>
                  Current balance: {formatCurrency(currentTrip.balance)}
                </Text>
              </Card>
            )}
          </View>
          
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setShowAddMoneyModal(false)}
              style={styles.modalButton}
            />
            <Button
              title="Add Money"
              onPress={handleAddMoney}
              loading={isLoading}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  totalBalanceCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  totalBalanceLabel: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  totalBalanceAmount: {
    fontSize: typography.fontSize.massive,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  totalBalanceSubtext: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.lg,
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  addMoneyText: {
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  currentTripCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  currentTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  currentTripTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.semibold,
  },
  tripName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tripDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  balanceContainer: {
    gap: spacing.md,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  balanceAmount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.base,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  tripCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTripCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tripCardName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  tripCardBalance: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  tripCardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tripCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripCardDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  tripInfoCard: {
    padding: spacing.md,
    marginTop: spacing.md,
  },
  tripInfoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tripInfoName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tripInfoBalance: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
  },
});

export default TripGoalScreen;
