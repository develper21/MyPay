import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

interface TransactionData {
  amount: number;
  recipient: string;
  upiId?: string;
  accountNumber?: string;
  description?: string;
}

interface SafetyCheck {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  icon: string;
  action?: string;
}

interface TransactionSafetyCheckerProps {
  transactionData: TransactionData;
  onConfirm: () => void;
  onCancel: () => void;
  visible: boolean;
}

const TransactionSafetyChecker: React.FC<TransactionSafetyCheckerProps> = ({
  transactionData,
  onConfirm,
  onCancel,
  visible,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheck[]>([]);

  React.useEffect(() => {
    if (visible && transactionData) {
      const checks = performSafetyChecks(transactionData);
      setSafetyChecks(checks);
    }
  }, [visible, transactionData]);

  const performSafetyChecks = (data: TransactionData): SafetyCheck[] => {
    const checks: SafetyCheck[] = [];

    // Check for high amount transactions
    if (data.amount > 50000) {
      checks.push({
        id: 'high_amount',
        type: 'warning',
        title: 'High Amount Transaction',
        description: `This is a large amount (${formatCurrency(data.amount)}). Please double-check recipient details.`,
        icon: 'warning',
        action: 'Verify Recipient'
      });
    }

    // Check for new recipient
    if (data.recipient && isNewRecipient(data.recipient)) {
      checks.push({
        id: 'new_recipient',
        type: 'warning',
        title: 'New Recipient',
        description: 'You haven\'t sent money to this recipient before. Please verify the details.',
        icon: 'person-add',
        action: 'View Recipient'
      });
    }

    // Check for suspicious UPI ID patterns
    if (data.upiId && isSuspiciousUpiId(data.upiId)) {
      checks.push({
        id: 'suspicious_upi',
        type: 'error',
        title: 'Suspicious UPI ID',
        description: 'This UPI ID pattern looks suspicious. Please verify before proceeding.',
        icon: 'error',
        action: 'Check UPI ID'
      });
    }

    // Check for unusual time (late night transactions)
    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour <= 6) {
      checks.push({
        id: 'unusual_time',
        type: 'info',
        title: 'Unusual Transaction Time',
        description: 'You\'re making a transaction late at night. Please ensure this is intentional.',
        icon: 'access-time',
      });
    }

    // Check for missing description
    if (!data.description || data.description.trim().length === 0) {
      checks.push({
        id: 'no_description',
        type: 'info',
        title: 'No Description Added',
        description: 'Adding a description helps you track your transactions better.',
        icon: 'description',
      });
    }

    return checks;
  };

  const isNewRecipient = (recipient: string): boolean => {
    // Mock implementation - in real app, check transaction history
    const knownRecipients = ['John Doe', 'Jane Smith', 'Local Store'];
    return !knownRecipients.includes(recipient);
  };

  const isSuspiciousUpiId = (upiId: string): boolean => {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\d{10}@/, // 10-digit numbers (potential phone numbers)
      /test@/i, // test accounts
      /fake@/i, // fake accounts
      /\d{4}\d{4}\d{4}@/, // repeated number patterns
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(upiId));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const hasErrors = safetyChecks.some(check => check.type === 'error');
  const hasWarnings = safetyChecks.some(check => check.type === 'warning');

  const handleConfirm = () => {
    if (hasErrors) {
      Alert.alert(
        'Safety Alert',
        'There are security concerns with this transaction. Are you sure you want to proceed?',
        [
          { text: 'Cancel', style: 'cancel', onPress: onCancel },
          { text: 'Proceed Anyway', style: 'destructive', onPress: onConfirm },
        ]
      );
    } else {
      onConfirm();
    }
  };

  const getCheckIcon = (type: string) => {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  const getCheckColor = (type: string) => {
    switch (type) {
      case 'error': return colors.danger;
      case 'warning': return '#FF9800';
      case 'info': return colors.primary;
      default: return colors.primary;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Icon name="security" size={32} color={colors.primary} />
            <Text style={styles.modalTitle}>Transaction Safety Check</Text>
            <Text style={styles.modalSubtitle}>
              We're checking your transaction for security
            </Text>
          </View>

          {/* Transaction Summary */}
          <View style={styles.transactionSummary}>
            <Text style={styles.summaryTitle}>Transaction Details</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(transactionData.amount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Recipient:</Text>
              <Text style={styles.summaryValue}>{transactionData.recipient}</Text>
            </View>
            {transactionData.upiId && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>UPI ID:</Text>
                <Text style={styles.summaryValue}>{transactionData.upiId}</Text>
              </View>
            )}
          </View>

          {/* Safety Checks */}
          <ScrollView style={styles.checksContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.checksTitle}>Safety Checks</Text>
            
            {safetyChecks.length === 0 ? (
              <View style={styles.noIssuesContainer}>
                <Icon name="check-circle" size={48} color="#4CAF50" />
                <Text style={styles.noIssuesText}>No safety concerns detected</Text>
                <Text style={styles.noIssuesSubtext}>This transaction appears safe to proceed</Text>
              </View>
            ) : (
              safetyChecks.map(check => (
                <View key={check.id} style={[styles.checkItem, { borderColor: getCheckColor(check.type) }]}>
                  <View style={styles.checkHeader}>
                    <Icon name={getCheckIcon(check.type)} size={24} color={getCheckColor(check.type)} />
                    <Text style={[styles.checkTitle, { color: getCheckColor(check.type) }]}>
                      {check.title}
                    </Text>
                  </View>
                  <Text style={styles.checkDescription}>{check.description}</Text>
                  {check.action && (
                    <TouchableOpacity style={styles.checkAction}>
                      <Text style={styles.checkActionText}>{check.action}</Text>
                      <Icon name="chevron-right" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                hasErrors && styles.confirmButtonError,
                hasWarnings && !hasErrors && styles.confirmButtonWarning
              ]} 
              onPress={handleConfirm}
            >
              <Icon name="check" size={20} color="#FFFFFF" />
              <Text style={styles.confirmText}>
                {hasErrors ? 'Proceed Anyway' : 'Confirm Transaction'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    margin: spacing.lg,
    width: '95%',
    maxWidth: 400,
    maxHeight: '80%',
    ...shadows.lg,
  },
  modalHeader: {
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  transactionSummary: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  checksContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  checksTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  noIssuesContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  noIssuesText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#4CAF50',
    marginTop: spacing.md,
  },
  noIssuesSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  checkItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  checkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
    flex: 1,
  },
  checkDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  checkAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  checkActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    marginRight: spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  confirmButtonError: {
    backgroundColor: colors.danger,
  },
  confirmButtonWarning: {
    backgroundColor: '#FF9800',
  },
  confirmText: {
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
  },
});

export default TransactionSafetyChecker;
