import * as Keychain from 'react-native-keychain';

// Polyfills for React Native environment
declare global {
  var btoa: (data: string) => string;
  var atob: (data: string) => string;
  var crypto: {
    getRandomValues: (arr: Uint8Array) => Uint8Array;
  };
}

export class EncryptionService {
  private static readonly ENCRYPTION_KEY_SERVICE = 'mypay-encryption-key';
  private encryptionKey: string | null = null;

  async getOrCreateEncryptionKey(): Promise<string> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    try {
      // Try to retrieve existing key
      const credentials = await Keychain.getInternetCredentials(
        EncryptionService.ENCRYPTION_KEY_SERVICE
      );

      if (credentials && credentials.password) {
        this.encryptionKey = credentials.password;
        return this.encryptionKey;
      }

      // Generate new key if none exists
      const newKey = this.generateRandomKey();
      await Keychain.setInternetCredentials(
        EncryptionService.ENCRYPTION_KEY_SERVICE,
        'encryption-key',
        newKey
      );

      this.encryptionKey = newKey;
      return newKey;
    } catch (error) {
      console.error('Failed to get/create encryption key:', error);
      throw new Error('Encryption service unavailable');
    }
  }

  private generateRandomKey(): string {
    // Generate a random 32-character hex string (256 bits)
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Fallback for environments without crypto
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getOrCreateEncryptionKey();
      
      // Simple XOR encryption for demo purposes
      // In production, use proper AES encryption
      const encrypted = this.simpleXOREncrypt(data, key);
      if (typeof btoa !== 'undefined') {
        return btoa(encrypted); // Base64 encode
      } else {
        // React Native doesn't have btoa, so we'll implement a simple base64 encode
        return this.simpleBase64Encode(encrypted);
      }
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.getOrCreateEncryptionKey();
      
      // Check if it's valid base64
      try {
        if (typeof atob !== 'undefined') {
          atob(encryptedData);
        } else {
          // Fallback validation for environments without atob
          // Note: Buffer is not available in React Native, so we'll skip validation
          // and let the decoding fail if the data is invalid
        }
      } catch {
        throw new Error('Invalid base64 format');
      }
      
      // Decode from Base64 and decrypt
      let encoded: string;
      if (typeof atob !== 'undefined') {
        encoded = atob(encryptedData);
      } else {
        // React Native doesn't have Buffer, so we'll implement a simple base64 decode
        encoded = this.simpleBase64Decode(encryptedData);
      }
      const decrypted = this.simpleXORDecrypt(encoded, key);
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  private simpleXOREncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }

  private simpleXORDecrypt(encryptedText: string, key: string): string {
    // XOR is symmetric, so we use the same function
    return this.simpleXOREncrypt(encryptedText, key);
  }

  private simpleBase64Encode(str: string): string {
    // Simple base64 implementation for React Native
    // In production, use a proper library like 'base-64'
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
    }
    
    return result;
  }

  private simpleBase64Decode(str: string): string {
    // Simple base64 decoder for React Native
    // In production, use a proper library like 'base-64'
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    str = str.replace(/[^A-Za-z0-9+/]/g, '');
    
    while (i < str.length) {
      const encoded1 = chars.indexOf(str.charAt(i++));
      const encoded2 = chars.indexOf(str.charAt(i++));
      const encoded3 = chars.indexOf(str.charAt(i++));
      const encoded4 = chars.indexOf(str.charAt(i++));
      
      const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
      
      result += String.fromCharCode((bitmap >> 16) & 255);
      if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
      if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
    }
    
    return result;
  }

  async encryptObject(obj: Record<string, any>): Promise<string> {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  async decryptObject<T>(encryptedData: string): Promise<T> {
    const decryptedString = await this.decrypt(encryptedData);
    return JSON.parse(decryptedString) as T;
  }

  async clearEncryptionKey(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials('mypay-encryption-key');
      this.encryptionKey = null;
      // Also clear the in-memory key to simulate wrong key scenario
      this.encryptionKey = null;
    } catch (error) {
      console.error('Failed to clear encryption key:', error);
    }
  }
}

export const encryptionService = new EncryptionService();
