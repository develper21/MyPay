import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientCard from '../../components/ui/GradientCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

interface ThirdPartyService {
  id: string;
  name: string;
  category: 'payment' | 'banking' | 'utility' | 'ecommerce';
  description: string;
  enabled: boolean;
  connected: boolean;
  lastSync: string;
  apiCalls: number;
  status: 'active' | 'inactive' | 'error';
}

interface ServiceIntegration {
  id: string;
  serviceName: string;
  integrationType: 'webhook' | 'api' | 'oauth';
  endpoint: string;
  isActive: boolean;
  lastActivity: string;
}

interface ServiceUsage {
  id: string;
  service: string;
  action: string;
  timestamp: string;
  success: boolean;
  responseTime: number;
}

const ThirdPartyServicesScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [services, setServices] = useState<ThirdPartyService[]>([
    {
      id: '1',
      name: 'PayPal Integration',
      category: 'payment',
      description: 'Connect PayPal for international payments',
      enabled: true,
      connected: true,
      lastSync: new Date(Date.now() - 300000).toISOString(),
      apiCalls: 1247,
      status: 'active',
    },
    {
      id: '2',
      name: 'Bank API',
      category: 'banking',
      description: 'Direct bank account integration',
      enabled: true,
      connected: true,
      lastSync: new Date(Date.now() - 600000).toISOString(),
      apiCalls: 892,
      status: 'active',
    },
    {
      id: '3',
      name: 'Google Pay',
      category: 'payment',
      description: 'UPI payments through Google Pay',
      enabled: false,
      connected: false,
      lastSync: new Date(Date.now() - 86400000).toISOString(),
      apiCalls: 0,
      status: 'inactive',
    },
    {
      id: '4',
      name: 'Bill Desk',
      category: 'utility',
      description: 'Utility bill payment service',
      enabled: true,
      connected: true,
      lastSync: new Date(Date.now() - 900000).toISOString(),
      apiCalls: 456,
      status: 'active',
    },
  ]);

  const [integrations, setIntegrations] = useState<ServiceIntegration[]>([
    {
      id: '1',
      serviceName: 'PayPal Integration',
      integrationType: 'api',
      endpoint: 'https://api.paypal.com/v1/payments',
      isActive: true,
      lastActivity: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: '2',
      serviceName: 'Bank API',
      integrationType: 'oauth',
      endpoint: 'https://bank.example.com/api',
      isActive: true,
      lastActivity: new Date(Date.now() - 600000).toISOString(),
    },
  ]);

  const [usageLogs, setUsageLogs] = useState<ServiceUsage[]>([
    {
      id: '1',
      service: 'PayPal Integration',
      action: 'Payment Processed',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      success: true,
      responseTime: 245,
    },
    {
      id: '2',
      service: 'Bank API',
      action: 'Balance Check',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      success: true,
      responseTime: 189,
    },
    {
      id: '3',
      service: 'Bill Desk',
      action: 'Bill Payment',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      success: false,
      responseTime: 1200,
    },
  ]);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ThirdPartyService | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [webhookEnabled, setWebhookEnabled] = useState(true);

  useEffect(() => {
    simulateServiceActivity();
  }, []);

  const simulateServiceActivity = () => {
    const interval = setInterval(() => {
      const activeServices = services.filter(s => s.connected);
      if (activeServices.length === 0) return;
      
      const randomService = activeServices[Math.floor(Math.random() * activeServices.length)];
      const success = Math.random() > 0.1;
      
      const newUsage: ServiceUsage = {
        id: Date.now().toString(),
        service: randomService.name,
        action: ['Payment Processed', 'Balance Check', 'Transaction Sync', 'Webhook Received'][Math.floor(Math.random() * 4)],
        timestamp: new Date().toISOString(),
        success,
        responseTime: Math.floor(Math.random() * 1000) + 100,
      };
      
      setUsageLogs(prev => [newUsage, ...prev.slice(0, 19)]);
      
      setServices(prev => 
        prev.map(service => 
          service.id === randomService.id 
            ? { 
                ...service, 
                lastSync: new Date().toISOString(),
                apiCalls: service.apiCalls + 1,
                status: success ? 'active' : 'error'
              }
            : service
        )
      );
    }, 20000);

    return () => clearInterval(interval);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'payment': return colors.primary;
      case 'banking': return '#4CAF50';
      case 'utility': return '#FF9800';
      case 'ecommerce': return '#9C27B0';
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return colors.textTertiary;
      case 'error': return colors.danger;
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

  const toggleService = (serviceId: string) => {
    setServices(prev => 
      prev.map(service => 
        service.id === serviceId 
          ? { ...service, enabled: !service.enabled, status: !service.enabled ? 'active' : 'inactive' }
          : service
      )
    );
  };

  const connectService = (service: ThirdPartyService) => {
    setSelectedService(service);
    setShowConnectModal(true);
    
    setTimeout(() => {
      setServices(prev => 
        prev.map(s => 
          s.id === service.id 
            ? { ...s, connected: true, status: 'active' as const }
            : s
        )
      );
      setShowConnectModal(false);
      Alert.alert('Success', `${service.name} connected successfully`);
    }, 3000);
  };

  const disconnectService = (serviceId: string) => {
    Alert.alert(
      'Disconnect Service',
      'This will disconnect the service and remove all integrations.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: () => {
            setServices(prev => 
              prev.map(service => 
                service.id === serviceId 
                  ? { ...service, connected: false, status: 'inactive' as const }
                  : service
              )
            );
            Alert.alert('Success', 'Service disconnected');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <GradientCard gradientColors={[colors.primary, colors.primary + '80']} padding={0}>
          <View style={styles.headerCard}>
            <Icon name="extension" size={48} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Third-Party Services</Text>
            <Text style={styles.headerSubtitle}>Integrate external services</Text>
            
            <View style={styles.serviceOverview}>
              <View style={styles.serviceItem}>
                <Text style={styles.serviceValue}>{services.filter(s => s.connected).length}</Text>
                <Text style={styles.serviceLabel}>Connected</Text>
              </View>
              <View style={styles.serviceItem}>
                <Text style={styles.serviceValue}>{usageLogs.filter(l => l.success).length}</Text>
                <Text style={styles.serviceLabel}>Success Today</Text>
              </View>
              <View style={styles.serviceItem}>
                <Text style={styles.serviceValue}>{services.reduce((acc, s) => acc + s.apiCalls, 0)}</Text>
                <Text style={styles.serviceLabel}>API Calls</Text>
              </View>
            </View>
          </View>
        </GradientCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          
          {services.map(service => (
            <Card key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <Icon name="extension" size={24} color={getCategoryColor(service.category)} />
                  <View style={styles.serviceDetails}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  </View>
                </View>
                <View style={styles.serviceStatus}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(service.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
                    {service.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.serviceContent}>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(service.category) }]}>
                  <Text style={styles.categoryText}>{service.category}</Text>
                </View>
                
                <View style={styles.serviceMetrics}>
                  <Text style={styles.metricText}>API Calls: {service.apiCalls}</Text>
                  <Text style={styles.metricText}>Last Sync: {formatTime(service.lastSync)}</Text>
                </View>
              </View>
              
              <View style={styles.serviceFooter}>
                <Switch
                  value={service.enabled}
                  onValueChange={() => toggleService(service.id)}
                  trackColor={{ false: colors.border, true: colors.primary + '40' }}
                  thumbColor={service.enabled ? colors.primary : colors.textTertiary}
                />
                
                {service.connected ? (
                  <TouchableOpacity 
                    style={styles.disconnectButton}
                    onPress={() => disconnectService(service.id)}
                  >
                    <Icon name="link-off" size={16} color={colors.danger} />
                    <Text style={styles.disconnectText}>Disconnect</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.connectButton}
                    onPress={() => connectService(service)}
                  >
                    <Icon name="link" size={16} color={colors.primary} />
                    <Text style={styles.connectText}>Connect</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Integrations</Text>
          
          {integrations.map(integration => (
            <Card key={integration.id} style={styles.integrationCard}>
              <View style={styles.integrationHeader}>
                <View style={styles.integrationInfo}>
                  <Icon name="settings-ethernet" size={24} color={colors.primary} />
                  <View style={styles.integrationDetails}>
                    <Text style={styles.integrationName}>{integration.serviceName}</Text>
                    <Text style={styles.integrationType}>{integration.integrationType.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.integrationStatus}>
                  <View style={[styles.statusDot, { backgroundColor: integration.isActive ? '#4CAF50' : colors.textTertiary }]} />
                  <Text style={styles.integrationStatusText}>
                    {integration.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.integrationContent}>
                <Text style={styles.integrationEndpoint}>{integration.endpoint}</Text>
                <Text style={styles.integrationActivity}>Last activity: {formatTime(integration.lastActivity)}</Text>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage Logs</Text>
          
          {usageLogs.map(log => (
            <Card key={log.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <View style={styles.logInfo}>
                  <Icon name="history" size={20} color={log.success ? '#4CAF50' : colors.danger} />
                  <View style={styles.logDetails}>
                    <Text style={styles.logService}>{log.service}</Text>
                    <Text style={styles.logAction}>{log.action}</Text>
                  </View>
                </View>
                <View style={styles.logResult}>
                  <Text style={[log.success ? styles.successText : styles.failText]}>
                    {log.success ? 'Success' : 'Failed'}
                  </Text>
                  <Text style={styles.logResponseTime}>{log.responseTime}ms</Text>
                </View>
              </View>
              
              <Text style={styles.logTime}>{formatTime(log.timestamp)}</Text>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Settings</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="sync" size={24} color={colors.primary} />
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>Auto Sync</Text>
                  <Text style={styles.settingDescription}>Automatically sync service data</Text>
                </View>
              </View>
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={autoSync ? colors.primary : colors.textTertiary}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="webhook" size={24} color={colors.primary} />
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>Webhook Support</Text>
                  <Text style={styles.settingDescription}>Enable webhook notifications</Text>
                </View>
              </View>
              <Switch
                value={webhookEnabled}
                onValueChange={setWebhookEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={webhookEnabled ? colors.primary : colors.textTertiary}
              />
            </View>
          </Card>
        </View>
      </ScrollView>

      <Modal
        visible={showConnectModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="extension" size={48} color={colors.primary} />
            <Text style={styles.modalTitle}>Connecting Service</Text>
            <Text style={styles.modalDescription}>
              Connecting to {selectedService?.name}...
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
  serviceOverview: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  serviceItem: {
    alignItems: 'center',
  },
  serviceValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  serviceLabel: {
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
    flex: 1,
  },
  serviceDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  serviceName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  serviceStatus: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  serviceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  serviceMetrics: {
    flex: 1,
    marginLeft: spacing.md,
  },
  metricText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '10',
  },
  connectText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.danger + '10',
  },
  disconnectText: {
    fontSize: typography.fontSize.xs,
    color: colors.danger,
    marginLeft: spacing.xs,
  },
  integrationCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  integrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  integrationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  integrationDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  integrationName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  integrationType: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  integrationStatus: {
    alignItems: 'flex-end',
  },
  integrationStatusText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  integrationContent: {
    marginTop: spacing.sm,
  },
  integrationEndpoint: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  integrationActivity: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  logCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  logService: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  logAction: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  logResult: {
    alignItems: 'flex-end',
  },
  successText: {
    fontSize: typography.fontSize.sm,
    color: '#4CAF50',
    fontWeight: typography.fontWeight.semibold,
  },
  failText: {
    fontSize: typography.fontSize.sm,
    color: colors.danger,
    fontWeight: typography.fontWeight.semibold,
  },
  logResponseTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  logTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.sm,
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

export default ThirdPartyServicesScreen;
