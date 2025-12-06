import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

interface SecurityEvent {
  id: string;
  type: 'login' | 'transaction' | 'device' | 'network' | 'session';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  location: string;
  device: string;
  status: 'active' | 'resolved' | 'investigating';
}

interface SessionInfo {
  id: string;
  device: string;
  location: string;
  startTime: string;
  isActive: boolean;
  lastActivity: string;
  riskScore: number;
}

interface DeviceStatus {
  id: string;
  name: string;
  type: string;
  status: 'trusted' | 'unknown' | 'blocked';
  lastSeen: string;
  riskLevel: number;
}

const SecurityMonitoringScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'login',
      severity: 'medium',
      title: 'New Device Login',
      description: 'Login from unrecognized device in Mumbai',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      location: 'Mumbai, India',
      device: 'Chrome on Windows',
      status: 'investigating',
    },
    {
      id: '2',
      type: 'transaction',
      severity: 'high',
      title: 'Suspicious Transaction',
      description: 'High-value transaction to unknown recipient',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      location: 'Delhi, India',
      device: 'Mobile App',
      status: 'active',
    },
    {
      id: '3',
      type: 'network',
      severity: 'low',
      title: 'Network Change',
      description: 'Connected to new WiFi network',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      location: 'Bangalore, India',
      device: 'Mobile App',
      status: 'resolved',
    },
  ]);

  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([
    {
      id: '1',
      device: 'iPhone 13 Pro',
      location: 'Mumbai, India',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      isActive: true,
      lastActivity: new Date(Date.now() - 60000).toISOString(),
      riskScore: 15,
    },
    {
      id: '2',
      device: 'MacBook Pro',
      location: 'Mumbai, India',
      startTime: new Date(Date.now() - 7200000).toISOString(),
      isActive: true,
      lastActivity: new Date(Date.now() - 300000).toISOString(),
      riskScore: 10,
    },
  ]);

  const [devices, setDevices] = useState<DeviceStatus[]>([
    {
      id: '1',
      name: 'iPhone 13 Pro',
      type: 'Mobile',
      status: 'trusted',
      lastSeen: new Date(Date.now() - 60000).toISOString(),
      riskLevel: 15,
    },
    {
      id: '2',
      name: 'MacBook Pro',
      type: 'Laptop',
      status: 'trusted',
      lastSeen: new Date(Date.now() - 300000).toISOString(),
      riskLevel: 10,
    },
    {
      id: '3',
      name: 'Unknown Device',
      type: 'Desktop',
      status: 'unknown',
      lastSeen: new Date(Date.now() - 86400000).toISOString(),
      riskLevel: 75,
    },
  ]);

  const [showEventDetails, setShowEventDetails] = useState<SecurityEvent | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState<SessionInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(true);

  useEffect(() => {
    if (realTimeMonitoring) {
      const interval = setInterval(() => {
        checkSecurityStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [realTimeMonitoring]);

  const checkSecurityStatus = () => {
    const random = Math.random();
    if (random > 0.95) {
      const newEvent: SecurityEvent = {
        id: Date.now().toString(),
        type: ['login', 'transaction', 'device', 'network'][Math.floor(Math.random() * 4)] as any,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        title: 'Real-time Security Alert',
        description: 'Suspicious activity detected',
        timestamp: new Date().toISOString(),
        location: 'Unknown',
        device: 'Unknown',
        status: 'active',
      };
      setSecurityEvents(prev => [newEvent, ...prev.slice(0, 9)]);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#FF5722';
      case 'critical': return colors.danger;
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.danger;
      case 'investigating': return '#FF9800';
      case 'resolved': return '#4CAF50';
      default: return colors.textSecondary;
    }
  };

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'trusted': return '#4CAF50';
      case 'unknown': return '#FF9800';
      case 'blocked': return colors.danger;
      default: return colors.textSecondary;
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

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      Alert.alert('Success', 'Security data refreshed');
    }, 2000);
  };

  const terminateSession = (sessionId: string) => {
    Alert.alert(
      'Terminate Session',
      'This will log out the device immediately. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Terminate', 
          style: 'destructive',
          onPress: () => {
            setActiveSessions(prev => 
              prev.map(session => 
                session.id === sessionId 
                  ? { ...session, isActive: false }
                  : session
              )
            );
            Alert.alert('Success', 'Session terminated');
          }
        }
      ]
    );
  };

  const blockDevice = (deviceId: string) => {
    Alert.alert(
      'Block Device',
      'This device will be blocked from accessing your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Block', 
          style: 'destructive',
          onPress: () => {
            setDevices(prev => 
              prev.map(device => 
                device.id === deviceId 
                  ? { ...device, status: 'blocked' as const }
                  : device
              )
            );
            Alert.alert('Success', 'Device blocked');
          }
        }
      ]
    );
  };

  const trustDevice = (deviceId: string) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, status: 'trusted' as const, riskLevel: 10 }
          : device
      )
    );
    Alert.alert('Success', 'Device marked as trusted');
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
        <GradientCard gradientColors={[colors.primary, colors.primary + '80']} padding={0}>
          <View style={styles.headerCard}>
            <Icon name="security" size={48} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Security Monitoring</Text>
            <Text style={styles.headerSubtitle}>Real-time protection 24/7</Text>
            
            <View style={styles.statusOverview}>
              <View style={styles.statusItem}>
                <Text style={styles.statusValue}>{securityEvents.filter(e => e.status === 'active').length}</Text>
                <Text style={styles.statusLabel}>Active Threats</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusValue}>{activeSessions.filter(s => s.isActive).length}</Text>
                <Text style={styles.statusLabel}>Active Sessions</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusValue}>{devices.filter(d => d.status === 'trusted').length}</Text>
                <Text style={styles.statusLabel}>Trusted Devices</Text>
              </View>
            </View>
          </View>
        </GradientCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Events</Text>
          
          {securityEvents.map(event => (
            <Card key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventInfo}>
                  <Icon name="warning" size={24} color={getSeverityColor(event.severity)} />
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  </View>
                </View>
                <View style={styles.eventSeverity}>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(event.severity) }]}>
                    <Text style={styles.severityText}>{event.severity.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.eventTime}>{formatTime(event.timestamp)}</Text>
                </View>
              </View>
              
              <View style={styles.eventFooter}>
                <View style={styles.eventMeta}>
                  <Text style={styles.metaText}>{event.device} • {event.location}</Text>
                </View>
                <View style={styles.eventActions}>
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(event.status) }]} />
                  <TouchableOpacity onPress={() => setShowEventDetails(event)}>
                    <Icon name="visibility" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Sessions</Text>
          
          {activeSessions.map(session => (
            <Card key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionInfo}>
                  <Icon name="devices" size={24} color={colors.primary} />
                  <View style={styles.sessionDetails}>
                    <Text style={styles.sessionDevice}>{session.device}</Text>
                    <Text style={styles.sessionLocation}>{session.location}</Text>
                  </View>
                </View>
                <View style={styles.sessionStatus}>
                  <View style={[styles.sessionDot, { backgroundColor: session.isActive ? '#4CAF50' : colors.textTertiary }]} />
                  <Text style={styles.sessionStatusText}>{session.isActive ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>
              
              <View style={styles.sessionFooter}>
                <Text style={styles.sessionTime}>Started: {formatTime(session.startTime)}</Text>
                <Text style={styles.sessionActivity}>Last active: {formatTime(session.lastActivity)}</Text>
                
                {session.isActive && (
                  <TouchableOpacity 
                    style={styles.terminateButton}
                    onPress={() => terminateSession(session.id)}
                  >
                    <Icon name="block" size={16} color={colors.danger} />
                    <Text style={styles.terminateText}>Terminate</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Management</Text>
          
          {devices.map(device => (
            <Card key={device.id} style={styles.deviceCard}>
              <View style={styles.deviceHeader}>
                <View style={styles.deviceInfo}>
                  <Icon name="devices" size={24} color={getDeviceStatusColor(device.status)} />
                  <View style={styles.deviceDetails}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceType}>{device.type}</Text>
                  </View>
                </View>
                <View style={styles.deviceStatus}>
                  <View style={[styles.deviceBadge, { backgroundColor: getDeviceStatusColor(device.status) }]}>
                    <Text style={styles.deviceStatusText}>{device.status.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.deviceFooter}>
                <Text style={styles.deviceRisk}>Risk Score: {device.riskLevel}%</Text>
                <Text style={styles.deviceLastSeen}>Last seen: {formatTime(device.lastSeen)}</Text>
                
                <View style={styles.deviceActions}>
                  {device.status === 'unknown' && (
                    <TouchableOpacity 
                      style={styles.trustButton}
                      onPress={() => trustDevice(device.id)}
                    >
                      <Icon name="check" size={16} color="#4CAF50" />
                      <Text style={styles.trustText}>Trust</Text>
                    </TouchableOpacity>
                  )}
                  {device.status !== 'blocked' && (
                    <TouchableOpacity 
                      style={styles.blockButton}
                      onPress={() => blockDevice(device.id)}
                    >
                      <Icon name="block" size={16} color={colors.danger} />
                      <Text style={styles.blockText}>Block</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showEventDetails !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {showEventDetails && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Event Details</Text>
              <TouchableOpacity onPress={() => setShowEventDetails(null)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Event Information</Text>
                <Text style={styles.detailText}>Type: {showEventDetails.type}</Text>
                <Text style={styles.detailText}>Severity: {showEventDetails.severity.toUpperCase()}</Text>
                <Text style={styles.detailText}>Status: {showEventDetails.status}</Text>
                <Text style={styles.detailText}>Time: {formatTime(showEventDetails.timestamp)}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Description</Text>
                <Text style={styles.detailText}>{showEventDetails.description}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Location & Device</Text>
                <Text style={styles.detailText}>Location: {showEventDetails.location}</Text>
                <Text style={styles.detailText}>Device: {showEventDetails.device}</Text>
              </View>
            </ScrollView>
          </View>
        )}
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
  statusOverview: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  statusLabel: {
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
  eventCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  eventInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  eventDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  eventTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  eventDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  eventSeverity: {
    alignItems: 'flex-end',
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  severityText: {
    fontSize: typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  eventTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventMeta: {
    flex: 1,
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sessionCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDetails: {
    marginLeft: spacing.md,
  },
  sessionDevice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sessionLocation: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  sessionStatus: {
    alignItems: 'flex-end',
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  sessionStatusText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTime: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  sessionActivity: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  terminateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.danger + '10',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  terminateText: {
    fontSize: typography.fontSize.xs,
    color: colors.danger,
    marginLeft: spacing.xs,
  },
  deviceCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceDetails: {
    marginLeft: spacing.md,
  },
  deviceName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  deviceType: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  deviceStatus: {
    alignItems: 'flex-end',
  },
  deviceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  deviceStatusText: {
    fontSize: typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  deviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceRisk: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  deviceLastSeen: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  deviceActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  trustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: '#4CAF5010',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  trustText: {
    fontSize: typography.fontSize.xs,
    color: '#4CAF50',
    marginLeft: spacing.xs,
  },
  blockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.danger + '10',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  blockText: {
    fontSize: typography.fontSize.xs,
    color: colors.danger,
    marginLeft: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  detailSection: {
    marginBottom: spacing.xl,
  },
  detailTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});

export default SecurityMonitoringScreen;
