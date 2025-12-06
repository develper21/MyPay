import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientCard from '../../components/ui/GradientCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

interface Dispute {
  id: string;
  transactionId: string;
  type: 'fraud' | 'wrong_recipient' | 'duplicate' | 'service_issue' | 'other';
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  resolution?: string;
  evidence?: string[];
}

const DisputeResolutionScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: '1',
      transactionId: 'txn_123456',
      type: 'wrong_recipient',
      title: 'Wrong Recipient',
      description: 'Money sent to wrong person by mistake',
      amount: 5000,
      status: 'under_review',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T14:20:00Z',
    },
    {
      id: '2',
      transactionId: 'txn_789012',
      type: 'fraud',
      title: 'Fraudulent Transaction',
      description: 'Unauthorized transaction detected',
      amount: 10000,
      status: 'resolved',
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-12T16:45:00Z',
      resolution: 'Refund processed successfully',
    }
  ]);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [newDispute, setNewDispute] = useState({
    transactionId: '',
    type: 'fraud' as Dispute['type'],
    title: '',
    description: '',
    amount: 0,
  });

  const disputeTypes = [
    { value: 'fraud', label: 'Fraudulent Transaction', icon: 'security' },
    { value: 'wrong_recipient', label: 'Wrong Recipient', icon: 'person-off' },
    { value: 'duplicate', label: 'Duplicate Charge', icon: 'content-copy' },
    { value: 'service_issue', label: 'Service Issue', icon: 'build' },
    { value: 'other', label: 'Other Issue', icon: 'more-horiz' },
  ];

  const getStatusColor = (status: Dispute['status']) => {
    switch (status) {
      case 'pending': return colors.textTertiary;
      case 'under_review': return '#FF9800';
      case 'resolved': return '#4CAF50';
      case 'rejected': return colors.danger;
      default: return colors.textTertiary;
    }
  };

  const getStatusText = (status: Dispute['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'under_review': return 'Under Review';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getTypeIcon = (type: Dispute['type']) => {
    const disputeType = disputeTypes.find(t => t.value === type);
    return disputeType?.icon || 'help';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCreateDispute = () => {
    if (!newDispute.transactionId || !newDispute.title || !newDispute.description) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const dispute: Dispute = {
      id: `dispute_${Date.now()}`,
      transactionId: newDispute.transactionId,
      type: newDispute.type,
      title: newDispute.title,
      description: newDispute.description,
      amount: newDispute.amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDisputes([dispute, ...disputes]);
    setNewDispute({
      transactionId: '',
      type: 'fraud',
      title: '',
      description: '',
      amount: 0,
    });
    setShowCreateModal(false);
    Alert.alert('Success', 'Dispute created successfully. We\'ll review it within 24 hours.');
  };

  const DisputeStatsCard = () => {
    const totalDisputes = disputes.length;
    const resolvedDisputes = disputes.filter(d => d.status === 'resolved').length;
    const pendingDisputes = disputes.filter(d => d.status === 'pending' || d.status === 'under_review').length;
    const totalAmount = disputes.reduce((sum, d) => sum + d.amount, 0);

    return (
      <GradientCard gradientColors={['#6366F1', '#8B5CF6']} padding={0}>
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Dispute Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalDisputes}</Text>
              <Text style={styles.statLabel}>Total Disputes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{resolvedDisputes}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{pendingDisputes}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Amount in Dispute:</Text>
            <Text style={styles.amountValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>
      </GradientCard>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Dispute Resolution</Text>
        <Text style={styles.subtitle}>Report and track payment disputes</Text>
      </View>

      <DisputeStatsCard />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Icon name="add-circle" size={32} color={colors.primary} />
          <Text style={styles.quickActionText}>New Dispute</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Icon name="phone" size={32} color={colors.primary} />
          <Text style={styles.quickActionText}>Contact Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Icon name="help" size={32} color={colors.primary} />
          <Text style={styles.quickActionText}>Help Center</Text>
        </TouchableOpacity>
      </View>

      {/* Disputes List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Disputes</Text>
        
        {disputes.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon name="assignment" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No disputes yet</Text>
            <Text style={styles.emptySubtext}>Create a dispute if you have any payment issues</Text>
          </Card>
        ) : (
          disputes.map(dispute => (
            <TouchableOpacity 
              key={dispute.id} 
              style={styles.disputeCard}
              onPress={() => {
                setSelectedDispute(dispute);
                setShowDetailsModal(true);
              }}
            >
              <View style={styles.disputeHeader}>
                <View style={styles.disputeInfo}>
                  <View style={styles.disputeIcon}>
                    <Icon name={getTypeIcon(dispute.type)} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.disputeDetails}>
                    <Text style={styles.disputeTitle}>{dispute.title}</Text>
                    <Text style={styles.disputeSubtitle}>{dispute.transactionId}</Text>
                  </View>
                </View>
                <View style={styles.disputeStatus}>
                  <Text style={[styles.statusText, { color: getStatusColor(dispute.status) }]}>
                    {getStatusText(dispute.status)}
                  </Text>
                  <Text style={styles.disputeAmount}>{formatCurrency(dispute.amount)}</Text>
                </View>
              </View>
              <View style={styles.disputeFooter}>
                <Text style={styles.disputeDate}>Created: {formatDate(dispute.createdAt)}</Text>
                <Icon name="chevron-right" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Create Dispute Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Dispute</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Transaction ID *</Text>
              <TextInput
                style={styles.input}
                value={newDispute.transactionId}
                onChangeText={(text) => setNewDispute({...newDispute, transactionId: text})}
                placeholder="Enter transaction ID"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dispute Type *</Text>
              <View style={styles.typeGrid}>
                {disputeTypes.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      newDispute.type === type.value && styles.typeOptionSelected
                    ]}
                    onPress={() => setNewDispute({...newDispute, type: type.value as Dispute['type']})}
                  >
                    <Icon 
                      name={type.icon} 
                      size={24} 
                      color={newDispute.type === type.value ? colors.primary : colors.textSecondary} 
                    />
                    <Text style={[
                      styles.typeText,
                      newDispute.type === type.value && styles.typeTextSelected
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={newDispute.title}
                onChangeText={(text) => setNewDispute({...newDispute, title: text})}
                placeholder="Brief description of the issue"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newDispute.description}
                onChangeText={(text) => setNewDispute({...newDispute, description: text})}
                placeholder="Detailed explanation of what happened"
                multiline
                numberOfLines={4}
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount (INR)</Text>
              <TextInput
                style={styles.input}
                value={newDispute.amount.toString()}
                onChangeText={(text) => setNewDispute({...newDispute, amount: parseFloat(text) || 0})}
                placeholder="0"
                keyboardType="numeric"
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
              title="Create Dispute"
              onPress={handleCreateDispute}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Dispute Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedDispute && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dispute Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Transaction Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Transaction ID:</Text>
                  <Text style={styles.detailValue}>{selectedDispute.transactionId}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(selectedDispute.amount)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[styles.detailValue, { color: getStatusColor(selectedDispute.status) }]}>
                    {getStatusText(selectedDispute.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Dispute Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>{selectedDispute.title}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Text style={styles.detailValue}>{selectedDispute.description}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Created:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedDispute.createdAt)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Updated:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedDispute.updatedAt)}</Text>
                </View>
              </View>

              {selectedDispute.resolution && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Resolution</Text>
                  <Text style={styles.resolutionText}>{selectedDispute.resolution}</Text>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                title="Contact Support"
                variant="secondary"
                onPress={() => Alert.alert('Support', 'Support team will contact you soon')}
                style={styles.modalButton}
              />
              <Button
                title="Close"
                onPress={() => setShowDetailsModal(false)}
                style={styles.modalButton}
              />
            </View>
          </View>
        )}
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
  statsCard: {
    padding: spacing.lg,
  },
  statsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  amountLabel: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
  },
  amountValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.sm,
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
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  disputeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  disputeInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  disputeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  disputeDetails: {
    flex: 1,
  },
  disputeTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  disputeSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  disputeStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  disputeAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  disputeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disputeDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
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
    height: 100,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeOption: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: '30%',
  },
  typeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  typeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  typeTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
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
  detailSection: {
    marginBottom: spacing.xl,
  },
  detailSectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
    flex: 2,
    textAlign: 'right',
  },
  resolutionText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    backgroundColor: '#4CAF5020',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
});

export default DisputeResolutionScreen;
