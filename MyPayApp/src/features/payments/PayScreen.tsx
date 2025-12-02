import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { sendPayment, fetchAccounts } from './paymentsSlice';
import { addTransaction } from '../../history/historySlice';
import { RootState, AppDispatch } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/dateHelpers';
import { Account, Transaction } from '../../types';

const PayScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accounts, isSendingPayment, lastPaymentResult } = useSelector((state: RootState) => state.payments);

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
          currency: 'USD',
          merchantName: recipient,
          type: 'debit',
          status: 'completed',
          rawMeta: { note, paymentMethod: 'app' },
          createdAt: new Date(),
          updatedAt: new Date(),
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Send Money</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.label}>From Account</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.accountList}>
            {(mockAccounts).map((account) => (
              <Button
                key={account.id}
                title={`${account.accountName}\n${account.maskedAccountNumber}`}
                onPress={() => setSelectedAccount(account)}
                variant={selectedAccount?.id === account.id ? 'primary' : 'secondary'}
                style={styles.accountButton}
                textStyle={styles.accountButtonText}
              />
            ))}
          </View>
        </ScrollView>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>Recipient</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email, phone, or account ID"
          value={recipient}
          onChangeText={setRecipient}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={[styles.input, styles.amountInput]}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        {amount && parseFloat(amount) > 0 && (
          <Text style={styles.amountPreview}>
            {formatCurrency(parseFloat(amount))}
          </Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Add a note..."
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />
      </Card>

      <Button
        title="Send Money"
        onPress={handleSendPayment}
        loading={isSendingPayment}
        disabled={!recipient || !amount || parseFloat(amount) <= 0}
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
            <Text style={styles.modalTitle}>Confirm Payment</Text>
            
            <View style={styles.confirmationDetails}>
              <Text style={styles.confirmationLabel}>To:</Text>
              <Text style={styles.confirmationValue}>{recipient}</Text>
              
              <Text style={styles.confirmationLabel}>Amount:</Text>
              <Text style={styles.confirmationValue}>
                {formatCurrency(parseFloat(amount))}
              </Text>
              
              {note && (
                <>
                  <Text style={styles.confirmationLabel}>Note:</Text>
                  <Text style={styles.confirmationValue}>{note}</Text>
                </>
              )}
              
              <Text style={styles.confirmationLabel}>From:</Text>
              <Text style={styles.confirmationValue}>
                {selectedAccount?.accountName} ({selectedAccount?.maskedAccountNumber})
              </Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  accountList: {
    flexDirection: 'row',
    gap: 12,
  },
  accountButton: {
    minWidth: 150,
  },
  accountButtonText: {
    fontSize: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  amountPreview: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
    marginTop: 8,
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmationDetails: {
    marginBottom: 24,
  },
  confirmationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  confirmationValue: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default PayScreen;
