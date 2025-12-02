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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, authenticateWithBiometrics, enableBiometrics } from './authSlice';
import { RootState, AppDispatch } from '../../store/store';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const AuthScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, biometricEnabled } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password');

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>MyPay</Text>
          <Text style={styles.subtitle}>Your personal payment companion</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          {!biometricEnabled && (
            <Button
              title="Enable Biometric Login"
              onPress={handleEnableBiometrics}
              variant="secondary"
              style={styles.biometricButton}
            />
          )}

          {biometricEnabled && (
            <Button
              title="Login with Biometrics"
              onPress={handleBiometricLogin}
              variant="secondary"
              style={styles.biometricButton}
            />
          )}
        </Card>

        <View style={styles.demoNote}>
          <Text style={styles.demoText}>Demo Credentials:</Text>
          <Text style={styles.demoText}>Email: user@example.com</Text>
          <Text style={styles.demoText}>Password: password</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  loginButton: {
    marginTop: 8,
  },
  biometricButton: {
    marginTop: 12,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  demoNote: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  demoText: {
    fontSize: 12,
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 2,
  },
});

export default AuthScreen;
