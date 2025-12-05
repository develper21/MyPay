import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface QRScannerProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({
  visible,
  onClose,
  onScanSuccess,
}) => {
  const handleMockScan = () => {
    // Mock QR code data for demo purposes
    const mockQRData = JSON.stringify({
      type: 'payment',
      merchant: 'Demo Store',
      amount: 100,
      account: 'demo123456',
      upiId: 'demo@upi'
    });
    
    onScanSuccess(mockQRData);
    onClose();
  };

  const handleOpenQRScanner = () => {
    // Try to open external QR scanner app
    Alert.alert(
      'QR Scanner',
      'Choose an option to scan QR code:',
      [
        {
          text: 'Use Mock Scanner',
          onPress: handleMockScan,
        },
        {
          text: 'Open Camera App',
          onPress: () => {
            Linking.openURL('camera://').catch(() => {
              Alert.alert('Error', 'Could not open camera app');
            });
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan & Pay</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.scannerArea}>
          <View style={styles.reticle}>
            <Icon name="qr-code-scanner" size={120} color="#1976d2" />
            <Text style={styles.scanText}>Tap to scan QR code</Text>
          </View>
        </View>
        
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            1. Position QR code within frame{'\n'}
            2. Ensure good lighting{'\n'}
            3. Hold steady until scanned
          </Text>
        </View>
        
        <TouchableOpacity style={styles.scanButton} onPress={handleOpenQRScanner}>
          <Icon name="camera-alt" size={24} color="#ffffff" />
          <Text style={styles.scanButtonText}>Start Scanning</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.manualButton} onPress={() => {
          Alert.alert('Manual Entry', 'Manual payment entry feature coming soon!');
        }}>
          <Text style={styles.manualButtonText}>Enter UPI ID Manually</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scannerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
  },
  reticle: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#1976d2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
  },
  scanText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  instructions: {
    marginHorizontal: 40,
    marginBottom: 30,
  },
  instructionText: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976d2',
    marginHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  manualButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  manualButtonText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default QRScanner;