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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientCard from '../../components/ui/GradientCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

interface PerformanceMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: string;
}

interface OptimizationFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  category: 'caching' | 'battery' | 'memory' | 'network';
  impact: 'high' | 'medium' | 'low';
}

const PerformanceOptimizerScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'memory_usage',
      title: 'Memory Usage',
      value: 65,
      unit: '%',
      status: 'good',
      icon: 'memory',
    },
    {
      id: 'battery_usage',
      title: 'Battery Usage',
      value: 45,
      unit: '%',
      status: 'good',
      icon: 'battery-charging-full',
    },
    {
      id: 'cache_size',
      title: 'Cache Size',
      value: 120,
      unit: 'MB',
      status: 'warning',
      icon: 'storage',
    },
    {
      id: 'network_latency',
      title: 'Network Latency',
      value: 150,
      unit: 'ms',
      status: 'good',
      icon: 'network-wifi',
    },
  ]);

  const [optimizationFeatures, setOptimizationFeatures] = useState<OptimizationFeature[]>([
    {
      id: 'smart_caching',
      title: 'Smart Caching',
      description: 'Intelligent data caching for faster app performance',
      icon: 'cached',
      enabled: true,
      category: 'caching',
      impact: 'high',
    },
    {
      id: 'battery_saver',
      title: 'Battery Saver Mode',
      description: 'Reduce background activity to save battery',
      icon: 'battery-saver',
      enabled: false,
      category: 'battery',
      impact: 'high',
    },
    {
      id: 'memory_optimization',
      title: 'Memory Optimization',
      description: 'Automatic memory cleanup and management',
      icon: 'memory',
      enabled: true,
      category: 'memory',
      impact: 'medium',
    },
    {
      id: 'offline_mode',
      title: 'Offline Mode',
      description: 'Enable offline functionality for essential features',
      icon: 'offline-bolt',
      enabled: true,
      category: 'network',
      impact: 'high',
    },
    {
      id: 'data_compression',
      title: 'Data Compression',
      description: 'Compress data to reduce bandwidth usage',
      icon: 'compress',
      enabled: true,
      category: 'network',
      impact: 'medium',
    },
    {
      id: 'background_sync',
      title: 'Background Sync',
      description: 'Sync data in background for seamless experience',
      icon: 'sync',
      enabled: false,
      category: 'network',
      impact: 'low',
    },
  ]);

  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(78);

  useEffect(() => {
    calculatePerformanceScore();
    monitorPerformance();
  }, []);

  const calculatePerformanceScore = () => {
    const goodMetrics = performanceMetrics.filter(m => m.status === 'good').length;
    const warningMetrics = performanceMetrics.filter(m => m.status === 'warning').length;
    const criticalMetrics = performanceMetrics.filter(m => m.status === 'critical').length;
    
    let score = (goodMetrics * 25) + (warningMetrics * 10) - (criticalMetrics * 30);
    score = Math.max(0, Math.min(100, score));
    setPerformanceScore(score);
  };

  const monitorPerformance = () => {
    setInterval(() => {
      // Simulate real-time performance monitoring
      updateMetrics();
    }, 5000);
  };

  const updateMetrics = () => {
    setPerformanceMetrics(prev => 
      prev.map(metric => {
        let newValue = metric.value;
        let newStatus = metric.status;
        
        // Simulate metric fluctuations
        if (metric.id === 'memory_usage') {
          newValue = Math.max(30, Math.min(90, metric.value + (Math.random() - 0.5) * 10));
          newStatus = newValue > 80 ? 'critical' : newValue > 60 ? 'warning' : 'good';
        } else if (metric.id === 'battery_usage') {
          newValue = Math.max(20, Math.min(100, metric.value + (Math.random() - 0.5) * 5));
          newStatus = newValue > 80 ? 'critical' : newValue > 50 ? 'warning' : 'good';
        }
        
        return { ...metric, value: newValue, status: newStatus };
      })
    );
  };

  const toggleFeature = (featureId: string) => {
    setOptimizationFeatures(prev => 
      prev.map(feature => 
        feature.id === featureId 
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );
  };

  const optimizeNow = () => {
    Alert.alert(
      'Optimize Performance',
      'This will clean cache, optimize memory, and improve app performance. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Optimize', 
          onPress: () => {
            performOptimization();
          }
        }
      ]
    );
  };

  const performOptimization = () => {
    // Simulate optimization process
    setShowOptimizationModal(true);
    
    setTimeout(() => {
      // Update metrics after optimization
      setPerformanceMetrics(prev => 
        prev.map(metric => ({
          ...metric,
          value: metric.id === 'cache_size' ? 50 : metric.value * 0.8,
          status: 'good'
        }))
      );
      
      setShowOptimizationModal(false);
      Alert.alert('Success', 'Performance optimized successfully!');
    }, 3000);
  };

  const clearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached data and may slow down the app initially. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          onPress: () => {
            setPerformanceMetrics(prev => 
              prev.map(metric => 
                metric.id === 'cache_size' 
                  ? { ...metric, value: 20, status: 'good' }
                  : metric
              )
            );
            Alert.alert('Success', 'Cache cleared successfully!');
          }
        }
      ]
    );
  };

  const getPerformanceLevel = () => {
    if (performanceScore >= 80) return { level: 'Excellent', color: '#4CAF50' };
    if (performanceScore >= 60) return { level: 'Good', color: '#8BC34A' };
    if (performanceScore >= 40) return { level: 'Fair', color: '#FF9800' };
    return { level: 'Poor', color: colors.danger };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'critical': return colors.danger;
      default: return colors.textTertiary;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return colors.danger;
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return colors.textTertiary;
    }
  };

  const performanceLevel = getPerformanceLevel();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Performance Score */}
        <GradientCard gradientColors={[performanceLevel.color, performanceLevel.color + '80']} padding={0}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreLabel}>Performance Score</Text>
              <Icon name="speed" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.scoreValue}>{performanceScore}%</Text>
            <Text style={styles.scoreLevel}>{performanceLevel.level}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${performanceScore}%`, backgroundColor: '#FFFFFF' }
                ]} 
              />
            </View>
            <Text style={styles.scoreDescription}>
              {performanceScore >= 60 ? 'App is performing well' : 'Optimization recommended'}
            </Text>
          </View>
        </GradientCard>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={optimizeNow}>
              <Icon name="auto-fix-high" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Optimize Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={clearCache}>
              <Icon name="delete-sweep" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Clear Cache</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="settings-suggest" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Advanced</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          
          {performanceMetrics.map(metric => (
            <Card key={metric.id} style={styles.metricCard}>
              <View style={styles.metricContent}>
                <View style={styles.metricInfo}>
                  <Icon name={metric.icon} size={24} color={getStatusColor(metric.status)} />
                  <Text style={styles.metricTitle}>{metric.title}</Text>
                </View>
                <View style={styles.metricValue}>
                  <Text style={[styles.metricNumber, { color: getStatusColor(metric.status) }]}>
                    {metric.value}
                  </Text>
                  <Text style={styles.metricUnit}>{metric.unit}</Text>
                </View>
              </View>
              <View style={styles.metricBar}>
                <View 
                  style={[
                    styles.metricFill, 
                    { 
                      width: `${metric.id === 'cache_size' ? Math.min(100, metric.value / 2) : metric.value}%`,
                      backgroundColor: getStatusColor(metric.status)
                    }
                  ]} 
                />
              </View>
            </Card>
          ))}
        </View>

        {/* Optimization Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Optimization Features</Text>
          
          {['caching', 'battery', 'memory', 'network'].map(category => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>
                {category === 'caching' ? 'Caching' : 
                 category === 'battery' ? 'Battery' : 
                 category === 'memory' ? 'Memory' : 'Network'}
              </Text>
              
              {optimizationFeatures
                .filter(feature => feature.category === category)
                .map(feature => (
                  <Card key={feature.id} style={styles.featureCard}>
                    <View style={styles.featureContent}>
                      <View style={styles.featureInfo}>
                        <View style={styles.featureIcon}>
                          <Icon name={feature.icon} size={24} color={colors.primary} />
                        </View>
                        <View style={styles.featureDetails}>
                          <Text style={styles.featureTitle}>{feature.title}</Text>
                          <Text style={styles.featureDescription}>{feature.description}</Text>
                          <View style={styles.impactBadge}>
                            <Text style={[styles.impactText, { color: getImpactColor(feature.impact) }]}>
                              {feature.impact.toUpperCase()} IMPACT
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Switch
                        value={feature.enabled}
                        onValueChange={() => toggleFeature(feature.id)}
                        trackColor={{ false: colors.border, true: colors.primary + '40' }}
                        thumbColor={feature.enabled ? colors.primary : colors.textTertiary}
                      />
                    </View>
                  </Card>
                ))}
            </View>
          ))}
        </View>

        {/* Performance Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Tips</Text>
          <Card style={styles.tipsCard}>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Icon name="lightbulb" size={20} color={colors.primary} />
                <Text style={styles.tipText}>Enable smart caching for faster app response</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="battery-saver" size={20} color="#FF9800" />
                <Text style={styles.tipText}>Use battery saver mode for longer usage</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="storage" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Clear cache regularly to free up space</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="network-wifi" size={20} color={colors.primary} />
                <Text style={styles.tipText}>Use offline mode to reduce data usage</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Optimization Modal */}
      <Modal
        visible={showOptimizationModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="auto-fix-high" size={48} color={colors.primary} />
            <Text style={styles.modalTitle}>Optimizing Performance...</Text>
            <Text style={styles.modalDescription}>
              Please wait while we optimize your app performance
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
  scoreCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  scoreLabel: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: typography.fontWeight.medium,
  },
  scoreValue: {
    fontSize: typography.fontSize.massive,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  scoreLevel: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.lg,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
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
    ...shadows.sm,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  metricCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  metricContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  metricValue: {
    alignItems: 'flex-end',
  },
  metricNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  metricUnit: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  metricBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: 3,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  featureCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  featureContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureDetails: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  impactBadge: {
    alignSelf: 'flex-start',
  },
  impactText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  tipsCard: {
    padding: spacing.lg,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
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

export default PerformanceOptimizerScreen;
