import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientCard from '../../components/ui/GradientCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

interface SyncStatus {
  id: string;
  service: string;
  lastSync: string;
  status: 'synced' | 'syncing' | 'error' | 'pending';
  dataSize: string;
  icon: string;
}

interface BackupData {
  id: string;
  date: string;
  size: string;
  type: 'automatic' | 'manual';
  location: string;
  status: 'completed' | 'failed' | 'in_progress';
}

const CloudSyncScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [syncServices, setSyncServices] = useState<SyncStatus[]>([
    {
      id: 'transactions',
      service: 'Transaction History',
      lastSync: new Date(Date.now() - 300000).toISOString(),
      status: 'synced',
      dataSize: '2.4 MB',
      icon: 'history',
    },
    {
      id: 'contacts',
      service: 'Payment Contacts',
      lastSync: new Date(Date.now() - 600000).toISOString(),
      status: 'synced',
      dataSize: '156 KB',
      icon: 'contacts',
    },
    {
      id: 'preferences',
      service: 'User Preferences',
      lastSync: new Date(Date.now() - 1200000).toISOString(),
      status: 'synced',
      dataSize: '45 KB',
      icon: 'settings',
    },
    {
      id: 'security',
      service: 'Security Settings',
      lastSync: new Date(Date.now() - 1800000).toISOString(),
      status: 'syncing',
      dataSize: '12 KB',
      icon: 'security',
    },
  ]);

  const [backupHistory, setBackupHistory] = useState<BackupData[]>([
    {
      id: '1',
      date: new Date().toISOString(),
      size: '3.2 MB',
      type: 'automatic',
      location: 'Google Drive',
      status: 'completed',
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000).toISOString(),
      size: '3.1 MB',
      type: 'automatic',
      location: 'Google Drive',
      status: 'completed',
    },
    {
      id: '3',
      date: new Date(Date.now() - 172800000).toISOString(),
      size: '3.0 MB',
      type: 'manual',
      location: 'iCloud',
      status: 'completed',
    },
  ]);

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [wifiOnlyEnabled, setWifiOnlyEnabled] = useState(true);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    simulateSyncProgress();
  }, []);

  const simulateSyncProgress = () => {
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return '#4CAF50';
      case 'syncing': return colors.primary;
      case 'error': return colors.danger;
      case 'pending': return '#FF9800';
      default: return colors.textTertiary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return 'check-circle';
      case 'syncing': return 'sync';
      case 'error': return 'error';
      case 'pending': return 'schedule';
      default: return 'help';
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      Alert.alert('Success', 'All services synced successfully!');
    }, 2000);
  };

  const syncAllServices = () => {
    Alert.alert(
      'Sync All Services',
      'This will sync all your data to the cloud. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sync', 
          onPress: () => {
            setSyncServices(prev => 
              prev.map(service => ({ ...service, status: 'syncing' as const }))
            );
            
            setTimeout(() => {
              setSyncServices(prev => 
                prev.map(service => ({ 
                  ...service, 
                  status: 'synced' as const,
                  lastSync: new Date().toISOString()
                }))
              );
              Alert.alert('Success', 'All services synced successfully!');
            }, 3000);
          }
        }
      ]
    );
  };

  const createBackup = () => {
    setShowBackupModal(true);
    
    setTimeout(() => {
      const newBackup: BackupData = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        size: '3.3 MB',
        type: 'manual',
        location: 'Google Drive',
        status: 'completed',
      };
      
      setBackupHistory(prev => [newBackup, ...prev]);
      setShowBackupModal(false);
      Alert.alert('Success', 'Backup created successfully!');
    }, 2000);
  };

  const restoreBackup = (backupId: string) => {
    Alert.alert(
      'Restore Backup',
      'This will restore your data from the selected backup. Current data may be overwritten. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restore', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Backup restored successfully!');
          }
        }
      ]
    );
  };

  const deleteBackup = (backupId: string) => {
    Alert.alert(
      'Delete Backup',
      'Are you sure you want to delete this backup?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setBackupHistory(prev => prev.filter(backup => backup.id !== backupId));
            Alert.alert('Success', 'Backup deleted successfully!');
          }
        }
      ]
    );
  };

  const calculateTotalStorage = (): string => {
    const totalBytes = backupHistory.reduce((total, backup) => {
      const size = parseFloat(backup.size);
      return total + size;
    }, 0);
    
    if (totalBytes < 1024) return `${totalBytes.toFixed(1)} KB`;
    return `${(totalBytes / 1024).toFixed(1)} MB`;
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <GradientCard gradientColors={[colors.primary, colors.primary + '80']} padding={0}>
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>Cloud Sync & Backup</Text>
            <Text style={styles.headerSubtitle}>Secure data synchronization</Text>
            
            <View style={styles.syncOverview}>
              <View style={styles.syncItem}>
                <Icon name="cloud-done" size={24} color="#FFFFFF" />
                <Text style={styles.syncValue}>{syncServices.filter(s => s.status === 'synced').length}</Text>
                <Text style={styles.syncLabel}>Synced</Text>
              </View>
              <View style={styles.syncItem}>
                <Icon name="storage" size={24} color="#FFFFFF" />
                <Text style={styles.syncValue}>{calculateTotalStorage()}</Text>
                <Text style={styles.syncLabel}>Storage Used</Text>
              </View>
              <View style={styles.syncItem}>
                <Icon name="history" size={24} color="#FFFFFF" />
                <Text style={styles.syncValue}>{backupHistory.length}</Text>
                <Text style={styles.syncLabel}>Backups</Text>
              </View>
            </View>
          </View>
        </GradientCard>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={syncAllServices}>
              <Icon name="sync" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Sync All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={createBackup}>
              <Icon name="backup" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Create Backup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="restore" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Restore</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sync Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync Services</Text>
          
          {syncServices.map(service => (
            <Card key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <Icon name={service.icon} size={24} color={colors.primary} />
                  <View style={styles.serviceDetails}>
                    <Text style={styles.serviceName}>{service.service}</Text>
                    <Text style={styles.serviceSize}>Size: {service.dataSize}</Text>
                  </View>
                </View>
                <View style={styles.serviceStatus}>
                  <Icon 
                    name={getStatusIcon(service.status)} 
                    size={20} 
                    color={getStatusColor(service.status)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
                    {service.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.serviceFooter}>
                <Text style={styles.lastSync}>Last sync: {formatTime(service.lastSync)}</Text>
                {service.status === 'syncing' && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${syncProgress}%` }]} />
                  </View>
                )}
              </View>
            </Card>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync Settings</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="autorenew" size={24} color={colors.primary} />
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>Auto Sync</Text>
                  <Text style={styles.settingDescription}>Automatically sync data when changes occur</Text>
                </View>
              </View>
              <Switch
                value={autoSyncEnabled}
                onValueChange={setAutoSyncEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={autoSyncEnabled ? colors.primary : colors.textTertiary}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="wifi" size={24} color={colors.primary} />
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>WiFi Only</Text>
                  <Text style={styles.settingDescription}>Sync only when connected to WiFi</Text>
                </View>
              </View>
              <Switch
                value={wifiOnlyEnabled}
                onValueChange={setWifiOnlyEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={wifiOnlyEnabled ? colors.primary : colors.textTertiary}
              />
            </View>
          </Card>
        </View>

        {/* Backup History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup History</Text>
          
          {backupHistory.map(backup => (
            <Card key={backup.id} style={styles.backupCard}>
              <View style={styles.backupHeader}>
                <View style={styles.backupInfo}>
                  <Icon name="backup" size={24} color={colors.primary} />
                  <View style={styles.backupDetails}>
                    <Text style={styles.backupDate}>{formatDate(backup.date)}</Text>
                    <Text style={styles.backupMeta}>
                      {backup.size} • {backup.type} • {backup.location}
                    </Text>
                  </View>
                </View>
                <View style={styles.backupActions}>
                  <TouchableOpacity onPress={() => restoreBackup(backup.id)}>
                    <Icon name="restore" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteBackup(backup.id)}>
                    <Icon name="delete" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Storage Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage Information</Text>
          <Card style={styles.storageCard}>
            <View style={styles.storageHeader}>
              <Text style={styles.storageTitle}>Cloud Storage Usage</Text>
              <Text style={styles.storageUsage}>{calculateTotalStorage()} / 15 GB</Text>
            </View>
            <View style={styles.storageBar}>
              <View style={[styles.storageFill, { width: '22%' }]} />
            </View>
            <View style={styles.storageBreakdown}>
              <View style={styles.storageItem}>
                <View style={[styles.storageDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.storageItemText}>Backups: {calculateTotalStorage()}</Text>
              </View>
              <View style={styles.storageItem}>
                <View style={[styles.storageDot, { backgroundColor: '#8BC34A' }]} />
                <Text style={styles.storageItemText}>Available: {15 - parseFloat(calculateTotalStorage())} GB</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Backup Modal */}
      <Modal
        visible={showBackupModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="backup" size={48} color={colors.primary} />
            <Text style={styles.modalTitle}>Creating Backup...</Text>
            <Text style={styles.modalDescription}>
              Please wait while we create your backup
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
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.lg,
  },
  syncOverview: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  syncItem: {
    alignItems: 'center',
  },
  syncValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  syncLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  serviceCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDetails: {
    marginLeft: spacing.md,
  },
  serviceName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  serviceSize: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  serviceStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
  },
  serviceFooter: {
    alignItems: 'flex-start',
  },
  lastSync: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
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
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  backupCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backupDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  backupDate: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  backupMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  backupActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  storageCard: {
    padding: spacing.lg,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  storageTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  storageUsage: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  storageBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  storageFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  storageBreakdown: {
    gap: spacing.sm,
  },
  storageItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  storageItemText: {
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

export default CloudSyncScreen;
