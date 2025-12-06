import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
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
  category: 'fraud' | 'privacy' | 'transaction';
}

const SecurityScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [securityFeatures, setSecurityFeatures] = useState<SecurityFeature[]>([
    {
      id: 'fraud_detection',
      title: 'AI Fraud Detection',
      description: 'Advanced AI algorithms detect suspicious transactions in real-time',
      icon: 'security',
      enabled: true,
      category: 'fraud'
    },
    {
      id: 'qr_verification',
      title: 'QR Code Verification',
      description: 'Verify merchant QR codes before scanning to prevent fraud',
      icon: 'qr-code-scanner',
      enabled: true,
      category: 'fraud'
    },
    {
      id: 'transaction_limits',
      title: 'Smart Transaction Limits',
      description: 'Automatically adjust limits based on spending patterns',
      icon: 'account-balance-wallet',
      enabled: true,
      category: 'transaction'
    },
    {
      id: 'biometric_auth',
      title: 'Biometric Authentication',
      description: 'Use fingerprint or face recognition for secure access',
      icon: 'fingerprint',
      enabled: false,
      category: 'privacy'
    },
    {
      id: 'remote_access_block',
      title: 'Remote Access Protection',
      description: 'Block remote access attempts to your device',
      icon: 'phonelink-lock',
      enabled: true,
      category: 'privacy'
    },
    {
      id: 'phishing_alert',
      title: 'Phishing Alert System',
      description: 'Get alerts for potential phishing attempts',
      icon: 'phishing',
      enabled: true,
      category: 'fraud'
    }
  ]);

  const toggleFeature = (featureId: string) => {
    setSecurityFeatures(prev => 
      prev.map(feature => 
        feature.id === featureId 
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );
  };

  const getSecurityScore = () => {
    const enabledFeatures = securityFeatures.filter(f => f.enabled).length;
    const totalFeatures = securityFeatures.length;
    return Math.round((enabledFeatures / totalFeatures) * 100);
  };

  const getSecurityLevel = () => {
    const score = getSecurityScore();
    if (score >= 80) return { level: 'Excellent', color: '#4CAF50' };
    if (score >= 60) return { level: 'Good', color: '#FF9800' };
    return { level: 'Needs Improvement', color: '#F44336' };
  };

  const securityLevel = getSecurityLevel();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Security Center</Text>
        <Text style={styles.subtitle}>Protect your account and transactions</Text>
      </View>

      {/* Security Score Card */}
      <GradientCard gradientColors={['#4CAF50', '#8BC34A']} padding={0}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>Security Score</Text>
            <Icon name="shield" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.scoreValue}>{getSecurityScore()}%</Text>
          <Text style={styles.scoreLevel}>{securityLevel.level}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getSecurityScore()}%`, backgroundColor: '#FFFFFF' }
              ]} 
            />
          </View>
        </View>
      </GradientCard>

      {/* Security Tips */}
      <Card style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Icon name="lightbulb" size={24} color={colors.primary} />
          <Text style={styles.tipsTitle}>Security Tips</Text>
        </View>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>Never share your OTP with anyone</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>Verify merchant details before payment</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>Use secure Wi-Fi for transactions</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>Regularly check your transaction history</Text>
          </View>
        </View>
      </Card>

      {/* Security Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Features</Text>
        
        {['fraud', 'privacy', 'transaction'].map(category => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {category === 'fraud' ? 'Fraud Protection' : 
               category === 'privacy' ? 'Privacy & Access' : 'Transaction Security'}
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

      {/* Emergency Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Actions</Text>
        
        <Card style={styles.emergencyCard}>
          <TouchableOpacity style={styles.emergencyButton}>
            <Icon name="block" size={24} color="#F44336" />
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyTitle}>Block All Transactions</Text>
              <Text style={styles.emergencyDescription}>Immediately block all payment activities</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <Card style={styles.emergencyCard}>
          <TouchableOpacity style={styles.emergencyButton}>
            <Icon name="phone" size={24} color="#F44336" />
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyTitle}>Report Fraud</Text>
              <Text style={styles.emergencyDescription}>Report suspicious activity immediately</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>
      </View>
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
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tipsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginLeft: spacing.sm,
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
  },
  emergencyCard: {
    marginBottom: spacing.sm,
    padding: 0,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  emergencyInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  emergencyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emergencyDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});

export default SecurityScreen;
