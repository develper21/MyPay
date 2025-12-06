import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientCard from '../../components/ui/GradientCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

interface TokenizedCard {
  id: string;
  cardName: string;
  lastFour: string;
  token: string;
  expiryDate: string;
  cardType: 'visa' | 'mastercard' | 'rupay';
  isDefault: boolean;
  createdAt: string;
}

interface EncryptionStatus {
  algorithm: string;
  keyLength: number;
  lastRotated: string;
  status: 'active' | 'expired' | 'rotating';
}

const EncryptionTokenizationScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [tokenizedCards, setTokenizedCards] = useState<TokenizedCard[]>([
    {
      id: '1',
      cardName: 'HDFC Bank',
      lastFour: '4242',
      token: 'tok_1a2b3c4d5e6f7g8h9i0j',
      expiryDate: '12/25',
      cardType: 'visa',
      isDefault: true,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: '2',
      cardName: 'ICICI Bank',
      lastFour: '8888',
      token: 'tok_9i8h7g6f5e4d3c2b1a0',
      expiryDate: '09/24',
      cardType: 'mastercard',
      isDefault: false,
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
  ]);

  const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus>({
    algorithm: 'AES-256-GCM',
    keyLength: 256,
    lastRotated: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: 'active',
  });

  const [autoEncryptionEnabled, setAutoEncryptionEnabled] = useState(true);
  const [tokenizationEnabled, setTokenizationEnabled] = useState(true);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showTokenDetails, setShowTokenDetails] = useState<TokenizedCard | null>(null);
  const [newCardData, setNewCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });

  const [encryptionMetrics, setEncryptionMetrics] = useState({
    encryptedTransactions: 12453,
    tokensGenerated: 892,
    encryptionSuccessRate: 99.97,
    lastSecurityAudit: new Date(Date.now() - 86400000 * 14).toISOString(),
  });

  useEffect(() => {
    simulateKeyRotation();
  }, []);

  const simulateKeyRotation = () => {
    const interval = setInterval(() => {
      setEncryptionStatus(prev => ({
        ...prev,
        lastRotated: new Date().toISOString(),
      }));
    }, 86400000 * 30); // Rotate every 30 days
    return () => clearInterval(interval);
  };

  const getCardIcon = (cardType: string) => {
    switch (cardType) {
      case 'visa': return 'credit-card';
      case 'mastercard': return 'credit-card';
      case 'rupay': return 'credit-card';
      default: return 'credit-card';
    }
  };

  const getCardColor = (cardType: string) => {
    switch (cardType) {
      case 'visa': return '#1A1F71';
      case 'mastercard': return '#EB001B';
      case 'rupay': return '#FF6600';
      default: return colors.primary;
    }
  };

  const formatCardNumber = (number: string) => {
    return number.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const maskCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.length < 4) return '****';
    return `**** **** **** ${cleaned.slice(-4)}`;
  };

  const generateToken = (cardData: typeof newCardData) => {
    const token = 'tok_' + Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    const newCard: TokenizedCard = {
      id: Date.now().toString(),
      cardName: cardData.cardName,
      lastFour: cardData.cardNumber.slice(-4),
      token,
      expiryDate: cardData.expiryDate,
      cardType: 'visa', // Simplified for demo
      isDefault: tokenizedCards.length === 0,
      createdAt: new Date().toISOString(),
    };

    setTokenizedCards(prev => [...prev, newCard]);
    setEncryptionMetrics(prev => ({
      ...prev,
      tokensGenerated: prev.tokensGenerated + 1,
    }));

    return token;
  };

  const addNewCard = () => {
    if (!newCardData.cardNumber || !newCardData.expiryDate || !newCardData.cvv || !newCardData.cardName) {
      Alert.alert('Error', 'Please fill all card details');
      return;
    }

    const token = generateToken(newCardData);
    setShowAddCardModal(false);
    setNewCardData({ cardNumber: '', expiryDate: '', cvv: '', cardName: '' });
    
    Alert.alert(
      'Card Added Successfully',
      `Your card has been tokenized.\nToken: ${token}`,
      [{ text: 'OK' }]
    );
  };

  const deleteTokenizedCard = (cardId: string) => {
    Alert.alert(
      'Delete Card',
      'This will permanently remove the tokenized card from your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setTokenizedCards(prev => prev.filter(card => card.id !== cardId));
            Alert.alert('Success', 'Card token deleted successfully');
          }
        }
      ]
    );
  };

  const setDefaultCard = (cardId: string) => {
    setTokenizedCards(prev => 
      prev.map(card => ({ 
        ...card, 
        isDefault: card.id === cardId 
      }))
    );
  };

  const rotateEncryptionKeys = () => {
    Alert.alert(
      'Rotate Encryption Keys',
      'This will rotate all encryption keys. Existing sessions will be invalidated.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Rotate Keys', 
          onPress: () => {
            setEncryptionStatus(prev => ({
              ...prev,
              status: 'rotating',
              lastRotated: new Date().toISOString(),
            }));
            
            setTimeout(() => {
              setEncryptionStatus(prev => ({ ...prev, status: 'active' }));
              Alert.alert('Success', 'Encryption keys rotated successfully');
            }, 2000);
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'expired': return colors.danger;
      case 'rotating': return '#FF9800';
      default: return colors.textTertiary;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <GradientCard gradientColors={[colors.primary, colors.primary + '80']} padding={0}>
          <View style={styles.headerCard}>
            <Icon name="enhanced-encryption" size={48} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Encryption & Tokenization</Text>
            <Text style={styles.headerSubtitle}>Military-grade security for your data</Text>
            
            <View style={styles.securityOverview}>
              <View style={styles.securityItem}>
                <Icon name="lock" size={24} color="#FFFFFF" />
                <Text style={styles.securityValue}>{encryptionStatus.keyLength}-bit</Text>
                <Text style={styles.securityLabel}>Encryption</Text>
              </View>
              <View style={styles.securityItem}>
                <Icon name="credit-card" size={24} color="#FFFFFF" />
                <Text style={styles.securityValue}>{tokenizedCards.length}</Text>
                <Text style={styles.securityLabel}>Tokenized Cards</Text>
              </View>
              <View style={styles.securityItem}>
                <Icon name="verified-user" size={24} color="#FFFFFF" />
                <Text style={styles.securityValue}>{encryptionMetrics.encryptionSuccessRate}%</Text>
                <Text style={styles.securityLabel}>Success Rate</Text>
              </View>
            </View>
          </View>
        </GradientCard>

        {/* Encryption Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Encryption Status</Text>
          <Card style={styles.encryptionCard}>
            <View style={styles.encryptionHeader}>
              <View style={styles.encryptionInfo}>
                <Icon name="security" size={24} color={getStatusColor(encryptionStatus.status)} />
                <View style={styles.encryptionDetails}>
                  <Text style={styles.encryptionAlgorithm}>{encryptionStatus.algorithm}</Text>
                  <Text style={styles.encryptionKeyLength}>{encryptionStatus.keyLength}-bit keys</Text>
                </View>
              </View>
              <View style={styles.encryptionStatus}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(encryptionStatus.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(encryptionStatus.status) }]}>
                  {encryptionStatus.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.encryptionFooter}>
              <Text style={styles.lastRotated}>Last rotated: {formatDate(encryptionStatus.lastRotated)}</Text>
              <TouchableOpacity style={styles.rotateButton} onPress={rotateEncryptionKeys}>
                <Icon name="refresh" size={20} color={colors.primary} />
                <Text style={styles.rotateButtonText}>Rotate Keys</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Tokenized Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tokenized Cards</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddCardModal(true)}>
              <Icon name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {tokenizedCards.map(card => (
            <Card key={card.id} style={styles.cardCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Icon name={getCardIcon(card.cardType)} size={24} color={getCardColor(card.cardType)} />
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardName}>{card.cardName}</Text>
                    <Text style={styles.cardNumber}>**** **** **** {card.lastFour}</Text>
                  </View>
                </View>
                {card.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.cardFooter}>
                <Text style={styles.cardMeta}>
                  Expires {card.expiryDate} • Added {formatDate(card.createdAt)}
                </Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => setShowTokenDetails(card)}>
                    <Icon name="visibility" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  {!card.isDefault && (
                    <TouchableOpacity onPress={() => setDefaultCard(card.id)}>
                      <Icon name="star" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => deleteTokenizedCard(card.id)}>
                    <Icon name="delete" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="enhanced-encryption" size={24} color={colors.primary} />
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>Auto Encryption</Text>
                  <Text style={styles.settingDescription}>Automatically encrypt sensitive data</Text>
                </View>
              </View>
              <Switch
                value={autoEncryptionEnabled}
                onValueChange={setAutoEncryptionEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={autoEncryptionEnabled ? colors.primary : colors.textTertiary}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="credit-card" size={24} color={colors.primary} />
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>Card Tokenization</Text>
                  <Text style={styles.settingDescription}>Convert card numbers to secure tokens</Text>
                </View>
              </View>
              <Switch
                value={tokenizationEnabled}
                onValueChange={setTokenizationEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={tokenizationEnabled ? colors.primary : colors.textTertiary}
              />
            </View>
          </Card>
        </View>

        {/* Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Metrics</Text>
          <Card style={styles.metricsCard}>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{encryptionMetrics.encryptedTransactions.toLocaleString()}</Text>
                <Text style={styles.metricLabel}>Encrypted Transactions</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{encryptionMetrics.tokensGenerated}</Text>
                <Text style={styles.metricLabel}>Tokens Generated</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{encryptionMetrics.encryptionSuccessRate}%</Text>
                <Text style={styles.metricLabel}>Success Rate</Text>
              </View>
            </View>
            <View style={styles.auditInfo}>
              <Text style={styles.auditText}>
                Last security audit: {formatDate(encryptionMetrics.lastSecurityAudit)}
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal
        visible={showAddCardModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Card</Text>
            <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.textInput}
                value={newCardData.cardNumber}
                onChangeText={(text) => setNewCardData(prev => ({ ...prev, cardNumber: text }))}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.md }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCardData.expiryDate}
                  onChangeText={(text) => setNewCardData(prev => ({ ...prev, expiryDate: text }))}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCardData.cvv}
                  onChangeText={(text) => setNewCardData(prev => ({ ...prev, cvv: text }))}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Name</Text>
              <TextInput
                style={styles.textInput}
                value={newCardData.cardName}
                onChangeText={(text) => setNewCardData(prev => ({ ...prev, cardName: text }))}
                placeholder="John Doe"
              />
            </View>
            
            <View style={styles.securityNote}>
              <Icon name="info" size={20} color={colors.primary} />
              <Text style={styles.securityNoteText}>
                Your card details will be immediately encrypted and tokenized for security.
              </Text>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="Add Card"
              onPress={addNewCard}
              style={styles.addButtonModal}
            />
          </View>
        </View>
      </Modal>

      {/* Token Details Modal */}
      <Modal
        visible={showTokenDetails !== null}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tokenModalContent}>
            <View style={styles.tokenModalHeader}>
              <Text style={styles.tokenModalTitle}>Token Details</Text>
              <TouchableOpacity onPress={() => setShowTokenDetails(null)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {showTokenDetails && (
              <View style={styles.tokenDetails}>
                <View style={styles.tokenItem}>
                  <Text style={styles.tokenLabel}>Card Name</Text>
                  <Text style={styles.tokenValue}>{showTokenDetails.cardName}</Text>
                </View>
                
                <View style={styles.tokenItem}>
                  <Text style={styles.tokenLabel}>Last Four Digits</Text>
                  <Text style={styles.tokenValue}>**** {showTokenDetails.lastFour}</Text>
                </View>
                
                <View style={styles.tokenItem}>
                  <Text style={styles.tokenLabel}>Token</Text>
                  <Text style={styles.tokenValue}>{showTokenDetails.token}</Text>
                </View>
                
                <View style={styles.tokenItem}>
                  <Text style={styles.tokenLabel}>Created</Text>
                  <Text style={styles.tokenValue}>{formatDate(showTokenDetails.createdAt)}</Text>
                </View>
                
                <View style={styles.securityBadge}>
                  <Icon name="verified" size={20} color="#4CAF50" />
                  <Text style={styles.securityBadgeText}>Securely Tokenized</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  securityOverview: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  securityItem: {
    alignItems: 'center',
  },
  securityValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  securityLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  encryptionCard: {
    padding: spacing.lg,
  },
  encryptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  encryptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  encryptionDetails: {
    marginLeft: spacing.md,
  },
  encryptionAlgorithm: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  encryptionKeyLength: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  encryptionStatus: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  encryptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastRotated: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  rotateButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rotateButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  cardCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetails: {
    marginLeft: spacing.md,
  },
  cardName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  defaultText: {
    fontSize: typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.semibold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  settingsCard: {
    padding: spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  metricsCard: {
    padding: spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  auditInfo: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  auditText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
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
    paddingTop: spacing.xl,
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
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputRow: {
    flexDirection: 'row',
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  securityNoteText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButtonModal: {
    marginBottom: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenModalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    margin: spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  tokenModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tokenModalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  tokenDetails: {
    gap: spacing.md,
  },
  tokenItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  tokenLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tokenValue: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF5010',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  securityBadgeText: {
    fontSize: typography.fontSize.sm,
    color: '#4CAF50',
    marginLeft: spacing.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default EncryptionTokenizationScreen;
