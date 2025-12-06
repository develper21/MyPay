import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import AdvancedSecurityManager from '../../core/AdvancedSecurityManager';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientCard from '../../components/ui/GradientCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

interface SecurityFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  category: 'authentication' | 'encryption' | 'monitoring' | 'fraud';
  status: 'active' | 'inactive' | 'warning' | 'error';
  lastChecked?: string;
}

interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

const EnhancedSecurityScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [securityManager] = useState(() => AdvancedSecurityManager.getInstance());
  const [securityFeatures, setSecurityFeatures] = useState<SecurityFeature[]>([
    {
      id: 'biometric_auth',
      title: 'Biometric Authentication',
      description: 'Use fingerprint or face recognition for secure access',
      icon: 'fingerprint',
      enabled: false,
      category: 'authentication',
      status: 'inactive',
    },
    {
      id: 'multi_factor',
      title: 'Multi-Factor Authentication',
      description: 'Extra layer of security with multiple verification steps',
      icon: 'verified-user',
      enabled: true,
      category: 'authentication',
      status: 'active',
    },
    {
      id: 'end_to_end_encryption',
      title: 'End-to-End Encryption',
      description: 'All data encrypted with military-grade security',
      icon: 'enhanced-encryption',
      enabled: true,
      category: 'encryption',
      status: 'active',
    },
    {
      id: 'tokenization',
      title: 'Payment Tokenization',
      description: 'Replace sensitive data with secure tokens',
      icon: 'credit-card',
      enabled: true,
      category: 'encryption',
      status: 'active',
    },
    {
      id: 'fraud_detection',
      title: 'AI Fraud Detection',
      description: 'Real-time AI-powered fraud analysis',
      icon: 'security',
      enabled: true,
      category: 'fraud',
      status: 'active',
    },
    {
      id: 'real_time_monitoring',
      title: 'Real-Time Monitoring',
      description: '24/7 security monitoring and threat detection',
      icon: 'visibility',
      enabled: true,
      category: 'monitoring',
      status: 'active',
    },
  ]);

  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      type: 'info',
      title: 'Security Update Available',
      message: 'New security features are available. Update to enhance protection.',
      timestamp: new Date().toISOString(),
      acknowledged: false,
    },
  ]);

  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [showPINSetup, setShowPINSetup] = useState(false);
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [securityScore, setSecurityScore] = useState(85);

  useEffect(() => {
    initializeSecurity();
  }, []);

  const initializeSecurity = async () => {
    try {
      await securityManager.startSecurityMonitoring();
      checkSecurityStatus();
    } catch (error) {
      console.error('Failed to initialize security:', error);
    }
  };

  const checkSecurityStatus = () => {
    // Check biometric status
    const biometricEnabled = securityFeatures.find(f => f.id === 'biometric_auth');
    if (biometricEnabled) {
      // Check if biometrics are actually enabled
      biometricEnabled.status = biometricEnabled.enabled ? 'active' : 'inactive';
    }

    // Calculate security score
    const enabledFeatures = securityFeatures.filter(f => f.enabled).length;
    const totalFeatures = securityFeatures.length;
    const score = Math.round((enabledFeatures / totalFeatures) * 100);
    setSecurityScore(score);
  };

  const toggleFeature = async (featureId: string) => {
    const feature = securityFeatures.find(f => f.id === featureId);
    if (!feature) return;

    if (feature.id === 'biometric_auth' && !feature.enabled) {
      setShowBiometricSetup(true);
      return;
    }

    setSecurityFeatures(prev => 
      prev.map(f => 
        f.id === featureId 
          ? { ...f, enabled: !f.enabled, status: !f.enabled ? 'active' : 'inactive' }
          : f
      )
    );

    // Update security score
    const updatedFeatures = securityFeatures.map(f => 
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    );
    const enabledCount = updatedFeatures.filter(f => f.enabled).length;
    const totalFeaturesCount = updatedFeatures.length;
    const newScore = Math.round((enabledCount / totalFeaturesCount) * 100);
    setSecurityScore(newScore);
  };

  const setupBiometricAuth = async () => {
    try {
      const success = await securityManager.setupBiometricAuth();
      if (success) {
        toggleFeature('biometric_auth');
        setShowBiometricSetup(false);
        Alert.alert('Success', 'Biometric authentication enabled successfully!');
      } else {
        Alert.alert('Error', 'Failed to setup biometric authentication');
      }
    } catch (error) {
      console.error('Biometric setup failed:', error);
      Alert.alert('Error', 'Failed to setup biometric authentication');
    }
  };

  const setupPIN = async () => {
    if (newPIN.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits');
      return;
    }

    if (newPIN !== confirmPIN) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    try {
      const success = await securityManager.authenticateWithPIN(newPIN);
      if (success) {
        setShowPINSetup(false);
        setNewPIN('');
        setConfirmPIN('');
        Alert.alert('Success', 'PIN authentication setup completed!');
      } else {
        Alert.alert('Error', 'Failed to setup PIN authentication');
      }
    } catch (error) {
      console.error('PIN setup failed:', error);
      Alert.alert('Error', 'Failed to setup PIN authentication');
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setSecurityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getSecurityLevel = () => {
    if (securityScore >= 90) return { level: 'Excellent', color: '#4CAF50' };
    if (securityScore >= 70) return { level: 'Good', color: '#8BC34A' };
    if (securityScore >= 50) return { level: 'Fair', color: '#FF9800' };
    return { level: 'Needs Improvement', color: '#F44336' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return colors.textTertiary;
      case 'warning': return '#FF9800';
      case 'error': return colors.danger;
      default: return colors.textTertiary;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return '#FF9800';
      case 'error': return colors.danger;
      case 'info': return colors.primary;
      default: return colors.primary;
    }
  };

  const securityLevel = getSecurityLevel();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Security Score Header */}
        <GradientCard gradientColors={['#4CAF50', '#8BC34A']} padding={0}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreLabel}>Security Score</Text>
              <Icon name="shield" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.scoreValue}>{securityScore}%</Text>
            <Text style={styles.scoreLevel}>{securityLevel.level}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${securityScore}%`, backgroundColor: '#FFFFFF' }
                ]} 
              />
            </View>
            <Text style={styles.scoreDescription}>
              Your account is {securityLevel.level.toLowerCase()} protected
            </Text>
          </View>
        </GradientCard>

        {/* Security Alerts */}
        {securityAlerts.filter(alert => !alert.acknowledged).length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Security Alerts</Text>
            {securityAlerts
              .filter(alert => !alert.acknowledged)
              .map(alert => (
                <Card key={alert.id} style={styles.alertCard}>
                  <View style={[styles.alertContent, { borderLeftColor: getAlertColor(alert.type), borderLeftWidth: 4 }]}>
                    <Icon name={getAlertIcon(alert.type)} size={24} color={getAlertColor(alert.type)} />
                    <View style={styles.alertInfo}>
                      <Text style={styles.alertTitle}>{alert.title}</Text>
                      <Text style={styles.alertMessage}>{alert.message}</Text>
                    </View>
                    <TouchableOpacity onPress={() => acknowledgeAlert(alert.id)}>
                      <Icon name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
          </View>
        )}

        {/* Quick Security Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => setShowBiometricSetup(true)}
            >
              <Icon name="fingerprint" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Setup Biometrics</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => setShowPINSetup(true)}
            >
              <Icon name="lock" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Change PIN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="history" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Security Log</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Features</Text>
          
          {['authentication', 'encryption', 'fraud', 'monitoring'].map(category => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>
                {category === 'authentication' ? 'Authentication' : 
                 category === 'encryption' ? 'Data Protection' : 
                 category === 'fraud' ? 'Fraud Protection' : 'Monitoring'}
              </Text>
              
              {securityFeatures
                .filter(feature => feature.category === category)
                .map(feature => (
                  <Card key={feature.id} style={styles.featureCard}>
                    <View style={styles.featureContent}>
                      <View style={styles.featureInfo}>
                        <View style={styles.featureIcon}>
                          <Icon name={feature.icon} size={24} color={colors.primary} />
                        </View>
                        <View style={styles.featureDetails}>
                          <Text style={styles.featureTitle}>{feature.title}</Text>
                          <Text style={styles.featureDescription}>{feature.description}</Text>
                          <View style={styles.featureStatus}>
                            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(feature.status) }]} />
                            <Text style={[styles.statusText, { color: getStatusColor(feature.status) }]}>
                              {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Switch
                        value={feature.enabled}
                        onValueChange={() => toggleFeature(feature.id)}
                        trackColor={{ false: colors.border, true: colors.primary + '40' }}
                        thumbColor={feature.enabled ? colors.primary : colors.textTertiary}
                      />
                    </View>
                  </Card>
                ))}
            </View>
          ))}
        </View>

        {/* Security Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Tips</Text>
          <Card style={styles.tipsCard}>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Enable biometric authentication for faster, secure access</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Never share your PIN or biometric data with anyone</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Keep your app updated for latest security features</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Review transaction history regularly</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Use secure Wi-Fi networks for transactions</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Biometric Setup Modal */}
      <Modal
        visible={showBiometricSetup}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Setup Biometric Authentication</Text>
            <TouchableOpacity onPress={() => setShowBiometricSetup(false)}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.biometricInfo}>
              <Icon name="fingerprint" size={64} color={colors.primary} />
              <Text style={styles.biometricTitle}>Secure & Convenient</Text>
              <Text style={styles.biometricDescription}>
                Use your fingerprint or face to authenticate instantly. No more remembering passwords!
              </Text>
            </View>
            
            <View style={styles.biometricBenefits}>
              <Text style={styles.benefitsTitle}>Benefits:</Text>
              <View style={styles.benefitItem}>
                <Icon name="speed" size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>Lightning fast authentication</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="security" size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>Military-grade security</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="touch-app" size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>No passwords to remember</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setShowBiometricSetup(false)}
              style={styles.modalButton}
            />
            <Button
              title="Setup Now"
              onPress={setupBiometricAuth}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* PIN Setup Modal */}
      <Modal
        visible={showPINSetup}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Setup PIN Authentication</Text>
            <TouchableOpacity onPress={() => setShowPINSetup(false)}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.pinInputSection}>
              <Text style={styles.pinInputLabel}>Enter New PIN</Text>
              <TextInput
                style={styles.pinInput}
                value={newPIN}
                onChangeText={setNewPIN}
                placeholder="Enter 4-6 digit PIN"
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
              
              <Text style={styles.pinInputLabel}>Confirm PIN</Text>
              <TextInput
                style={styles.pinInput}
                value={confirmPIN}
                onChangeText={setConfirmPIN}
                placeholder="Re-enter PIN"
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
            
            <View style={styles.pinRequirements}>
              <Text style={styles.requirementsTitle}>PIN Requirements:</Text>
              <View style={styles.requirementItem}>
                <Icon name="check-circle" size={16} color={newPIN.length >= 4 ? '#4CAF50' : colors.textTertiary} />
                <Text style={styles.requirementText}>At least 4 digits</Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon name="check-circle" size={16} color={newPIN === confirmPIN && newPIN.length > 0 ? '#4CAF50' : colors.textTertiary} />
                <Text style={styles.requirementText}>PINs must match</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setShowPINSetup(false)}
              style={styles.modalButton}
            />
            <Button
              title="Setup PIN"
              onPress={setupPIN}
              disabled={newPIN.length < 4 || newPIN !== confirmPIN}
              style={styles.modalButton}
            />
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
  alertsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  alertCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary, // Default color
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  alertTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  alertMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
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
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
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
  featureCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  featureContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureDetails: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  featureStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  tipsCard: {
    padding: spacing.lg,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
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
  biometricInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  biometricTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  biometricDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  biometricBenefits: {
    gap: spacing.md,
  },
  benefitsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  pinInputSection: {
    marginBottom: spacing.xl,
  },
  pinInputLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    backgroundColor: colors.surface,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: spacing.lg,
  },
  pinRequirements: {
    gap: spacing.sm,
  },
  requirementsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
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

export default EnhancedSecurityScreen;
