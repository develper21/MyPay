import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientCard from '../../components/ui/GradientCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

interface ARFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
  category: 'payment' | 'navigation' | 'visualization';
}

interface ARSession {
  id: string;
  feature: string;
  timestamp: string;
  duration: number;
  success: boolean;
}

const ARPaymentScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [arFeatures, setArFeatures] = useState<ARFeature[]>([
    {
      id: '1',
      name: 'AR QR Scanner',
      description: 'Scan QR codes in augmented reality',
      enabled: true,
      icon: 'qr-code-scanner',
      category: 'payment',
    },
    {
      id: '2',
      name: '3D Payment Visualization',
      description: 'View transactions in 3D space',
      enabled: true,
      icon: 'view-in-ar',
      category: 'visualization',
    },
    {
      id: '3',
      name: 'AR Navigation',
      description: 'Find nearby payment locations',
      enabled: false,
      icon: 'explore',
      category: 'navigation',
    },
    {
      id: '4',
      name: 'Virtual Card',
      description: 'Display virtual cards in AR',
      enabled: true,
      icon: 'credit-card',
      category: 'payment',
    },
  ]);

  const [recentSessions, setRecentSessions] = useState<ARSession[]>([
    {
      id: '1',
      feature: 'AR QR Scanner',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      duration: 45,
      success: true,
    },
    {
      id: '2',
      feature: '3D Payment Visualization',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      duration: 120,
      success: true,
    },
  ]);

  const [showARModal, setShowARModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<ARFeature | null>(null);

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const toggleFeature = (featureId: string) => {
    setArFeatures(prev => 
      prev.map(feature => 
        feature.id === featureId 
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );
  };

  const startARFeature = (feature: ARFeature) => {
    setSelectedFeature(feature);
    setShowARModal(true);
    
    setTimeout(() => {
      const newSession: ARSession = {
        id: Date.now().toString(),
        feature: feature.name,
        timestamp: new Date().toISOString(),
        duration: Math.floor(Math.random() * 180) + 30,
        success: true,
      };
      
      setRecentSessions(prev => [newSession, ...prev.slice(0, 9)]);
      setShowARModal(false);
      Alert.alert('AR Session Complete', `${feature.name} session completed successfully`);
    }, 3000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'payment': return colors.primary;
      case 'navigation': return '#4CAF50';
      case 'visualization': return '#FF9800';
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <GradientCard gradientColors={[colors.primary, colors.primary + '80']} padding={0}>
          <View style={styles.headerCard}>
            <Icon name="view-in-ar" size={48} color="#FFFFFF" />
            <Text style={styles.headerTitle}>AR Payments</Text>
            <Text style={styles.headerSubtitle}>Augmented reality payment features</Text>
            
            <View style={styles.arOverview}>
              <View style={styles.arItem}>
                <Text style={styles.arValue}>{arFeatures.filter(f => f.enabled).length}</Text>
                <Text style={styles.arLabel}>Active Features</Text>
              </View>
              <View style={styles.arItem}>
                <Text style={styles.arValue}>{recentSessions.length}</Text>
                <Text style={styles.arLabel}>Sessions Today</Text>
              </View>
              <View style={styles.arItem}>
                <Text style={styles.arValue}>4.8★</Text>
                <Text style={styles.arLabel}>User Rating</Text>
              </View>
            </View>
          </View>
        </GradientCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AR Features</Text>
          
          {arFeatures.map(feature => (
            <Card key={feature.id} style={styles.featureCard}>
              <View style={styles.featureHeader}>
                <View style={styles.featureInfo}>
                  <Icon name={feature.icon} size={24} color={getCategoryColor(feature.category)} />
                  <View style={styles.featureDetails}>
                    <Text style={styles.featureName}>{feature.name}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => toggleFeature(feature.id)}>
                  <Icon 
                    name={feature.enabled ? 'check-circle' : 'radio-button-unchecked'}
                    size={24}
                    color={feature.enabled ? '#4CAF50' : colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.featureFooter}>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(feature.category) }]}>
                  <Text style={styles.categoryText}>{feature.category}</Text>
                </View>
                
                {feature.enabled && (
                  <TouchableOpacity 
                    style={styles.startButton}
                    onPress={() => startARFeature(feature)}
                  >
                    <Icon name="play-arrow" size={16} color={colors.primary} />
                    <Text style={styles.startButtonText}>Start AR</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent AR Sessions</Text>
          
          {recentSessions.map(session => (
            <Card key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionInfo}>
                  <Icon name="view-in-ar" size={20} color={session.success ? '#4CAF50' : colors.danger} />
                  <View style={styles.sessionDetails}>
                    <Text style={styles.sessionFeature}>{session.feature}</Text>
                    <Text style={styles.sessionTime}>{formatTime(session.timestamp)}</Text>
                  </View>
                </View>
                <View style={styles.sessionStats}>
                  <Text style={styles.durationText}>{formatDuration(session.duration)}</Text>
                  <Text style={[session.success ? styles.successText : styles.failText]}>
                    {session.success ? 'Success' : 'Failed'}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AR Settings</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="camera" size={24} color={colors.primary} />
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>Camera Permission</Text>
                  <Text style={styles.settingDescription}>Allow camera access for AR features</Text>
                </View>
              </View>
              <Icon name="check-circle" size={24} color="#4CAF50" />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="sensors" size={24} color={colors.primary} />
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>Motion Sensors</Text>
                  <Text style={styles.settingDescription}>Use device sensors for AR tracking</Text>
                </View>
              </View>
              <Icon name="check-circle" size={24} color="#4CAF50" />
            </View>
          </Card>
        </View>
      </ScrollView>

      <Modal
        visible={showARModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="view-in-ar" size={48} color={colors.primary} />
            <Text style={styles.modalTitle}>Starting AR Experience</Text>
            <Text style={styles.modalDescription}>
              Loading {selectedFeature?.name}...
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
  arOverview: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  arItem: {
    alignItems: 'center',
  },
  arValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  arLabel: {
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
  featureCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  featureName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  featureFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.semibold,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '10',
  },
  startButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginLeft: spacing.xs,
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
    flex: 1,
  },
  sessionDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  sessionFeature: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sessionTime: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  sessionStats: {
    alignItems: 'flex-end',
  },
  durationText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  successText: {
    fontSize: typography.fontSize.xs,
    color: '#4CAF50',
    fontWeight: typography.fontWeight.semibold,
  },
  failText: {
    fontSize: typography.fontSize.xs,
    color: colors.danger,
    fontWeight: typography.fontWeight.semibold,
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

export default ARPaymentScreen;
