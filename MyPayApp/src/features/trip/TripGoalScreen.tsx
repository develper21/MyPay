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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { createTripGoal, setCurrentGoal } from './tripSlice';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatCurrency } from '../../utils/dateHelpers';

const TripGoalScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { goals, currentGoal, isLoading } = useSelector((state: RootState) => state.trip);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateGoal = () => {
    if (!goalName || !targetAmount || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const goalData = {
      name: goalName,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      currency: 'INR',
      startDate,
      endDate,
      description: description || undefined,
      isActive: true,
    };

    dispatch(createTripGoal(goalData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setShowCreateModal(false);
        setGoalName('');
        setTargetAmount('');
        setStartDate('');
        setEndDate('');
        setDescription('');
        Alert.alert('Success', 'Trip goal created successfully!');
      }
    });
  };

  const handleSelectGoal = (goal: any) => {
    dispatch(setCurrentGoal(goal));
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trip Goals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Icon name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {currentGoal && (
        <Card style={styles.currentGoalCard}>
          <View style={styles.currentGoalHeader}>
            <Text style={styles.currentGoalTitle}>Current Goal</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#4caf50' }]}>
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
          
          <Text style={styles.goalName}>{currentGoal.name}</Text>
          <Text style={styles.goalDescription}>{currentGoal.description}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {formatCurrency(currentGoal.currentAmount)} of {formatCurrency(currentGoal.targetAmount)}
              </Text>
              <Text style={styles.percentageText}>
                {getProgressPercentage(currentGoal.currentAmount, currentGoal.targetAmount).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${getProgressPercentage(currentGoal.currentAmount, currentGoal.targetAmount)}%` }
                ]}
              />
            </View>
          </View>
          
          <View style={styles.goalDetails}>
            <View style={styles.detailRow}>
              <Icon name="date-range" size={20} color="#666" />
              <Text style={styles.detailText}>
                {getDaysRemaining(currentGoal.endDate)} days remaining
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="account-balance-wallet" size={20} color="#666" />
              <Text style={styles.detailText}>
                {formatCurrency(currentGoal.targetAmount - currentGoal.currentAmount)} to go
              </Text>
            </View>
          </View>
        </Card>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Goals</Text>
        {goals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="flight-takeoff" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No trip goals yet</Text>
            <Text style={styles.emptySubtext}>Create your first trip goal to get started</Text>
          </Card>
        ) : (
          goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[styles.goalCard, currentGoal?.id === goal.id && styles.selectedGoalCard]}
              onPress={() => handleSelectGoal(goal)}
            >
              <View style={styles.goalCardHeader}>
                <Text style={styles.goalCardName}>{goal.name}</Text>
                <Text style={styles.goalCardAmount}>
                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                </Text>
              </View>
              <View style={styles.miniProgressBar}>
                <View
                  style={[
                    styles.miniProgressFill,
                    { width: `${getProgressPercentage(goal.currentAmount, goal.targetAmount)}%` }
                  ]}
                />
              </View>
              <Text style={styles.goalCardDate}>
                {getDaysRemaining(goal.endDate)} days left
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Create Goal Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Trip Goal</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal Name *</Text>
              <TextInput
                style={styles.input}
                value={goalName}
                onChangeText={setGoalName}
                placeholder="e.g., Europe Trip 2024"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Amount (INR) *</Text>
              <TextInput
                style={styles.input}
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="50000"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Start Date *</Text>
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="2024-01-01"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>End Date *</Text>
                <TextInput
                  style={styles.input}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="2024-01-31"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your trip goals..."
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
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
              title="Create Goal"
              onPress={handleCreateGoal}
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addButton: {
    backgroundColor: '#1976d2',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  currentGoalCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  currentGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentGoalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  percentageText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  goalDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  emptyCard: {
    marginHorizontal: 20,
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  goalCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGoalCard: {
    borderColor: '#1976d2',
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  goalCardAmount: {
    fontSize: 14,
    color: '#666',
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 2,
  },
  goalCardDate: {
    fontSize: 12,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1,
  },
});

export default TripGoalScreen;
