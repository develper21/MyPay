import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius } from '../../theme/theme';

// Mock NetInfo functionality since the package isn't installed
const mockNetInfo = {
  addEventListener: (callback: (state: any) => void) => {
    // Mock implementation
    const mockState = {
      isConnected: true,
      type: 'wifi',
      details: { strength: 0.8 }
    };
    setTimeout(() => callback(mockState), 100);
    return () => {}; // Return unsubscribe function
  },
  fetch: () => Promise.resolve({
    isConnected: true,
    type: 'wifi',
    details: { strength: 0.8 }
  })
};

interface NetworkMonitorProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

const NetworkMonitor: React.FC<NetworkMonitorProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [isWeakConnection, setIsWeakConnection] = useState(false);

  useEffect(() => {
    const unsubscribe = mockNetInfo.addEventListener((state: any) => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);
      setConnectionType(state.type || '');
      
      // Check for weak connection
      if (state.details && 'strength' in state.details) {
        const strength = (state.details as any).strength;
        setIsWeakConnection(strength < 0.5);
      }
      
      onConnectionChange?.(connected);
      
      // Show alert for connection issues
      if (!connected && isConnected !== null) {
        setShowModal(true);
      }
    });

    return () => unsubscribe();
  }, [onConnectionChange, isConnected]);

  const getConnectionIcon = () => {
    if (isConnected === null) return 'signal-wifi-off';
    if (!isConnected) return 'signal-wifi-off';
    if (isWeakConnection) return 'signal-wifi-1-bar';
    if (connectionType === 'wifi') return 'signal-wifi-4-bar';
    if (connectionType === 'cellular') return 'signal-cellular-4-bar';
    return 'signal-wifi-4-bar';
  };

  const getConnectionColor = () => {
    if (isConnected === null) return colors.textTertiary;
    if (!isConnected) return colors.danger;
    if (isWeakConnection) return '#FF9800';
    return '#4CAF50';
  };

  const getConnectionText = () => {
    if (isConnected === null) return 'Checking connection...';
    if (!isConnected) return 'No internet connection';
    if (isWeakConnection) return 'Weak connection';
    if (connectionType === 'wifi') return 'Connected to Wi-Fi';
    if (connectionType === 'cellular') return 'Connected to mobile data';
    return 'Connected';
  };

  const handleRetry = () => {
    // Trigger reconnection attempt
    mockNetInfo.fetch().then((state: any) => {
      setIsConnected(state.isConnected ?? false);
    });
  };

  if (isConnected === null) {
    return null; // Don't show anything while checking
  }

  return (
    <>
      {/* Network Status Indicator */}
      <View style={[
        styles.networkIndicator,
        { backgroundColor: getConnectionColor() + '20' }
      ]}>
        <View style={styles.networkContent}>
          <Icon 
            name={getConnectionIcon()} 
            size={16} 
            color={getConnectionColor()} 
          />
          <Text style={[
            styles.networkText,
            { color: getConnectionColor() }
          ]}>
            {getConnectionText()}
          </Text>
        </View>
        
        {!isConnected && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Icon name="refresh" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Connection Lost Modal */}
      <Modal
        visible={showModal && !isConnected}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="signal-wifi-off" size={48} color={colors.danger} />
              <Text style={styles.modalTitle}>Connection Lost</Text>
              <Text style={styles.modalSubtitle}>
                No internet connection detected. Please check your network settings.
              </Text>
            </View>

            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>Quick Tips:</Text>
              <View style={styles.tipItem}>
                <Icon name="check" size={16} color="#4CAF50" />
                <Text style={styles.tipText}>Check your Wi-Fi or mobile data</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check" size={16} color="#4CAF50" />
                <Text style={styles.tipText}>Move to an area with better coverage</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check" size={16} color="#4CAF50" />
                <Text style={styles.tipText}>Try disabling and re-enabling internet</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check" size={16} color="#4CAF50" />
                <Text style={styles.tipText}>Avoid using VPN during payments</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.retryModalButton}
                onPress={handleRetry}
              >
                <Icon name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  networkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  networkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  networkText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.sm,
  },
  retryButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '20',
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
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  tipsSection: {
    marginBottom: spacing.lg,
  },
  tipsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  retryModalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  retryText: {
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
  },
});

export default NetworkMonitor;
