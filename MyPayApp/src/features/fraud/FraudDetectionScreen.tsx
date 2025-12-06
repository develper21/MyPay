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

interface FraudAlert {
  id: string;
  transactionId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  amount: number;
  recipient: string;
  timestamp: string;
  factors: string[];
  status: 'pending' | 'reviewed' | 'resolved' | 'false_positive';
  action: 'block' | 'allow' | 'investigate';
}

interface RiskFactor {
  id: string;
  name: string;
  weight: number;
  enabled: boolean;
  description: string;
}

interface FraudMetrics {
  totalTransactions: number;
  fraudAttempts: number;
  blockedTransactions: number;
  falsePositives: number;
  detectionRate: number;
  averageRiskScore: number;
}

const FraudDetectionScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([
    {
      id: '1',
      transactionId: 'TXN123456789',
      riskLevel: 'high',
      riskScore: 85,
      amount: 50000,
      recipient: 'Unknown Account',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      factors: ['Unusual amount', 'New recipient', 'Late night transaction'],
      status: 'pending',
      action: 'block',
    },
    {
      id: '2',
      transactionId: 'TXN123456788',
      riskLevel: 'medium',
      riskScore: 65,
      amount: 15000,
      recipient: 'John Doe',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      factors: ['Unusual location', 'Device change'],
      status: 'reviewed',
      action: 'investigate',
    },
    {
      id: '3',
      transactionId: 'TXN123456787',
      riskLevel: 'low',
      riskScore: 35,
      amount: 500,
      recipient: 'Amazon India',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      factors: ['Slightly higher frequency'],
      status: 'resolved',
      action: 'allow',
    },
  ]);

  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([
    {
      id: 'amount',
      name: 'Transaction Amount',
      weight: 30,
      enabled: true,
      description: 'Unusually high transaction amounts',
    },
    {
      id: 'frequency',
      name: 'Transaction Frequency',
      weight: 20,
      enabled: true,
      description: 'Higher than normal transaction frequency',
    },
    {
      id: 'location',
      name: 'Geographic Location',
      weight: 25,
      enabled: true,
      description: 'Transactions from unusual locations',
    },
    {
      id: 'device',
      name: 'Device Recognition',
      weight: 15,
      enabled: true,
      description: 'New or unrecognized devices',
    },
    {
      id: 'time',
      name: 'Time Pattern',
      weight: 10,
      enabled: true,
      description: 'Unusual transaction timing',
    },
  ]);

  const [fraudMetrics, setFraudMetrics] = useState<FraudMetrics>({
    totalTransactions: 15420,
    fraudAttempts: 127,
    blockedTransactions: 89,
    falsePositives: 12,
    detectionRate: 94.5,
    averageRiskScore: 28.3,
  });

  const [showAlertDetails, setShowAlertDetails] = useState<FraudAlert | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(true);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);

  useEffect(() => {
    simulateRealTimeMonitoring();
  }, []);

  const simulateRealTimeMonitoring = () => {
    if (!realTimeMonitoring) return;
    
    const interval = setInterval(() => {
      const randomScore = Math.random() * 100;
      if (randomScore > 70) {
        const newAlert: FraudAlert = {
          id: Date.now().toString(),
          transactionId: `TXN${Date.now()}`,
          riskLevel: randomScore > 85 ? 'critical' : 'high',
          riskScore: Math.round(randomScore),
          amount: Math.round(Math.random() * 100000),
          recipient: 'Suspicious Account',
          timestamp: new Date().toISOString(),
          factors: ['Real-time detection', 'AI analysis'],
          status: 'pending',
          action: 'block',
        };
        
        setFraudAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
        Alert.alert('New Fraud Alert', `High-risk transaction detected: ${newAlert.transactionId}`);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#FF5722';
      case 'critical': return colors.danger;
      default: return colors.textSecondary;
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return 'check-circle';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'dangerous';
      default: return 'help';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'reviewed': return '#2196F3';
      case 'resolved': return '#4CAF50';
      case 'false_positive': return '#9E9E9E';
      default: return colors.textSecondary;
    }
  };

  const formatAmount = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
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
      Alert.alert('Success', 'Fraud detection data refreshed');
    }, 2000);
  };

  const handleAlertAction = (alertId: string, action: 'allow' | 'block' | 'investigate') => {
    setFraudAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved' as const, action }
          : alert
      )
    );
    
    Alert.alert(
      'Action Taken',
      `Transaction ${action === 'allow' ? 'allowed' : action === 'block' ? 'blocked' : 'flagged for investigation'}`
    );
  };

  const updateRiskFactor = (factorId: string, enabled: boolean, weight: number) => {
    setRiskFactors(prev => 
      prev.map(factor => 
        factor.id === factorId 
          ? { ...factor, enabled, weight }
          : factor
      )
    );
  };

  const runFraudAnalysis = () => {
    Alert.alert(
      'Running Fraud Analysis',
      'Analyzing recent transactions for fraud patterns...',
      [
        { text: 'OK' }
      ]
    );
    
    setTimeout(() => {
      const newAlerts: FraudAlert[] = [];
      for (let i = 0; i < 3; i++) {
        const riskScore = Math.random() * 100;
        newAlerts.push({
          id: `analysis_${Date.now()}_${i}`,
          transactionId: `TXN${Date.now()}_${i}`,
          riskLevel: riskScore > 70 ? (riskScore > 85 ? 'critical' : 'high') : 'medium',
          riskScore: Math.round(riskScore),
          amount: Math.round(Math.random() * 50000),
          recipient: ['Amazon', 'Flipkart', 'Unknown', 'Suspicious'][Math.floor(Math.random() * 4)],
          timestamp: new Date().toISOString(),
          factors: ['AI Analysis', 'Pattern Recognition', 'Behavior Analysis'],
          status: 'pending',
          action: riskScore > 70 ? 'block' : 'investigate',
        });
      }
      
      setFraudAlerts(prev => [...newAlerts, ...prev]);
      Alert.alert('Analysis Complete', `Found ${newAlerts.length} suspicious transactions`);
    }, 3000);
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
        <GradientCard gradientColors={[colors.danger, colors.danger + '80']} padding={0}>
          <View style={styles.headerCard}>
            <Icon name="security" size={48} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Fraud Detection</Text>
            <Text style={styles.headerSubtitle}>AI-powered fraud prevention</Text>
            
            <View style={styles.metricsOverview}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{fraudMetrics.detectionRate}%</Text>
                <Text style={styles.metricLabel}>Detection Rate</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{fraudAlerts.filter(a => a.status === 'pending').length}</Text>
                <Text style={styles.metricLabel}>Pending</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{fraudMetrics.blockedTransactions}</Text>
                <Text style={styles.metricLabel}>Blocked</Text>
              </View>
            </View>
          </View>
        </GradientCard>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={runFraudAnalysis}>
              <Icon name="analytics" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Run Analysis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => setShowSettings(true)}>
              <Icon name="settings" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="assessment" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fraud Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Fraud Alerts</Text>
          
          {fraudAlerts.map(alert => (
            <Card key={alert.id} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <View style={styles.alertInfo}>
                  <Icon 
                    name={getRiskIcon(alert.riskLevel)} 
                    size={24} 
                    color={getRiskColor(alert.riskLevel)} 
                  />
                  <View style={styles.alertDetails}>
                    <Text style={styles.alertTransaction}>{alert.transactionId}</Text>
                    <Text style={styles.alertAmount}>{formatAmount(alert.amount)}</Text>
                  </View>
                </View>
                <View style={styles.alertRisk}>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskColor(alert.riskLevel) }]}>
                    <Text style={styles.riskText}>{alert.riskLevel.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.riskScore}>Score: {alert.riskScore}</Text>
                </View>
              </View>
              
              <View style={styles.alertContent}>
                <Text style={styles.alertRecipient}>To: {alert.recipient}</Text>
                <Text style={styles.alertTime}>{formatTime(alert.timestamp)}</Text>
                
                <View style={styles.factorsContainer}>
                  <Text style={styles.factorsTitle}>Risk Factors:</Text>
                  <View style={styles.factorsList}>
                    {alert.factors.map((factor, index) => (
                      <View key={index} style={styles.factorChip}>
                        <Text style={styles.factorText}>{factor}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              
              <View style={styles.alertFooter}>
                <View style={styles.alertStatus}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(alert.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(alert.status) }]}>
                    {alert.status}
                  </Text>
                </View>
                
                {alert.status === 'pending' && (
                  <View style={styles.alertActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.allowButton]}
                      onPress={() => handleAlertAction(alert.id, 'allow')}
                    >
                      <Icon name="check" size={16} color="#4CAF50" />
                      <Text style={styles.actionText}>Allow</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.blockButton]}
                      onPress={() => handleAlertAction(alert.id, 'block')}
                    >
                      <Icon name="block" size={16} color={colors.danger} />
                      <Text style={styles.actionText}>Block</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.investigateButton]}
                      onPress={() => handleAlertAction(alert.id, 'investigate')}
                    >
                      <Icon name="search" size={16} color="#2196F3" />
                      <Text style={styles.actionText}>Investigate</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                <TouchableOpacity onPress={() => setShowAlertDetails(alert)}>
                  <Icon name="visibility" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fraud Statistics</Text>
          <Card style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{fraudMetrics.totalTransactions.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total Transactions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{fraudMetrics.fraudAttempts}</Text>
                <Text style={styles.statLabel}>Fraud Attempts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{fraudMetrics.falsePositives}</Text>
                <Text style={styles.statLabel}>False Positives</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{fraudMetrics.averageRiskScore}</Text>
                <Text style={styles.statLabel}>Avg Risk Score</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Alert Details Modal */}
      <Modal
        visible={showAlertDetails !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {showAlertDetails && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alert Details</Text>
              <TouchableOpacity onPress={() => setShowAlertDetails(null)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Transaction Information</Text>
                <Text style={styles.detailText}>ID: {showAlertDetails.transactionId}</Text>
                <Text style={styles.detailText}>Amount: {formatAmount(showAlertDetails.amount)}</Text>
                <Text style={styles.detailText}>Recipient: {showAlertDetails.recipient}</Text>
                <Text style={styles.detailText}>Time: {formatTime(showAlertDetails.timestamp)}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Risk Assessment</Text>
                <View style={styles.riskAssessment}>
                  <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(showAlertDetails.riskLevel) }]} />
                  <Text style={styles.detailText}>Risk Level: {showAlertDetails.riskLevel.toUpperCase()}</Text>
                  <Text style={styles.detailText}>Risk Score: {showAlertDetails.riskScore}/100</Text>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Detected Risk Factors</Text>
                {showAlertDetails.factors.map((factor, index) => (
                  <View key={index} style={styles.factorItem}>
                    <Icon name="warning" size={16} color={colors.primary} />
                    <Text style={styles.factorItemText}>{factor}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>AI Recommendations</Text>
                <Text style={styles.recommendationText}>
                  Based on the risk factors detected, it is recommended to {showAlertDetails.action} this transaction.
                  The AI model has identified patterns consistent with fraudulent activity.
                </Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Take Action"
                onPress={() => {
                  handleAlertAction(showAlertDetails.id, showAlertDetails.action);
                  setShowAlertDetails(null);
                }}
                style={styles.actionButtonModal}
              />
            </View>
          </View>
        )}
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Fraud Detection Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>General Settings</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Icon name="block" size={24} color={colors.primary} />
                  <View style={styles.settingDetails}>
                    <Text style={styles.settingTitle}>Auto-Block High Risk</Text>
                    <Text style={styles.settingDescription}>Automatically block transactions with high risk scores</Text>
                  </View>
                </View>
                <View style={styles.switch}>
                  <Text style={styles.switchText}>{autoBlockEnabled ? 'ON' : 'OFF'}</Text>
                </View>
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Icon name="radar" size={24} color={colors.primary} />
                  <View style={styles.settingDetails}>
                    <Text style={styles.settingTitle}>Real-Time Monitoring</Text>
                    <Text style={styles.settingDescription}>Monitor transactions in real-time</Text>
                  </View>
                </View>
                <View style={styles.switch}>
                  <Text style={styles.switchText}>{realTimeMonitoring ? 'ON' : 'OFF'}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Risk Factor Weights</Text>
              
              {riskFactors.map(factor => (
                <View key={factor.id} style={styles.factorSetting}>
                  <View style={styles.factorHeader}>
                    <Text style={styles.factorName}>{factor.name}</Text>
                    <Text style={styles.factorWeight}>{factor.weight}%</Text>
                  </View>
                  <Text style={styles.factorDescription}>{factor.description}</Text>
                  <View style={styles.factorStatus}>
                    <View style={[styles.factorDot, { backgroundColor: factor.enabled ? '#4CAF50' : colors.textTertiary }]} />
                    <Text style={styles.factorStatusText}>{factor.enabled ? 'Enabled' : 'Disabled'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
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
  metricsOverview: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  metricLabel: {
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
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  alertCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertDetails: {
    marginLeft: spacing.md,
  },
  alertTransaction: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  alertAmount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  alertRisk: {
    alignItems: 'flex-end',
  },
  riskBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  riskText: {
    fontSize: typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  riskScore: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  alertContent: {
    marginBottom: spacing.md,
  },
  alertRecipient: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  alertTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  factorsContainer: {
    marginTop: spacing.sm,
  },
  factorsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  factorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  factorChip: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  factorText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  alertActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  allowButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF5010',
  },
  blockButton: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '10',
  },
  investigateButton: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F310',
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  statsCard: {
    padding: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
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
  riskAssessment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  riskIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  factorItemText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  recommendationText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButtonModal: {
    marginBottom: spacing.lg,
  },
  settingSection: {
    marginBottom: spacing.xl,
  },
  settingSectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
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
  switch: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '10',
  },
  switchText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  factorSetting: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  factorName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  factorWeight: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  factorDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  factorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  factorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  factorStatusText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
});

export default FraudDetectionScreen;
