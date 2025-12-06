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

interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'active' | 'inactive' | 'error';
  lastCalled: string;
  responseTime: number;
  successRate: number;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created: string;
  lastUsed: string;
  isActive: boolean;
}

interface APILog {
  id: string;
  endpoint: string;
  method: string;
  timestamp: string;
  status: 'success' | 'error';
  responseTime: number;
  statusCode: number;
}

const APIIntegrationScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([
    {
      id: '1',
      name: 'Payment Processing',
      url: 'https://api.mypay.com/v1/payments',
      method: 'POST',
      status: 'active',
      lastCalled: new Date(Date.now() - 300000).toISOString(),
      responseTime: 245,
      successRate: 98.5,
    },
    {
      id: '2',
      name: 'User Authentication',
      url: 'https://api.mypay.com/v1/auth',
      method: 'POST',
      status: 'active',
      lastCalled: new Date(Date.now() - 600000).toISOString(),
      responseTime: 189,
      successRate: 99.2,
    },
    {
      id: '3',
      name: 'Transaction History',
      url: 'https://api.mypay.com/v1/transactions',
      method: 'GET',
      status: 'error',
      lastCalled: new Date(Date.now() - 900000).toISOString(),
      responseTime: 1200,
      successRate: 85.3,
    },
  ]);

  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production Key',
      key: 'pk_live_1234567890abcdef',
      permissions: ['read', 'write', 'delete'],
      created: new Date(Date.now() - 86400000 * 30).toISOString(),
      lastUsed: new Date(Date.now() - 300000).toISOString(),
      isActive: true,
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'pk_test_1234567890abcdef',
      permissions: ['read'],
      created: new Date(Date.now() - 86400000 * 15).toISOString(),
      lastUsed: new Date(Date.now() - 3600000).toISOString(),
      isActive: true,
    },
  ]);

  const [apiLogs, setApiLogs] = useState<APILog[]>([
    {
      id: '1',
      endpoint: 'Payment Processing',
      method: 'POST',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: 'success',
      responseTime: 245,
      statusCode: 200,
    },
    {
      id: '2',
      endpoint: 'User Authentication',
      method: 'POST',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      status: 'success',
      responseTime: 189,
      statusCode: 200,
    },
    {
      id: '3',
      endpoint: 'Transaction History',
      method: 'GET',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      status: 'error',
      responseTime: 1200,
      statusCode: 500,
    },
  ]);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [autoRetry, setAutoRetry] = useState(true);
  const [rateLimiting, setRateLimiting] = useState(true);

  useEffect(() => {
    simulateAPICalls();
  }, []);

  const simulateAPICalls = () => {
    const interval = setInterval(() => {
      const randomEndpoint = apiEndpoints[Math.floor(Math.random() * apiEndpoints.length)];
      const success = Math.random() > 0.1;
      
      const newLog: APILog = {
        id: Date.now().toString(),
        endpoint: randomEndpoint.name,
        method: randomEndpoint.method,
        timestamp: new Date().toISOString(),
        status: success ? 'success' : 'error',
        responseTime: Math.floor(Math.random() * 1000) + 100,
        statusCode: success ? 200 : Math.floor(Math.random() * 3) + 400,
      };
      
      setApiLogs(prev => [newLog, ...prev.slice(0, 19)]);
      
      setApiEndpoints(prev => 
        prev.map(endpoint => 
          endpoint.id === randomEndpoint.id 
            ? { 
                ...endpoint, 
                lastCalled: new Date().toISOString(),
                responseTime: newLog.responseTime,
                successRate: success ? 
                  Math.min(100, endpoint.successRate + 0.1) : 
                  Math.max(0, endpoint.successRate - 0.5)
              }
            : endpoint
        )
      );
    }, 15000);

    return () => clearInterval(interval);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return colors.textTertiary;
      case 'error': return colors.danger;
      default: return colors.textSecondary;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return '#4CAF50';
      case 'POST': return '#2196F3';
      case 'PUT': return '#FF9800';
      case 'DELETE': return colors.danger;
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

  const formatResponseTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const testEndpoint = (endpoint: APIEndpoint) => {
    setSelectedEndpoint(endpoint);
    setShowEndpointModal(true);
    
    setTimeout(() => {
      setShowEndpointModal(false);
      Alert.alert('API Test', `Endpoint ${endpoint.name} test completed successfully`);
    }, 2000);
  };

  const toggleAPIKey = (keyId: string) => {
    setApiKeys(prev => 
      prev.map(key => 
        key.id === keyId 
          ? { ...key, isActive: !key.isActive }
          : key
      )
    );
  };

  const regenerateKey = (keyId: string) => {
    Alert.alert(
      'Regenerate API Key',
      'This will invalidate the current key. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Regenerate', 
          style: 'destructive',
          onPress: () => {
            const newKey = 'pk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            setApiKeys(prev => 
              prev.map(key => 
                key.id === keyId 
                  ? { ...key, key: newKey, lastUsed: new Date().toISOString() }
                  : key
              )
            );
            Alert.alert('Success', 'API key regenerated successfully');
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
            <Icon name="api" size={48} color="#FFFFFF" />
            <Text style={styles.headerTitle}>API Integration</Text>
            <Text style={styles.headerSubtitle}>Manage your API connections</Text>
            
            <View style={styles.apiOverview}>
              <View style={styles.apiItem}>
                <Text style={styles.apiValue}>{apiEndpoints.filter(e => e.status === 'active').length}</Text>
                <Text style={styles.apiLabel}>Active Endpoints</Text>
              </View>
              <View style={styles.apiItem}>
                <Text style={styles.apiValue}>{apiLogs.filter(l => l.status === 'success').length}</Text>
                <Text style={styles.apiLabel}>Success Today</Text>
              </View>
              <View style={styles.apiItem}>
                <Text style={styles.apiValue}>{apiKeys.filter(k => k.isActive).length}</Text>
                <Text style={styles.apiLabel}>Active Keys</Text>
              </View>
            </View>
          </View>
        </GradientCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Endpoints</Text>
          
          {apiEndpoints.map(endpoint => (
            <Card key={endpoint.id} style={styles.endpointCard}>
              <View style={styles.endpointHeader}>
                <View style={styles.endpointInfo}>
                  <Icon name="http" size={24} color={colors.primary} />
                  <View style={styles.endpointDetails}>
                    <Text style={styles.endpointName}>{endpoint.name}</Text>
                    <Text style={styles.endpointUrl}>{endpoint.url}</Text>
                  </View>
                </View>
                <View style={styles.endpointStatus}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(endpoint.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(endpoint.status) }]}>
                    {endpoint.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.endpointContent}>
                <View style={styles.methodBadge}>
                  <Text style={[styles.methodText, { color: getMethodColor(endpoint.method) }]}>
                    {endpoint.method}
                  </Text>
                </View>
                
                <View style={styles.endpointMetrics}>
                  <Text style={styles.metricText}>Response: {formatResponseTime(endpoint.responseTime)}</Text>
                  <Text style={styles.metricText}>Success: {endpoint.successRate.toFixed(1)}%</Text>
                  <Text style={styles.metricText}>Last: {formatTime(endpoint.lastCalled)}</Text>
                </View>
              </View>
              
              <View style={styles.endpointFooter}>
                <TouchableOpacity 
                  style={styles.testButton}
                  onPress={() => testEndpoint(endpoint)}
                >
                  <Icon name="play-arrow" size={16} color={colors.primary} />
                  <Text style={styles.testButtonText}>Test</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Keys</Text>
          
          {apiKeys.map(key => (
            <Card key={key.id} style={styles.keyCard}>
              <View style={styles.keyHeader}>
                <View style={styles.keyInfo}>
                  <Icon name="vpn-key" size={24} color={colors.primary} />
                  <View style={styles.keyDetails}>
                    <Text style={styles.keyName}>{key.name}</Text>
                    <Text style={styles.keyValue}>{key.key.substring(0, 8)}...</Text>
                  </View>
                </View>
                <Switch
                  value={key.isActive}
                  onValueChange={() => toggleAPIKey(key.id)}
                  trackColor={{ false: colors.border, true: colors.primary + '40' }}
                  thumbColor={key.isActive ? colors.primary : colors.textTertiary}
                />
              </View>
              
              <View style={styles.keyContent}>
                <Text style={styles.keyPermissions}>Permissions: {key.permissions.join(', ')}</Text>
                <Text style={styles.keyCreated}>Created: {formatTime(key.created)}</Text>
                <Text style={styles.keyLastUsed}>Last used: {formatTime(key.lastUsed)}</Text>
              </View>
              
              <View style={styles.keyFooter}>
                <TouchableOpacity 
                  style={styles.regenerateButton}
                  onPress={() => regenerateKey(key.id)}
                >
                  <Icon name="refresh" size={16} color={colors.primary} />
                  <Text style={styles.regenerateText}>Regenerate</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Logs</Text>
          
          {apiLogs.map(log => (
            <Card key={log.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <View style={styles.logInfo}>
                  <Icon name="history" size={20} color={log.status === 'success' ? '#4CAF50' : colors.danger} />
                  <View style={styles.logDetails}>
                    <Text style={styles.logEndpoint}>{log.endpoint}</Text>
                    <Text style={styles.logTime}>{formatTime(log.timestamp)}</Text>
                  </View>
                </View>
                <View style={styles.logResult}>
                  <Text style={[log.status === 'success' ? styles.successText : styles.failText]}>
                    {log.status}
                  </Text>
                  <Text style={styles.statusCode}>{log.statusCode}</Text>
                </View>
              </View>
              
              <View style={styles.logFooter}>
                <Text style={styles.logMethod}>{log.method}</Text>
                <Text style={styles.logResponseTime}>{formatResponseTime(log.responseTime)}</Text>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Settings</Text>
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="autorenew" size={24} color={colors.primary} />
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>Auto Retry Failed Requests</Text>
                  <Text style={styles.settingDescription}>Automatically retry failed API calls</Text>
                </View>
              </View>
              <Switch
                value={autoRetry}
                onValueChange={setAutoRetry}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={autoRetry ? colors.primary : colors.textTertiary}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="speed" size={24} color={colors.primary} />
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>Rate Limiting</Text>
                  <Text style={styles.settingDescription}>Limit API request frequency</Text>
                </View>
              </View>
              <Switch
                value={rateLimiting}
                onValueChange={setRateLimiting}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={rateLimiting ? colors.primary : colors.textTertiary}
              />
            </View>
          </Card>
        </View>
      </ScrollView>

      <Modal
        visible={showEndpointModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="api" size={48} color={colors.primary} />
            <Text style={styles.modalTitle}>Testing API Endpoint</Text>
            <Text style={styles.modalDescription}>
              Testing {selectedEndpoint?.name}...
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
  apiOverview: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  apiItem: {
    alignItems: 'center',
  },
  apiValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  apiLabel: {
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
  endpointCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  endpointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  endpointInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  endpointDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  endpointName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  endpointUrl: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  endpointStatus: {
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
  endpointContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  methodBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
  },
  methodText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  endpointMetrics: {
    flex: 1,
    marginLeft: spacing.md,
  },
  metricText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  endpointFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '10',
  },
  testButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  keyCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  keyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  keyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  keyDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  keyName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  keyValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  keyContent: {
    marginBottom: spacing.md,
  },
  keyPermissions: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  keyCreated: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  keyLastUsed: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  keyFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '10',
  },
  regenerateText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginLeft: spacing.xs,
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
  logEndpoint: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  logTime: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
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
  statusCode: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  logMethod: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  logResponseTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
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

export default APIIntegrationScreen;
