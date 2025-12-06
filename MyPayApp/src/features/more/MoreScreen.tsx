import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { logout } from '../auth/authSlice';
import { RootState, AppDispatch } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

type MoreScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MoreScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, biometricEnabled } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<MoreScreenNavigationProp>();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  const menuItems = [
    { title: 'Profile', subtitle: 'Manage your account information', screen: null },
    { title: 'Security', subtitle: 'Biometrics, PIN, and security settings', screen: null },
    { title: 'Notifications', subtitle: 'Alert and notification preferences', screen: null },
    { title: 'Privacy', subtitle: 'Data privacy and export options', screen: null },
    { title: 'Help & Support', subtitle: 'FAQs and contact support', screen: null },
    { title: 'About', subtitle: 'App version and legal information', screen: null },
  ];

  const phase2Features = [
    { title: 'Smart Assistant', subtitle: 'AI-powered payment assistant', screen: 'SmartAssistant' as keyof RootStackParamList, icon: 'smart-toy' },
    { title: 'Cloud Sync & Backup', subtitle: 'Sync data across devices', screen: 'CloudSync' as keyof RootStackParamList, icon: 'cloud-sync' },
    { title: 'Advanced Analytics', subtitle: 'Business intelligence dashboard', screen: 'AdvancedAnalytics' as keyof RootStackParamList, icon: 'analytics' },
    { title: 'Encryption & Tokenization', subtitle: 'Advanced security features', screen: 'EncryptionTokenization' as keyof RootStackParamList, icon: 'security' },
    { title: 'Fraud Detection', subtitle: 'AI-powered fraud prevention', screen: 'FraudDetection' as keyof RootStackParamList, icon: 'gpp-good' },
    { title: 'Security Monitoring', subtitle: 'Real-time security surveillance', screen: 'SecurityMonitoring' as keyof RootStackParamList, icon: 'security' },
  ];

  const phase3Features = [
    { title: 'Advanced Biometrics', subtitle: 'Next-gen authentication', screen: 'AdvancedBiometric' as keyof RootStackParamList, icon: 'fingerprint' },
    { title: 'Voice Recognition', subtitle: 'Control with voice commands', screen: 'VoiceRecognition' as keyof RootStackParamList, icon: 'mic' },
    { title: 'AR Payments', subtitle: 'Augmented reality payments', screen: 'ARPayment' as keyof RootStackParamList, icon: 'view-in-ar' },
  ];

  const phase4Features = [
    { title: 'API Integration', subtitle: 'Manage API connections', screen: 'APIIntegration' as keyof RootStackParamList, icon: 'api' },
    { title: 'Third-Party Services', subtitle: 'External service integrations', screen: 'ThirdPartyServices' as keyof RootStackParamList, icon: 'extension' },
  ];

  const additionalFeatures = [
    { title: 'Integration Hub', subtitle: 'Central integration management', screen: 'IntegrationHub' as keyof RootStackParamList, icon: 'hub' },
    { title: 'Performance Optimizer', subtitle: 'App performance tuning', screen: 'PerformanceOptimizer' as keyof RootStackParamList, icon: 'speed' },
    { title: 'Dispute Resolution', subtitle: 'Payment dispute management', screen: 'DisputeResolution' as keyof RootStackParamList, icon: 'gavel' },
    { title: 'Accessibility Settings', subtitle: 'Accessibility preferences', screen: 'AccessibilitySettings' as keyof RootStackParamList, icon: 'accessibility' },
    { title: 'Cultural & Location', subtitle: 'Regional settings', screen: 'CulturalLocation' as keyof RootStackParamList, icon: 'public' },
    { title: 'Smart Onboarding', subtitle: 'Intelligent user onboarding', screen: 'SmartOnboarding' as keyof RootStackParamList, icon: 'school' },
  ];

  const navigateToScreen = (screenName: keyof RootStackParamList | null) => {
    if (screenName) {
      navigation.navigate(screenName as any);
    } else {
      Alert.alert('Coming Soon', 'This feature will be available soon');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
        <Text style={styles.subtitle}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => navigateToScreen(item.screen)}>
            <Card style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.menuItemArrow}>›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Phase 2 Features</Text>
        {phase2Features.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => navigateToScreen(item.screen)}>
            <Card style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemText}>
                  <View style={styles.featureHeader}>
                    <Icon name={item.icon} size={24} color={colors.primary} />
                    <View style={styles.featureText}>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.menuItemArrow}>›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⭐ Phase 3 Features</Text>
        {phase3Features.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => navigateToScreen(item.screen)}>
            <Card style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemText}>
                  <View style={styles.featureHeader}>
                    <Icon name={item.icon} size={24} color={colors.primary} />
                    <View style={styles.featureText}>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.menuItemArrow}>›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Phase 4 Features</Text>
        {phase4Features.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => navigateToScreen(item.screen)}>
            <Card style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemText}>
                  <View style={styles.featureHeader}>
                    <Icon name={item.icon} size={24} color={colors.primary} />
                    <View style={styles.featureText}>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.menuItemArrow}>›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <Card style={styles.menuItem}>
          <Button
            title="Export Data (CSV)"
            onPress={() => Alert.alert('Coming Soon', 'Data export feature will be available soon')}
            variant="secondary"
            style={styles.actionButton}
          />
        </Card>
        
        <Card style={styles.menuItem}>
          <Button
            title="Clear Cache"
            onPress={() => Alert.alert('Coming Soon', 'Cache clearing feature will be available soon')}
            variant="secondary"
            style={styles.actionButton}
          />
        </Card>

        <Card style={styles.menuItem}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            style={styles.actionButton}
          />
        </Card>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <Text style={styles.copyrightText}>© 2025 MyPay App</Text>
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
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  menuItem: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    flex: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  menuItemSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  menuItemArrow: {
    fontSize: typography.fontSize.lg,
    color: colors.textTertiary,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusEnabled: {
    backgroundColor: '#4caf50',
  },
  statusDisabled: {
    backgroundColor: colors.textTertiary,
  },
  actionButton: {
    marginVertical: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  versionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  copyrightText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
});

export default MoreScreen;
