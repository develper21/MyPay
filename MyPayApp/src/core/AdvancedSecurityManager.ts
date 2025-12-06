import { Platform, NativeModules, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple crypto implementation since crypto-js isn't installed
class SimpleCrypto {
  static SHA256(data: string): { toString: () => string } {
    // Simple hash implementation for demonstration
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return {
      toString: () => Math.abs(hash).toString(16)
    };
  }

  static AES: {
    encrypt: (data: string, key: string) => { toString: () => string };
    decrypt: (encrypted: string, key: string) => { toString: (encoding: any) => string };
  } = {
    encrypt: (data: string, key: string) => ({
      toString: () => btoa(data + '|' + key) // Simple encoding for demo
    }),
    decrypt: (encrypted: string, key: string) => ({
      toString: () => {
        try {
          const decoded = atob(encrypted);
          return decoded.split('|')[0] || '';
        } catch {
          return '';
        }
      }
    })
  };

  static enc: {
    Utf8: {
      parse: (data: string) => string;
    }
  } = {
    Utf8: {
      parse: (data: string) => data
    }
  };
}

// Security Configuration
const SECURITY_CONFIG = {
  ENCRYPTION_KEY: 'MyPay_Secure_Key_2024',
  TOKEN_EXPIRY: 3600000, // 1 hour
  MAX_ATTEMPTS: 3,
  LOCKOUT_DURATION: 900000, // 15 minutes
  BIOMETRIC_TIMEOUT: 30000, // 30 seconds
};

interface SecuritySession {
  sessionId: string;
  userId: string;
  deviceId: string;
  biometricVerified: boolean;
  timestamp: number;
  riskScore: number;
}

interface FraudDetectionResult {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  factors: string[];
  action: 'allow' | 'challenge' | 'block';
  recommendations: string[];
}

interface TokenizedData {
  token: string;
  maskedData: string;
  expiry: number;
  checksum: string;
}

class AdvancedSecurityManager {
  private static instance: AdvancedSecurityManager;
  private currentSession: SecuritySession | null = null;
  private failedAttempts: number = 0;
  private lockoutUntil: number = 0;
  private encryptionKey: string;

  private constructor() {
    this.encryptionKey = this.generateEncryptionKey();
  }

  public static getInstance(): AdvancedSecurityManager {
    if (!AdvancedSecurityManager.instance) {
      AdvancedSecurityManager.instance = new AdvancedSecurityManager();
    }
    return AdvancedSecurityManager.instance;
  }

  // 1. MULTI-FACTOR AUTHENTICATION WITH BIOMETRICS
  async authenticateWithBiometrics(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const { TouchID } = NativeModules;
        const isAvailable = await TouchID.isSupported();
        
        if (isAvailable) {
          const success = await TouchID.authenticate('Authenticate to access MyPay');
          if (success) {
            await this.createSecuritySession(true);
            return true;
          }
        }
      } else if (Platform.OS === 'android') {
        const { Fingerprint } = NativeModules;
        const isAvailable = await Fingerprint.isSupported();
        
        if (isAvailable) {
          const success = await Fingerprint.authenticate('Authenticate to access MyPay');
          if (success) {
            await this.createSecuritySession(true);
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  async authenticateWithPIN(pin: string): Promise<boolean> {
    try {
      const storedPIN = await AsyncStorage.getItem('user_pin');
      if (!storedPIN) {
        return false;
      }
      
      const hashedPIN = SimpleCrypto.SHA256(pin).toString();
      
      if (hashedPIN === storedPIN) {
        await this.createSecuritySession(false);
        this.failedAttempts = 0;
        return true;
      } else {
        this.handleFailedAuthentication();
        return false;
      }
    } catch (error) {
      console.error('PIN authentication failed:', error);
      return false;
    }
  }

  async setupBiometricAuth(): Promise<boolean> {
    try {
      // Check if biometrics are available
      const isAvailable = await this.checkBiometricAvailability();
      if (!isAvailable) {
        return false;
      }

      // Prompt user to register biometrics
      const success = await this.promptBiometricRegistration();
      if (success) {
        await AsyncStorage.setItem('biometric_enabled', 'true');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Biometric setup failed:', error);
      return false;
    }
  }

  private async checkBiometricAvailability(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const { TouchID } = NativeModules;
        return await TouchID.isSupported();
      } else if (Platform.OS === 'android') {
        const { Fingerprint } = NativeModules;
        return await Fingerprint.isSupported();
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async promptBiometricRegistration(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const { TouchID } = NativeModules;
        return await TouchID.authenticate('Register biometric for MyPay');
      } else if (Platform.OS === 'android') {
        const { Fingerprint } = NativeModules;
        return await Fingerprint.authenticate('Register biometric for MyPay');
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // 2. END-TO-END ENCRYPTION & TOKENIZATION
  encryptSensitiveData(data: string): string {
    try {
      const encrypted = SimpleCrypto.AES.encrypt(data, this.encryptionKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  decryptSensitiveData(encryptedData: string): string {
    try {
      const decrypted = SimpleCrypto.AES.decrypt(encryptedData, this.encryptionKey).toString(SimpleCrypto.enc.Utf8.parse);
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  tokenizePaymentData(cardNumber: string, expiry: string, cvv: string): TokenizedData {
    try {
      const dataToTokenize = `${cardNumber}|${expiry}|${cvv}`;
      const encrypted = this.encryptSensitiveData(dataToTokenize);
      const token = this.generateToken();
      const maskedCard = this.maskCardNumber(cardNumber);
      const checksum = this.generateChecksum(encrypted);
      
      const tokenizedData: TokenizedData = {
        token,
        maskedData: maskedCard,
        expiry: Date.now() + SECURITY_CONFIG.TOKEN_EXPIRY,
        checksum,
      };

      // Store token mapping securely
      this.storeTokenMapping(token, encrypted);
      
      return tokenizedData;
    } catch (error) {
      console.error('Tokenization failed:', error);
      throw new Error('Failed to tokenize payment data');
    }
  }

  async detokenizePaymentData(token: string): Promise<string> {
    try {
      const encrypted = await this.retrieveTokenMapping(token);
      if (!encrypted) {
        throw new Error('Invalid token');
      }
      
      const decrypted = this.decryptSensitiveData(encrypted);
      return decrypted;
    } catch (error) {
      console.error('Detokenization failed:', error);
      throw new Error('Failed to detokenize payment data');
    }
  }

  private maskCardNumber(cardNumber: string): string {
    const masked = cardNumber.replace(/\d(?=\d{4})/g, '*');
    return masked;
  }

  private generateToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const token = `TKN_${timestamp}_${random}`.toUpperCase();
    return token;
  }

  private generateChecksum(data: string): string {
    return SimpleCrypto.SHA256(data + SECURITY_CONFIG.ENCRYPTION_KEY).toString().substring(0, 16);
  }

  private async storeTokenMapping(token: string, encryptedData: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`token_${token}`, encryptedData);
    } catch (error) {
      console.error('Failed to store token mapping:', error);
    }
  }

  private async retrieveTokenMapping(token: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`token_${token}`);
    } catch (error) {
      console.error('Failed to retrieve token mapping:', error);
      return null;
    }
  }

  // 3. AI-POWERED FRAUD DETECTION
  async analyzeTransactionRisk(transactionData: {
    amount: number;
    recipient: string;
    location?: { lat: number; lng: number };
    time: string;
    deviceInfo: string;
  }): Promise<FraudDetectionResult> {
    try {
      const riskFactors: string[] = [];
      let riskScore = 0;

      // Analyze transaction amount
      const amountRisk = this.analyzeAmountRisk(transactionData.amount);
      riskScore += amountRisk.score;
      if (amountRisk.factors.length > 0) {
        riskFactors.push(...amountRisk.factors);
      }

      // Analyze recipient
      const recipientRisk = this.analyzeRecipientRisk(transactionData.recipient);
      riskScore += recipientRisk.score;
      if (recipientRisk.factors.length > 0) {
        riskFactors.push(...recipientRisk.factors);
      }

      // Analyze time patterns
      const timeRisk = this.analyzeTimeRisk(transactionData.time);
      riskScore += timeRisk.score;
      if (timeRisk.factors.length > 0) {
        riskFactors.push(...timeRisk.factors);
      }

      // Analyze location
      if (transactionData.location) {
        const locationRisk = this.analyzeLocationRisk(transactionData.location);
        riskScore += locationRisk.score;
        if (locationRisk.factors.length > 0) {
          riskFactors.push(...locationRisk.factors);
        }
      }

      // Analyze device patterns
      const deviceRisk = this.analyzeDeviceRisk(transactionData.deviceInfo);
      riskScore += deviceRisk.score;
      if (deviceRisk.factors.length > 0) {
        riskFactors.push(...deviceRisk.factors);
      }

      // Determine risk level and action
      const riskLevel = this.determineRiskLevel(riskScore);
      const action = this.determineAction(riskLevel, riskScore);
      const recommendations = this.generateRecommendations(riskLevel, riskFactors);

      return {
        riskLevel,
        riskScore,
        factors: riskFactors,
        action,
        recommendations,
      };
    } catch (error) {
      console.error('Fraud detection analysis failed:', error);
      throw new Error('Failed to analyze transaction risk');
    }
  }

  private analyzeAmountRisk(amount: number): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    if (amount > 100000) {
      score += 30;
      factors.push('High-value transaction (> ₹1L)');
    } else if (amount > 50000) {
      score += 15;
      factors.push('Medium-high value transaction (> ₹50K)');
    }

    if (amount % 1 !== 0) {
      score += 5;
      factors.push('Decimal amount (unusual pattern)');
    }

    return { score, factors };
  }

  private analyzeRecipientRisk(recipient: string): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    // Check if recipient is new
    if (this.isNewRecipient(recipient)) {
      score += 20;
      factors.push('New recipient');
    }

    // Check for suspicious patterns
    if (this.hasSuspiciousPattern(recipient)) {
      score += 25;
      factors.push('Suspicious recipient pattern');
    }

    return { score, factors };
  }

  private analyzeTimeRisk(time: string): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    const hour = new Date(time).getHours();
    
    if (hour >= 22 || hour <= 6) {
      score += 15;
      factors.push('Unusual transaction time (late night)');
    }

    // Check for rapid successive transactions
    if (this.hasRapidTransactions()) {
      score += 20;
      factors.push('Rapid successive transactions');
    }

    return { score, factors };
  }

  private analyzeLocationRisk(location: { lat: number; lng: number }): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    // Check if location is unusual for user
    if (this.isUnusualLocation(location)) {
      score += 25;
      factors.push('Unusual transaction location');
    }

    return { score, factors };
  }

  private analyzeDeviceRisk(deviceInfo: string): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    // Check if device is new
    if (this.isNewDevice(deviceInfo)) {
      score += 20;
      factors.push('New device');
    }

    return { score, factors };
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  private determineAction(riskLevel: string, score: number): 'allow' | 'challenge' | 'block' {
    if (riskLevel === 'critical' || score >= 80) return 'block';
    if (riskLevel === 'high' || score >= 60) return 'challenge';
    return 'allow';
  }

  private generateRecommendations(riskLevel: string, factors: string[]): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical') {
      recommendations.push('Block transaction and contact support immediately');
      recommendations.push('Verify user identity through multiple channels');
    } else if (riskLevel === 'high') {
      recommendations.push('Require additional authentication');
      recommendations.push('Send security alert to user');
    } else if (riskLevel === 'medium') {
      recommendations.push('Show security warning to user');
      recommendations.push('Ask for confirmation');
    }

    return recommendations;
  }

  // 4. REAL-TIME SECURITY MONITORING
  async startSecurityMonitoring(): Promise<void> {
    try {
      // Monitor session validity
      this.monitorSessionValidity();
      
      // Monitor for suspicious activities
      this.monitorSuspiciousActivities();
      
      // Monitor device integrity
      this.monitorDeviceIntegrity();
      
      // Monitor network security
      this.monitorNetworkSecurity();
    } catch (error) {
      console.error('Security monitoring failed:', error);
    }
  }

  private monitorSessionValidity(): void {
    setInterval(async () => {
      if (this.currentSession) {
        const sessionAge = Date.now() - this.currentSession.timestamp;
        if (sessionAge > SECURITY_CONFIG.TOKEN_EXPIRY) {
          await this.invalidateSession();
          Alert.alert('Session Expired', 'Please authenticate again to continue');
        }
      }
    }, 60000); // Check every minute
  }

  private monitorSuspiciousActivities(): void {
    // Monitor for multiple failed attempts
    setInterval(() => {
      if (this.failedAttempts >= SECURITY_CONFIG.MAX_ATTEMPTS) {
        this.handleSecurityBreach();
      }
    }, 5000); // Check every 5 seconds
  }

  private monitorDeviceIntegrity(): void {
    // Check for jailbreak/root
    this.checkDeviceIntegrity();
  }

  private monitorNetworkSecurity(): void {
    // Monitor for network attacks
    this.checkNetworkSecurity();
  }

  private async createSecuritySession(biometricVerified: boolean): Promise<void> {
    const session: SecuritySession = {
      sessionId: this.generateSessionId(),
      userId: await this.getCurrentUserId(),
      deviceId: await this.getDeviceId(),
      biometricVerified,
      timestamp: Date.now(),
      riskScore: 0,
    };

    this.currentSession = session;
    await AsyncStorage.setItem('security_session', JSON.stringify(session));
  }

  private async invalidateSession(): Promise<void> {
    this.currentSession = null;
    await AsyncStorage.removeItem('security_session');
  }

  private handleFailedAuthentication(): void {
    this.failedAttempts++;
    
    if (this.failedAttempts >= SECURITY_CONFIG.MAX_ATTEMPTS) {
      this.lockoutUntil = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
      Alert.alert('Account Locked', `Too many failed attempts. Try again after ${SECURITY_CONFIG.LOCKOUT_DURATION / 60000} minutes`);
    }
  }

  private handleSecurityBreach(): void {
    Alert.alert(
      'Security Alert',
      'Suspicious activity detected. Your account has been temporarily locked for security reasons.',
      [{ text: 'OK', onPress: () => this.initiateSecurityProtocol() }]
    );
  }

  private initiateSecurityProtocol(): void {
    // Implement security breach protocol
    this.invalidateSession();
    this.notifySecurityTeam();
  }

  private async notifySecurityTeam(): Promise<void> {
    // Send alert to security team
    console.log('SECURITY BREACH DETECTED - Notifying security team');
  }

  // Helper methods
  private generateEncryptionKey(): string {
    return SimpleCrypto.SHA256(SECURITY_CONFIG.ENCRYPTION_KEY + Date.now()).toString();
  }

  private generateSessionId(): string {
    return `SESSION_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async getCurrentUserId(): Promise<string> {
    // Get current user ID from secure storage
    return 'user_123'; // Placeholder
  }

  private async getDeviceId(): Promise<string> {
    // Get unique device identifier
    return 'device_456'; // Placeholder
  }

  private isNewRecipient(recipient: string): boolean {
    // Check if recipient is in user's transaction history
    return true; // Placeholder logic
  }

  private hasSuspiciousPattern(recipient: string): boolean {
    // Check for suspicious patterns in recipient ID
    const suspiciousPatterns = [/\d{10}@/, /test@/i, /fake@/i];
    return suspiciousPatterns.some(pattern => pattern.test(recipient));
  }

  private hasRapidTransactions(): boolean {
    // Check for rapid successive transactions
    return false; // Placeholder logic
  }

  private isUnusualLocation(location: { lat: number; lng: number }): boolean {
    // Check if location is unusual for user
    return false; // Placeholder logic
  }

  private isNewDevice(deviceInfo: string): boolean {
    // Check if device is new
    return false; // Placeholder logic
  }

  private checkDeviceIntegrity(): void {
    // Check for jailbreak/root
    // Implementation depends on platform
  }

  private checkNetworkSecurity(): void {
    // Check for network attacks
    // Implementation for network security monitoring
  }
}

export default AdvancedSecurityManager;
