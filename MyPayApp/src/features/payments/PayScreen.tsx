import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { sendPayment, fetchAccounts } from './paymentsSlice';
import { addTransaction } from '../../history/historySlice';
import { RootState, AppDispatch } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientCard from '../../components/ui/GradientCard';
import { formatCurrency } from '../../utils/dateHelpers';
import { Account, Transaction } from '../../types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

const { width: screenWidth } = Dimensions.get('window');

const PayScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accounts, isSendingPayment, lastPaymentResult } = useSelector((state: RootState) => state.payments);

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAmountKeypad, setShowAmountKeypad] = useState(false);

  React.useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  React.useEffect(() => {
    if (lastPaymentResult) {
      if (lastPaymentResult.success) {
        Alert.alert('Payment Sent', 'Your payment has been sent successfully!');
        // Reset form
        setRecipient('');
        setAmount('');
        setNote('');
        setSelectedAccount(null);
        
        // Add mock transaction to history
        const newTransaction: Transaction = {
          id: lastPaymentResult.transactionId || `txn_${Date.now()}`,
          accountId: selectedAccount?.id || 'acc_1',
          timestamp: new Date().toISOString(),
          amount: parseFloat(amount) * -1, // Negative for outgoing
          currency: 'INR',
          merchantName: recipient,
          type: 'debit',
          status: 'completed',
          rawMeta: { note, paymentMethod: 'app' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dispatch(addTransaction(newTransaction));
      } else {
        Alert.alert('Payment Failed', lastPaymentResult.error || 'Something went wrong');
      }
    }
  }, [lastPaymentResult, selectedAccount, amount, recipient, note, dispatch]);

  const handleSendPayment = () => {
    if (!recipient || !amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Input', 'Please enter recipient and valid amount');
      return;
    }

    if (!selectedAccount) {
      Alert.alert('No Account', 'Please select an account to send from');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmPayment = () => {
    setShowConfirmation(false);
    
    if (!selectedAccount) {
      Alert.alert('No Account', 'Please select an account to send from');
      return;
    }

    const paymentRequest = {
      toAccountId: recipient,
      amount: parseFloat(amount),
      currency: 'USD',
      metadata: { note, fromAccount: selectedAccount.id },
    };

    dispatch(sendPayment(paymentRequest));
  };

  const mockAccounts: Account[] = accounts.length > 0 ? accounts : [
    {
      id: 'acc_1',
      providerId: 'bank_1',
      maskedAccountNumber: '****1234',
      accountName: 'Checking Account',
      currency: 'USD',
      type: 'checking',
      lastSync: new Date(),
    },
    {
      id: 'acc_2',
      providerId: 'bank_1',
      maskedAccountNumber: '****5678',
      accountName: 'Savings Account',
      currency: 'USD',
      type: 'savings',
      lastSync: new Date(),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Send Money</Text>
        <Text style={styles.subtitle}>Transfer money instantly and securely</Text>
      </View>

      {/* Amount Input Card */}
      <GradientCard gradientColors={['#6366F1', '#8B5CF6']} padding={0}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <TouchableOpacity 
            style={styles.amountInputContainer}
            onPress={() => setShowAmountKeypad(true)}
          >
            <Text style={styles.amountInput}>
              {amount || '0'}
            </Text>
            <Text style={styles.currencySymbol}>₹</Text>
          </TouchableOpacity>
          {amount && parseFloat(amount) > 0 && (
            <Text style={styles.amountPreview}>
              {formatCurrency(parseFloat(amount))}
            </Text>
          )}
        </View>
      </GradientCard>

      {/* Quick Amount Buttons */}
      <View style={styles.quickAmountContainer}>
        <Text style={styles.quickAmountTitle}>Quick Amount</Text>
        <View style={styles.quickAmountButtons}>
          {[500, 1000, 2000, 5000].map((value) => (
            <TouchableOpacity
              key={value}
              style={styles.quickAmountButton}
              onPress={() => setAmount(value.toString())}
            >
              <Text style={styles.quickAmountText}>₹{value}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* From Account Selection */}
      <Card style={styles.card}>
        <Text style={styles.label}>From Account</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.accountList}>
            {(mockAccounts).map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountCard,
                  selectedAccount?.id === account.id && styles.accountCardSelected
                ]}
                onPress={() => setSelectedAccount(account)}
              >
                <View style={styles.accountIcon}>
                  <Icon 
                    name={account.type === 'checking' ? 'account-balance' : 'savings'} 
                    size={24} 
                    color={selectedAccount?.id === account.id ? '#FFFFFF' : colors.primary} 
                  />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={[
                    styles.accountName,
                    selectedAccount?.id === account.id && styles.accountNameSelected
                  ]}>
                    {account.accountName}
                  </Text>
                  <Text style={[
                    styles.accountNumber,
                    selectedAccount?.id === account.id && styles.accountNumberSelected
                  ]}>
                    {account.maskedAccountNumber}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Card>

      {/* Recipient Input */}
      <Card style={styles.card}>
        <View style={styles.inputContainer}>
          <Icon name="person" size={20} color={colors.textTertiary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter email, phone, or account ID"
            placeholderTextColor={colors.textTertiary}
            value={recipient}
            onChangeText={setRecipient}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </Card>

      {/* Note Input */}
      <Card style={styles.card}>
        <View style={styles.inputContainer}>
          <Icon name="note" size={20} color={colors.textTertiary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Add a note (optional)"
            placeholderTextColor={colors.textTertiary}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
          />
        </View>
      </Card>

      {/* Send Button */}
      <Button
        title="Send Money"
        onPress={handleSendPayment}
        loading={isSendingPayment}
        disabled={!recipient || !amount || parseFloat(amount) <= 0 || !selectedAccount}
        style={styles.sendButton}
      />

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="payment" size={32} color={colors.primary} />
              <Text style={styles.modalTitle}>Confirm Payment</Text>
            </View>
            
            <View style={styles.confirmationDetails}>
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>To:</Text>
                <Text style={styles.confirmationValue}>{recipient}</Text>
              </View>
              
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Amount:</Text>
                <Text style={styles.confirmationAmount}>
                  {formatCurrency(parseFloat(amount))}
                </Text>
              </View>
              
              {note && (
                <View style={styles.confirmationRow}>
                  <Text style={styles.confirmationLabel}>Note:</Text>
                  <Text style={styles.confirmationValue}>{note}</Text>
                </View>
              )}
              
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>From:</Text>
                <Text style={styles.confirmationValue}>
                  {selectedAccount?.accountName} ({selectedAccount?.maskedAccountNumber})
                </Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowConfirmation(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Confirm"
                onPress={confirmPayment}
                style={styles.modalButton}
              />
            </View>
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
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  amountCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.lg,
    fontWeight: typography.fontWeight.medium,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  amountInput: {
    fontSize: typography.fontSize.massive,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  currencySymbol: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: spacing.sm,
  },
  amountPreview: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: typography.fontWeight.medium,
  },
  quickAmountContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  quickAmountTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  quickAmountText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  accountList: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  accountCard: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minWidth: 160,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  accountCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  accountNameSelected: {
    color: '#FFFFFF',
  },
  accountNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  accountNumberSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  noteInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  sendButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    margin: spacing.lg,
    width: screenWidth - spacing.lg * 2,
    ...shadows.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  confirmationDetails: {
    marginBottom: spacing.xl,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  confirmationLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  confirmationValue: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.lg,
  },
  confirmationAmount: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default PayScreen;
