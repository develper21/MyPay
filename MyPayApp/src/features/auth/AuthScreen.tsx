import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { login, authenticateWithBiometrics, enableBiometrics } from './authSlice';
import { RootState, AppDispatch } from '../../store/store';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import GradientCard from '../../components/ui/GradientCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AuthScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, biometricEnabled } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const result = await dispatch(login({ email, password }));
      if (login.fulfilled.match(result)) {
        // Login successful
      }
    } catch {
      Alert.alert('Login Failed', 'Invalid credentials. Try user@example.com / password');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await dispatch(authenticateWithBiometrics());
      if (authenticateWithBiometrics.fulfilled.match(result)) {
        // Biometric login successful
      }
    } catch {
      Alert.alert('Biometric Login Failed', 'Please try again or use password login');
    }
  };

  const handleEnableBiometrics = async () => {
    try {
      const result = await dispatch(enableBiometrics());
      if (enableBiometrics.fulfilled.match(result)) {
        // Biometric enabled successfully
        Alert.alert('Success', 'Biometrics enabled for future logins');
      }
    } catch {
      Alert.alert('Failed', 'Could not enable biometrics');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo and Brand Section */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Icon name="account-balance-wallet" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.brandName}>MyPay</Text>
            </View>
            <Text style={styles.tagline}>Your personal payment companion</Text>
          </View>

          {/* Login Form Card */}
          <View style={styles.formContainer}>
            <Card style={styles.loginCard}>
              <Text style={styles.loginTitle}>Welcome Back</Text>
              <Text style={styles.loginSubtitle}>Sign in to continue to your account</Text>
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Icon name="email" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon 
                    name={showPassword ? "visibility-off" : "visibility"} 
                    size={20} 
                    color={colors.textTertiary} 
                  />
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Icon name="error-outline" size={20} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Login Button */}
              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.loginButton}
              />

              {/* Biometric Options */}
              {!biometricEnabled ? (
                <TouchableOpacity 
                  style={styles.biometricOption}
                  onPress={handleEnableBiometrics}
                >
                  <View style={styles.biometricIcon}>
                    <Icon name="fingerprint" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.biometricContent}>
                    <Text style={styles.biometricTitle}>Enable Biometric Login</Text>
                    <Text style={styles.biometricSubtitle}>Use fingerprint or face recognition</Text>
                  </View>
                  <Icon name="arrow-forward-ios" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.biometricOption}
                  onPress={handleBiometricLogin}
                >
                  <View style={styles.biometricIcon}>
                    <Icon name="fingerprint" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.biometricContent}>
                    <Text style={styles.biometricTitle}>Login with Biometrics</Text>
                    <Text style={styles.biometricSubtitle}>Quick and secure access</Text>
                  </View>
                  <Icon name="arrow-forward-ios" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </Card>

            {/* Demo Credentials */}
            <Card style={styles.demoCard}>
              <View style={styles.demoHeader}>
                <Icon name="info" size={20} color={colors.primary} />
                <Text style={styles.demoTitle}>Demo Credentials</Text>
              </View>
              <View style={styles.demoContent}>
                <View style={styles.demoItem}>
                  <Text style={styles.demoLabel}>Email:</Text>
                  <Text style={styles.demoValue}>user@example.com</Text>
                </View>
                <View style={styles.demoItem}>
                  <Text style={styles.demoLabel}>Password:</Text>
                  <Text style={styles.demoValue}>password</Text>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: screenHeight * 0.1,
    paddingBottom: spacing.xl,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandName: {
    fontSize: typography.fontSize.massive,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
  },
  loginCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  loginTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  eyeIcon: {
    marginLeft: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.danger,
    marginLeft: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  biometricOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  biometricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  biometricContent: {
    flex: 1,
  },
  biometricTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  biometricSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  demoCard: {
    padding: spacing.lg,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  demoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  demoContent: {
    gap: spacing.sm,
  },
  demoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  demoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default AuthScreen;
