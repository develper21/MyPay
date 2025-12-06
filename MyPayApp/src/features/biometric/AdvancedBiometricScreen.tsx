import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientCard from '../../components/ui/GradientCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

interface BiometricMethod {
  id: string;
  name: string;
  type: 'fingerprint' | 'face' | 'iris' | 'voice' | 'palm';
  enabled: boolean;
  accuracy: number;
  lastUsed: string;
  status: 'active' | 'inactive' | 'training';
}

interface BiometricSession {
  id: string;
  method: string;
  timestamp: string;
  success: boolean;
  confidence: number;
}

const AdvancedBiometricScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [biometricMethods, setBiometricMethods] = useState<BiometricMethod[]>([
    {
      id: '1',
      name: 'Fingerprint',
      type: 'fingerprint',
      enabled: true,
      accuracy: 98.5,
      lastUsed: new Date(Date.now() - 300000).toISOString(),
      status: 'active',
    },
    {
      id: '2',
      name: 'Face Recognition',
      type: 'face',
      enabled: true,
      accuracy: 96.2,
      lastUsed: new Date(Date.now() - 600000).toISOString(),
      status: 'active',
    },
    {
      id: '3',
      name: 'Iris Scanner',
      type: 'iris',
      enabled: false,
      accuracy: 99.8,
      lastUsed: new Date(Date.now() - 86400000).toISOString(),
      status: 'inactive',
    },
    {
      id: '4',
      name: 'Voice Recognition',
      type: 'voice',
      enabled: false,
      accuracy: 94.1,
      lastUsed: new Date(Date.now() - 172800000).toISOString(),
      status: 'training',
    },
  ]);

  const [recentSessions, setRecentSessions] = useState<BiometricSession[]>([
    {
      id: '1',
      method: 'Fingerprint',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      success: true,
      confidence: 98.5,
    },
    {
      id: '2',
      method: 'Face Recognition',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      success: true,
      confidence: 96.2,
    },
    {
      id: '3',
      method: 'Fingerprint',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      success: false,
      confidence: 45.2,
    },
  ]);

  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<BiometricMethod | null>(null);
  const [multiFactorEnabled, setMultiFactorEnabled] = useState(true);
  const [adaptiveSecurity, setAdaptiveSecurity] = useState(true);

  useEffect(() => {
    simulateBiometricCheck();
  }, []);

  const simulateBiometricCheck = () => {
    const interval = setInterval(() => {
      const randomMethod = biometricMethods[Math.floor(Math.random() * biometricMethods.length)];
      const success = Math.random() > 0.1;
      
      const newSession: BiometricSession = {
        id: Date.now().toString(),
        method: randomMethod.name,
        timestamp: new Date().toISOString(),
        success,
        confidence: success ? randomMethod.accuracy : Math.random() * 50,
      };
      
      setRecentSessions(prev => [newSession, ...prev.slice(0, 9)]);
    }, 30000);

    return () => clearInterval(interval);
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'fingerprint': return 'fingerprint';
      case 'face': return 'face';
      case 'iris': return 'visibility';
      case 'voice': return 'mic';
      case 'palm': return 'pan-tool';
      default: return 'security';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return colors.textTertiary;
      case 'training': return '#FF9800';
      default: return colors.textSecondary;
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const toggleMethod = (methodId: string) => {
    setBiometricMethods(prev => 
      prev.map(method => 
        method.id === methodId 
          ? { ...method, enabled: !method.enabled, status: !method.enabled ? 'active' : 'inactive' }
          : method
      )
    );
  };

  const startTraining = (method: BiometricMethod) => {
    setSelectedMethod(method);
    setShowTrainingModal(true);
    
    setTimeout(() => {
      setBiometricMethods(prev => 
        prev.map(m => 
          m.id === method.id 
            ? { ...m, status: 'active' as const, enabled: true }
            : m
        )
      );
      setShowTrainingModal(false);
      Alert.alert('Success', `${method.name} training completed successfully!`);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <GradientCard gradientColors={[colors.primary, colors.primary + '80']} padding={0}>
          <View style={styles.headerCard}>
            <Icon name="fingerprint" size={48} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Advanced Biometrics</Text>
            <Text style={styles.headerSubtitle}>Next-generation authentication</Text>
            
            <View style={styles.biometricOverview}>
              <View style={styles.biometricItem}>
                <Text style={styles.biometricValue}>{biometricMethods.filter(m => m.enabled).length}</Text>
                <Text style={styles.biometricLabel}>Active Methods</Text>
              </View>
              <View style={styles.biometricItem}>
                <Text style={styles.biometricValue}>97.3%</Text>
                <Text style={styles.biometricLabel}>Avg Accuracy</Text>
              </View>
              <View style={styles.biometricItem}>
                <Text style={styles.biometricValue}>{recentSessions.filter(s => s.success).length}</Text>
                <Text style={styles.biometricLabel}>Success Today</Text>
              </View>
            </View>
          </View>
        </GradientCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biometric Methods</Text>
          
          {biometricMethods.map(method => (
            <Card key={method.id} style={styles.methodCard}>
              <View style={styles.methodHeader}>
                <View style={styles.methodInfo}>
                  <Icon name={getMethodIcon(method.type)} size={24} color={colors.primary} />
                  <View style={styles.methodDetails}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    <Text style={styles.methodType}>{method.type}</Text>
                  </View>
                </View>
                <View style={styles.methodStatus}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(method.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(method.status) }]}>
                    {method.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.methodContent}>
                <View style={styles.accuracyBar}>
                  <Text style={styles.accuracyText}>Accuracy: {method.accuracy}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${method.accuracy}%` }]} />
                  </View>
                </View>
                
                <Text style={styles.lastUsed}>Last used: {formatTime(method.lastUsed)}</Text>
              </View>
              
              <View style={styles.methodFooter}>
                <Switch
                  value={method.enabled}
                  onValueChange={() => toggleMethod(method.id)}
                  trackColor={{ false: colors.border, true: colors.primary + '40' }}
                  thumbColor={method.enabled ? colors.primary : colors.textTertiary}
                />
                
                {method.status === 'training' && (
                  <TouchableOpacity 
                    style={styles.trainButton}
                    onPress={() => startTraining(method)}
                  >
                    <Icon name="school" size={16} color={colors.primary} />
                    <Text style={styles.trainText}>Complete Training</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="security" size={24} color={colors.primary} />
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>Multi-Factor Authentication</Text>
                  <Text style={styles.settingDescription}>Require multiple biometric methods</Text>
                </View>
              </View>
              <Switch
                value={multiFactorEnabled}
                onValueChange={setMultiFactorEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={multiFactorEnabled ? colors.primary : colors.textTertiary}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="auto-fix-high" size={24} color={colors.primary} />
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>Adaptive Security</Text>
                  <Text style={styles.settingDescription}>Adjust security based on context</Text>
                </View>
              </View>
              <Switch
                value={adaptiveSecurity}
                onValueChange={setAdaptiveSecurity}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={adaptiveSecurity ? colors.primary : colors.textTertiary}
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          
          {recentSessions.map(session => (
            <Card key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionInfo}>
                  <Icon name="history" size={20} color={session.success ? '#4CAF50' : colors.danger} />
                  <View style={styles.sessionDetails}>
                    <Text style={styles.sessionMethod}>{session.method}</Text>
                    <Text style={styles.sessionTime}>{formatTime(session.timestamp)}</Text>
                  </View>
                </View>
                <View style={styles.sessionResult}>
                  <Text style={[session.success ? styles.successText : styles.failText]}>
                    {session.success ? 'Success' : 'Failed'}
                  </Text>
                  <Text style={styles.confidenceText}>{session.confidence.toFixed(1)}%</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showTrainingModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="school" size={48} color={colors.primary} />
            <Text style={styles.modalTitle}>Training Biometric</Text>
            <Text style={styles.modalDescription}>
              Please wait while we train {selectedMethod?.name}...
            </Text>
            <View style={styles.loadingIndicator}>
              <View style={styles.loadingDot} />
              <View style={[styles.loadingDot, { animationDelay: '0.2s' }]} />
              <View style={[styles.loadingDot, { animationDelay: '0.4s' }]} />
            </View>
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
  biometricOverview: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  biometricItem: {
    alignItems: 'center',
  },
  biometricValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  biometricLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
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
  methodCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodDetails: {
    marginLeft: spacing.md,
  },
  methodName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  methodType: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  methodStatus: {
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
  methodContent: {
    marginBottom: spacing.md,
  },
  accuracyBar: {
    marginBottom: spacing.sm,
  },
  accuracyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  lastUsed: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  methodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '10',
  },
  trainText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginLeft: spacing.xs,
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
  sessionCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDetails: {
    marginLeft: spacing.sm,
  },
  sessionMethod: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sessionTime: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  sessionResult: {
    alignItems: 'flex-end',
  },
  successText: {
    fontSize: typography.fontSize.sm,
    color: '#4CAF50',
    fontWeight: typography.fontWeight.semibold,
  },
  failText: {
    fontSize: typography.fontSize.sm,
    color: colors.danger,
    fontWeight: typography.fontWeight.semibold,
  },
  confidenceText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
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
    width: '90%',
    maxWidth: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  loadingIndicator: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});

export default AdvancedBiometricScreen;
