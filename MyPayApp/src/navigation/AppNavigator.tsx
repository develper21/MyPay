import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { RootState } from '../store/store';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';
import AuthScreen from '../features/auth/AuthScreen';
import HomeScreen from '../features/home/HomeScreen';
import PayScreen from '../features/payments/PayScreen';
import CalendarHistory from '../history/CalendarHistory';
import MoreScreen from '../features/more/MoreScreen';
import DayDetailScreen from '../history/DayDetailScreen';
import TripGoalScreen from '../features/trip/TripGoalScreen';
import SmartAssistantScreen from '../features/assistant/SmartAssistantScreen';
import CloudSyncScreen from '../features/backup/CloudSyncScreen';
import AdvancedAnalyticsScreen from '../features/analytics/AdvancedAnalyticsScreen';
import EncryptionTokenizationScreen from '../features/security/EncryptionTokenizationScreen';
import FraudDetectionScreen from '../features/fraud/FraudDetectionScreen';
import SecurityMonitoringScreen from '../features/security/SecurityMonitoringScreen';
import EnhancedSecurityScreen from '../features/security/EnhancedSecurityScreen';
import SecurityScreen from '../features/security/SecurityScreen';
import AdvancedBiometricScreen from '../features/biometric/AdvancedBiometricScreen';
import VoiceRecognitionScreen from '../features/voice/VoiceRecognitionScreen';
import ARPaymentScreen from '../features/ar/ARPaymentScreen';
import APIIntegrationScreen from '../features/api/APIIntegrationScreen';
import ThirdPartyServicesScreen from '../features/thirdparty/ThirdPartyServicesScreen';
import IntegrationHubScreen from '../features/integration/IntegrationHubScreen';
import PerformanceOptimizerScreen from '../features/performance/PerformanceOptimizerScreen';
import DisputeResolutionScreen from '../features/support/DisputeResolutionScreen';
import AccessibilitySettingsScreen from '../features/ux/AccessibilitySettingsScreen';
import CulturalLocationScreen from '../features/ux/CulturalLocationScreen';
import SmartOnboardingScreen from '../features/onboarding/SmartOnboardingScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  DayDetail: { date: string };
  TripGoals: undefined;
  // Phase 2 Features
  SmartAssistant: undefined;
  CloudSync: undefined;
  AdvancedAnalytics: undefined;
  EncryptionTokenization: undefined;
  FraudDetection: undefined;
  SecurityMonitoring: undefined;
  EnhancedSecurity: undefined;
  Security: undefined;
  // Phase 3 Features
  AdvancedBiometric: undefined;
  VoiceRecognition: undefined;
  ARPayment: undefined;
  // Phase 4 Features
  APIIntegration: undefined;
  ThirdPartyServices: undefined;
  // Additional Features
  IntegrationHub: undefined;
  PerformanceOptimizer: undefined;
  DisputeResolution: undefined;
  AccessibilitySettings: undefined;
  CulturalLocation: undefined;
  SmartOnboarding: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Pay: undefined;
  History: undefined;
  More: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabBarIcon = ({ routeName, color, size, focused }: { routeName: string; color: string; size: number; focused: boolean }) => {
  let iconName: string;

  switch (routeName) {
    case 'Home':
      iconName = 'home';
      break;
    case 'Pay':
      iconName = 'payment';
      break;
    case 'History':
      iconName = 'history';
      break;
    case 'More':
      iconName = 'more-horiz';
      break;
    default:
      iconName = 'help';
  }

  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Icon name={iconName} size={size} color={color} />
    </View>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => (
          <TabBarIcon routeName={route.name} color={color} size={size} focused={focused} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Pay" 
        component={PayScreen}
        options={{
          tabBarLabel: 'Pay',
        }}
      />
      <Tab.Screen 
        name="History" 
        component={CalendarHistory}
        options={{
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreScreen}
        options={{
          tabBarLabel: 'More',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen 
            name="DayDetail" 
            component={DayDetailScreen}
            options={{ 
              headerShown: true,
              title: 'Transaction Details',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="TripGoals" 
            component={TripGoalScreen}
            options={{ 
              headerShown: true,
              title: 'Trip Goals',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          {/* Phase 2 Features */}
          <Stack.Screen 
            name="SmartAssistant" 
            component={SmartAssistantScreen}
            options={{ 
              headerShown: true,
              title: 'Smart Assistant',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="CloudSync" 
            component={CloudSyncScreen}
            options={{ 
              headerShown: true,
              title: 'Cloud Sync & Backup',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="AdvancedAnalytics" 
            component={AdvancedAnalyticsScreen}
            options={{ 
              headerShown: true,
              title: 'Advanced Analytics',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="EncryptionTokenization" 
            component={EncryptionTokenizationScreen}
            options={{ 
              headerShown: true,
              title: 'Encryption & Tokenization',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="FraudDetection" 
            component={FraudDetectionScreen}
            options={{ 
              headerShown: true,
              title: 'Fraud Detection',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="SecurityMonitoring" 
            component={SecurityMonitoringScreen}
            options={{ 
              headerShown: true,
              title: 'Security Monitoring',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="EnhancedSecurity" 
            component={EnhancedSecurityScreen}
            options={{ 
              headerShown: true,
              title: 'Enhanced Security',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="Security" 
            component={SecurityScreen}
            options={{ 
              headerShown: true,
              title: 'Security',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          {/* Phase 3 Features */}
          <Stack.Screen 
            name="AdvancedBiometric" 
            component={AdvancedBiometricScreen}
            options={{ 
              headerShown: true,
              title: 'Advanced Biometrics',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="VoiceRecognition" 
            component={VoiceRecognitionScreen}
            options={{ 
              headerShown: true,
              title: 'Voice Recognition',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="ARPayment" 
            component={ARPaymentScreen}
            options={{ 
              headerShown: true,
              title: 'AR Payments',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          {/* Phase 4 Features */}
          <Stack.Screen 
            name="APIIntegration" 
            component={APIIntegrationScreen}
            options={{ 
              headerShown: true,
              title: 'API Integration',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="ThirdPartyServices" 
            component={ThirdPartyServicesScreen}
            options={{ 
              headerShown: true,
              title: 'Third-Party Services',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          {/* Additional Features */}
          <Stack.Screen 
            name="IntegrationHub" 
            component={IntegrationHubScreen}
            options={{ 
              headerShown: true,
              title: 'Integration Hub',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="PerformanceOptimizer" 
            component={PerformanceOptimizerScreen}
            options={{ 
              headerShown: true,
              title: 'Performance Optimizer',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="DisputeResolution" 
            component={DisputeResolutionScreen}
            options={{ 
              headerShown: true,
              title: 'Dispute Resolution',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="AccessibilitySettings" 
            component={AccessibilitySettingsScreen}
            options={{ 
              headerShown: true,
              title: 'Accessibility Settings',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="CulturalLocation" 
            component={CulturalLocationScreen}
            options={{ 
              headerShown: true,
              title: 'Cultural & Location',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen 
            name="SmartOnboarding" 
            component={SmartOnboardingScreen}
            options={{ 
              headerShown: true,
              title: 'Smart Onboarding',
              headerStyle: { 
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 85,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    paddingVertical: spacing.xs,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  tabIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconFocused: {
    backgroundColor: colors.primary + '15',
  },
});
