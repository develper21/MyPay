import React, { useState } from 'react';
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

interface IntegrationService {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'payment' | 'ecommerce' | 'loyalty' | 'banking';
  enabled: boolean;
  connected: boolean;
  features: string[];
  popularity: number;
}

interface ConnectedAccount {
  id: string;
  service: string;
  accountName: string;
  lastSync: string;
  status: 'active' | 'inactive' | 'error';
}

const IntegrationHubScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [integrationServices, setIntegrationServices] = useState<IntegrationService[]>([
    {
      id: 'upi',
      name: 'UPI Integration',
      description: 'Connect all major UPI providers for seamless payments',
      icon: 'account-balance-wallet',
      category: 'payment',
      enabled: true,
      connected: true,
      features: ['Instant transfers', 'QR payments', 'Bill payments'],
      popularity: 95,
    },
    {
      id: 'shopify',
      name: 'Shopify Payments',
      description: 'Integrate with Shopify for e-commerce transactions',
      icon: 'shopping-cart',
      category: 'ecommerce',
      enabled: false,
      connected: false,
      features: ['Checkout integration', 'Inventory sync', 'Analytics'],
      popularity: 88,
    },
    {
      id: 'loyalty',
      name: 'Loyalty Programs',
      description: 'Connect with popular loyalty and reward programs',
      icon: 'card-membership',
      category: 'loyalty',
      enabled: true,
      connected: true,
      features: ['Points tracking', 'Reward redemption', 'Tier management'],
      popularity: 76,
    },
    {
      id: 'banking',
      name: 'Banking APIs',
      description: 'Direct integration with major banking services',
      icon: 'account-balance',
      category: 'banking',
      enabled: false,
      connected: false,
      features: ['Account linking', 'Transaction history', 'Balance sync'],
      popularity: 92,
    },
    {
      id: 'paypal',
      name: 'PayPal Integration',
      description: 'Connect PayPal for international transactions',
      icon: 'payments',
      category: 'payment',
      enabled: false,
      connected: false,
      features: ['Global payments', 'Currency conversion', 'Buyer protection'],
      popularity: 84,
    },
    {
      id: 'razorpay',
      name: 'Razorpay Gateway',
      description: 'Advanced payment gateway for businesses',
      icon: 'credit-card',
      category: 'payment',
      enabled: true,
      connected: true,
      features: ['Multiple payment methods', 'Auto-retry', 'Analytics'],
      popularity: 90,
    },
  ]);

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    {
      id: '1',
      service: 'UPI',
      accountName: 'user@paytm',
      lastSync: new Date().toISOString(),
      status: 'active',
    },
    {
      id: '2',
      service: 'Loyalty',
      accountName: 'MyPay Rewards',
      lastSync: new Date(Date.now() - 3600000).toISOString(),
      status: 'active',
    },
  ]);

  const [showConnectModal, setShowConnectModal] = useState<IntegrationService | null>(null);
  const [showAccountModal, setShowAccountModal] = useState<ConnectedAccount | null>(null);
  const [connectionCode, setConnectionCode] = useState('');
  const [integrationScore, setIntegrationScore] = useState(68);

  const toggleService = (serviceId: string) => {
    setIntegrationServices(prev => 
      prev.map(service => 
        service.id === serviceId 
          ? { ...service, enabled: !service.enabled }
          : service
      )
    );
    calculateIntegrationScore();
  };

  const connectService = (service: IntegrationService) => {
    setShowConnectModal(service);
  };

  const performConnection = () => {
    if (!showConnectModal) return;
    
    if (connectionCode.length < 6) {
      Alert.alert('Error', 'Please enter a valid connection code');
      return;
    }

    // Simulate connection process
    setIntegrationServices(prev => 
      prev.map(service => 
        service.id === showConnectModal.id 
          ? { ...service, connected: true }
          : service
      )
    );

    // Add to connected accounts
    const newAccount: ConnectedAccount = {
      id: Date.now().toString(),
      service: showConnectModal.name,
      accountName: `user_${showConnectModal.id}`,
      lastSync: new Date().toISOString(),
      status: 'active',
    };

    setConnectedAccounts(prev => [...prev, newAccount]);
    setShowConnectModal(null);
    setConnectionCode('');
    calculateIntegrationScore();
    
    Alert.alert('Success', `${showConnectModal.name} connected successfully!`);
  };

  const disconnectService = (serviceId: string) => {
    Alert.alert(
      'Disconnect Service',
      'Are you sure you want to disconnect this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: () => {
            setIntegrationServices(prev => 
              prev.map(service => 
                service.id === serviceId 
                  ? { ...service, connected: false, enabled: false }
                  : service
              )
            );
            
            setConnectedAccounts(prev => 
              prev.filter(account => !account.service.includes(
                integrationServices.find(s => s.id === serviceId)?.name || ''
              ))
            );
            
            calculateIntegrationScore();
            Alert.alert('Success', 'Service disconnected successfully');
          }
        }
      ]
    );
  };

  const syncAccount = (accountId: string) => {
    Alert.alert('Syncing', 'Syncing account data...');
    
    setTimeout(() => {
      setConnectedAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, lastSync: new Date().toISOString(), status: 'active' as const }
            : account
        )
      );
      Alert.alert('Success', 'Account synced successfully!');
    }, 2000);
  };

  const calculateIntegrationScore = () => {
    const connectedServices = integrationServices.filter(s => s.connected).length;
    const enabledServices = integrationServices.filter(s => s.enabled).length;
    const totalServices = integrationServices.length;
    
    const score = Math.round(((connectedServices * 0.6) + (enabledServices * 0.4)) / totalServices * 100);
    setIntegrationScore(score);
  };

  const getIntegrationLevel = () => {
    if (integrationScore >= 80) return { level: 'Highly Integrated', color: '#4CAF50' };
    if (integrationScore >= 60) return { level: 'Well Integrated', color: '#8BC34A' };
    if (integrationScore >= 40) return { level: 'Partially Integrated', color: '#FF9800' };
    return { level: 'Limited Integration', color: colors.danger };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#FF9800';
      case 'error': return colors.danger;
      default: return colors.textTertiary;
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const integrationLevel = getIntegrationLevel();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Integration Score */}
        <GradientCard gradientColors={[integrationLevel.color, integrationLevel.color + '80']} padding={0}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreLabel}>Integration Score</Text>
              <Icon name="hub" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.scoreValue}>{integrationScore}%</Text>
            <Text style={styles.scoreLevel}>{integrationLevel.level}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${integrationScore}%`, backgroundColor: '#FFFFFF' }
                ]} 
              />
            </View>
            <Text style={styles.scoreDescription}>
              {connectedAccounts.length} services connected
            </Text>
          </View>
        </GradientCard>

        {/* Connected Accounts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Connected Accounts</Text>
            <View style={styles.accountBadge}>
              <Text style={styles.accountBadgeText}>{connectedAccounts.length}</Text>
            </View>
          </View>
          
          {connectedAccounts.map(account => (
            <TouchableOpacity 
              key={account.id} 
              style={styles.accountCard}
              onPress={() => setShowAccountModal(account)}
            >
              <View style={styles.accountHeader}>
                <Icon name="account-circle" size={24} color={colors.primary} />
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{account.accountName}</Text>
                  <Text style={styles.accountService}>{account.service}</Text>
                </View>
                <View style={styles.accountStatus}>
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(account.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(account.status) }]}>
                    {account.status}
                  </Text>
                </View>
              </View>
              <View style={styles.accountFooter}>
                <Text style={styles.lastSync}>Last sync: {formatTime(account.lastSync)}</Text>
                <TouchableOpacity onPress={() => syncAccount(account.id)}>
                  <Icon name="sync" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Integration Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Integrations</Text>
          
          {['payment', 'ecommerce', 'loyalty', 'banking'].map(category => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>
                {category === 'payment' ? 'Payment Services' : 
                 category === 'ecommerce' ? 'E-commerce' : 
                 category === 'loyalty' ? 'Loyalty Programs' : 'Banking'}
              </Text>
              
              {integrationServices
                .filter(service => service.category === category)
                .map(service => (
                  <Card key={service.id} style={styles.serviceCard}>
                    <View style={styles.serviceHeader}>
                      <View style={styles.serviceInfo}>
                        <Icon name={service.icon} size={24} color={colors.primary} />
                        <View style={styles.serviceDetails}>
                          <Text style={styles.serviceName}>{service.name}</Text>
                          <Text style={styles.serviceDescription}>{service.description}</Text>
                          <View style={styles.popularityBar}>
                            <Text style={styles.popularityLabel}>Popularity: {service.popularity}%</Text>
                            <View style={styles.popularityTrack}>
                              <View 
                                style={[styles.popularityFill, { width: `${service.popularity}%` }]} 
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                      <View style={styles.serviceActions}>
                        <Switch
                          value={service.enabled}
                          onValueChange={() => toggleService(service.id)}
                          trackColor={{ false: colors.border, true: colors.primary + '40' }}
                          thumbColor={service.enabled ? colors.primary : colors.textTertiary}
                        />
                      </View>
                    </View>
                    
                    <View style={styles.serviceFeatures}>
                      {service.features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                          <Icon name="check-circle" size={16} color="#4CAF50" />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                    
                    <View style={styles.serviceFooter}>
                      <View style={styles.connectionStatus}>
                        {service.connected ? (
                          <View style={styles.connectedStatus}>
                            <Icon name="check-circle" size={16} color="#4CAF50" />
                            <Text style={styles.connectedText}>Connected</Text>
                          </View>
                        ) : (
                          <View style={styles.disconnectedStatus}>
                            <Icon name="link-off" size={16} color={colors.textTertiary} />
                            <Text style={styles.disconnectedText}>Not Connected</Text>
                          </View>
                        )}
                      </View>
                      
                      {service.enabled && (
                        <TouchableOpacity 
                          style={[
                            styles.connectButton,
                            service.connected && styles.disconnectButton
                          ]}
                          onPress={() => service.connected ? disconnectService(service.id) : connectService(service)}
                        >
                          <Text style={[
                            styles.connectButtonText,
                            service.connected && styles.disconnectButtonText
                          ]}>
                            {service.connected ? 'Disconnect' : 'Connect'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Card>
                ))}
            </View>
          ))}
        </View>

        {/* Integration Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integration Benefits</Text>
          <Card style={styles.benefitsCard}>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Icon name="speed" size={20} color={colors.primary} />
                <Text style={styles.benefitText}>Faster transactions with connected services</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="sync" size={20} color={colors.primary} />
                <Text style={styles.benefitText}>Automatic data synchronization</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="security" size={20} color={colors.primary} />
                <Text style={styles.benefitText}>Enhanced security through trusted partners</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="analytics" size={20} color={colors.primary} />
                <Text style={styles.benefitText}>Unified analytics and reporting</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Connect Modal */}
      <Modal
        visible={showConnectModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {showConnectModal && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Connect {showConnectModal.name}</Text>
              <TouchableOpacity onPress={() => setShowConnectModal(null)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.connectInfo}>
                <Icon name={showConnectModal.icon} size={48} color={colors.primary} />
                <Text style={styles.connectTitle}>Connect Your Account</Text>
                <Text style={styles.connectDescription}>
                  Enter the connection code from {showConnectModal.name} to link your account
                </Text>
              </View>
              
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Connection Code</Text>
                <TextInput
                  style={styles.codeInput}
                  value={connectionCode}
                  onChangeText={setConnectionCode}
                  placeholder="Enter 6-digit code"
                  keyboardType="numeric"
                  maxLength={6}
                  textAlign="center"
                />
              </View>
              
              <View style={styles.connectSteps}>
                <Text style={styles.stepsTitle}>How to get connection code:</Text>
                <View style={styles.stepItem}>
                  <Text style={styles.stepNumber}>1</Text>
                  <Text style={styles.stepText}>Open {showConnectModal.name} app or website</Text>
                </View>
                <View style={styles.stepItem}>
                  <Text style={styles.stepNumber}>2</Text>
                  <Text style={styles.stepText}>Go to Settings {'>'} Integrations {'>'} MyPay</Text>
                </View>
                <View style={styles.stepItem}>
                  <Text style={styles.stepNumber}>3</Text>
                  <Text style={styles.stepText}>Generate and copy the connection code</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowConnectModal(null)}
                style={styles.modalButton}
              />
              <Button
                title="Connect"
                onPress={performConnection}
                disabled={connectionCode.length < 6}
                style={styles.modalButton}
              />
            </View>
          </View>
        )}
      </Modal>

      {/* Account Details Modal */}
      <Modal
        visible={showAccountModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {showAccountModal && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Details</Text>
              <TouchableOpacity onPress={() => setShowAccountModal(null)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.accountDetailSection}>
                <Text style={styles.detailTitle}>Account Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Service:</Text>
                  <Text style={styles.detailValue}>{showAccountModal.service}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account:</Text>
                  <Text style={styles.detailValue}>{showAccountModal.accountName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[styles.detailValue, { color: getStatusColor(showAccountModal.status) }]}>
                    {showAccountModal.status}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Sync:</Text>
                  <Text style={styles.detailValue}>{formatTime(showAccountModal.lastSync)}</Text>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                title="Sync Now"
                onPress={() => syncAccount(showAccountModal.id)}
                style={styles.modalButton}
              />
            </View>
          </View>
        )}
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
  scoreCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  scoreLabel: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: typography.fontWeight.medium,
  },
  scoreValue: {
    fontSize: typography.fontSize.massive,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  scoreLevel: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.lg,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
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
  accountBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  accountBadgeText: {
    fontSize: typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  accountInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  accountName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  accountService: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  accountStatus: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastSync: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  serviceCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  serviceInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  serviceDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  serviceName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  popularityBar: {
    gap: spacing.xs,
  },
  popularityLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  popularityTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    width: 100,
  },
  popularityFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  serviceActions: {
    marginLeft: spacing.md,
  },
  serviceFeatures: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionStatus: {
    flex: 1,
  },
  connectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedText: {
    fontSize: typography.fontSize.xs,
    color: '#4CAF50',
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  disconnectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disconnectedText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  connectButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  disconnectButton: {
    backgroundColor: colors.danger,
  },
  connectButtonText: {
    fontSize: typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.semibold,
  },
  disconnectButtonText: {
    color: '#FFFFFF',
  },
  benefitsCard: {
    padding: spacing.lg,
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
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
  connectInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  connectTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  connectDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: typography.fontSize.xl,
    color: colors.text,
    backgroundColor: colors.surface,
    letterSpacing: 8,
  },
  connectSteps: {
    gap: spacing.md,
  },
  stepsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: spacing.sm,
  },
  stepText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  accountDetailSection: {
    marginBottom: spacing.xl,
  },
  detailTitle: {
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

export default IntegrationHubScreen;
