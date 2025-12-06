import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientCard from '../../components/ui/GradientCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  category: 'transaction' | 'user' | 'performance' | 'security';
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const AdvancedAnalyticsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetric[]>([
    {
      id: 'daily_transactions',
      title: 'Daily Transactions',
      value: '2,341',
      change: 12.5,
      trend: 'up',
      icon: 'trending-up',
      category: 'transaction',
    },
    {
      id: 'active_users',
      title: 'Active Users',
      value: '8,456',
      change: 8.3,
      trend: 'up',
      icon: 'people',
      category: 'user',
    },
    {
      id: 'app_performance',
      title: 'App Performance',
      value: '94.2%',
      change: 2.1,
      trend: 'up',
      icon: 'speed',
      category: 'performance',
    },
    {
      id: 'security_score',
      title: 'Security Score',
      value: '87%',
      change: -1.2,
      trend: 'down',
      icon: 'security',
      category: 'security',
    },
  ]);

  const [chartData, setChartData] = useState<ChartData[]>([
    { label: 'Mon', value: 120, color: colors.primary },
    { label: 'Tue', value: 150, color: colors.primary },
    { label: 'Wed', value: 180, color: colors.primary },
    { label: 'Thu', value: 140, color: colors.primary },
    { label: 'Fri', value: 200, color: colors.primary },
    { label: 'Sat', value: 170, color: colors.primary },
    { label: 'Sun', value: 130, color: colors.primary },
  ]);

  const [showDetailsModal, setShowDetailsModal] = useState<AnalyticsMetric | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#4CAF50';
      case 'down': return colors.danger;
      case 'stable': return '#FF9800';
      default: return colors.textSecondary;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'trending-flat';
      default: return 'trending-flat';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transaction': return colors.primary;
      case 'user': return '#8BC34A';
      case 'performance': return '#FF9800';
      case 'security': return colors.danger;
      default: return colors.textSecondary;
    }
  };

  const renderChart = () => {
    const maxValue = Math.max(...chartData.map(d => d.value));
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Transaction Volume</Text>
          <View style={styles.chartPeriod}>
            {['day', 'week', 'month'].map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodChip,
                  selectedPeriod === period && styles.periodChipSelected
                ]}
                onPress={() => setSelectedPeriod(period as any)}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextSelected
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.chartBars}>
          {chartData.map((item, index) => (
            <View key={index} style={styles.chartBar}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: (item.value / maxValue) * 150,
                      backgroundColor: item.color 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barLabel}>{item.label}</Text>
              <Text style={styles.barValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <GradientCard gradientColors={[colors.primary, colors.primary + '80']} padding={0}>
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>Advanced Analytics</Text>
            <Text style={styles.headerSubtitle}>Real-time insights and metrics</Text>
            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>98.2%</Text>
                <Text style={styles.statLabel}>Uptime</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>1.2s</Text>
                <Text style={styles.statLabel}>Avg Response</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4.8★</Text>
                <Text style={styles.statLabel}>User Rating</Text>
              </View>
            </View>
          </View>
        </GradientCard>

        {/* Chart */}
        <View style={styles.section}>
          <Card style={styles.chartCard}>
            {renderChart()}
          </Card>
        </View>

        {/* Metrics Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          
          <View style={styles.metricsGrid}>
            {analyticsMetrics.map(metric => (
              <TouchableOpacity 
                key={metric.id} 
                style={styles.metricCard}
                onPress={() => setShowDetailsModal(metric)}
              >
                <View style={styles.metricHeader}>
                  <Icon name={metric.icon} size={24} color={getCategoryColor(metric.category)} />
                  <View style={styles.metricTrend}>
                    <Icon 
                      name={getTrendIcon(metric.trend)} 
                      size={16} 
                      color={getTrendColor(metric.trend)} 
                    />
                    <Text style={[styles.trendText, { color: getTrendColor(metric.trend) }]}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricTitle}>{metric.title}</Text>
                
                <View style={styles.metricFooter}>
                  <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor(metric.category) }]} />
                  <Text style={styles.categoryText}>{metric.category}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <Card style={styles.insightsCard}>
            <View style={styles.insightItem}>
              <Icon name="lightbulb" size={20} color={colors.primary} />
              <Text style={styles.insightTitle}>Peak Usage Time</Text>
              <Text style={styles.insightDescription}>
                Highest transaction volume between 6-9 PM. Consider server scaling.
              </Text>
            </View>
            
            <View style={styles.insightItem}>
              <Icon name="warning" size={20} color="#FF9800" />
              <Text style={styles.insightTitle}>Security Alert</Text>
              <Text style={styles.insightDescription}>
                Unusual login patterns detected from 3 regions. Review needed.
              </Text>
            </View>
            
            <View style={styles.insightItem}>
              <Icon name="trending-up" size={20} color="#4CAF50" />
              <Text style={styles.insightTitle}>Growth Opportunity</Text>
              <Text style={styles.insightDescription}>
                South India showing 45% growth. Focus marketing efforts here.
              </Text>
            </View>
          </Card>
        </View>

        {/* Performance Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Indicators</Text>
          
          <View style={styles.performanceList}>
            <View style={styles.performanceItem}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceTitle}>API Response Time</Text>
                <Text style={styles.performanceValue}>245ms</Text>
              </View>
              <View style={styles.performanceBar}>
                <View style={[styles.performanceFill, { width: '75%', backgroundColor: '#4CAF50' }]} />
              </View>
            </View>
            
            <View style={styles.performanceItem}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceTitle}>Memory Usage</Text>
                <Text style={styles.performanceValue}>68%</Text>
              </View>
              <View style={styles.performanceBar}>
                <View style={[styles.performanceFill, { width: '68%', backgroundColor: '#FF9800' }]} />
              </View>
            </View>
            
            <View style={styles.performanceItem}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceTitle}>Error Rate</Text>
                <Text style={styles.performanceValue}>0.12%</Text>
              </View>
              <View style={styles.performanceBar}>
                <View style={[styles.performanceFill, { width: '2%', backgroundColor: '#4CAF50' }]} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {showDetailsModal && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{showDetailsModal.title}</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(null)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalMetric}>
                <Text style={styles.modalMetricValue}>{showDetailsModal.value}</Text>
                <View style={styles.modalTrend}>
                  <Icon 
                    name={getTrendIcon(showDetailsModal.trend)} 
                    size={20} 
                    color={getTrendColor(showDetailsModal.trend)} 
                  />
                  <Text style={[styles.modalTrendText, { color: getTrendColor(showDetailsModal.trend) }]}>
                    {showDetailsModal.change > 0 ? '+' : ''}{showDetailsModal.change}% from last period
                  </Text>
                </View>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Historical Data</Text>
                <Text style={styles.modalSectionText}>
                  This metric has shown consistent {showDetailsModal.trend}ward trend over the past 30 days.
                </Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Recommendations</Text>
                <Text style={styles.modalSectionText}>
                  {showDetailsModal.trend === 'up' 
                    ? 'Excellent performance! Continue current strategies.'
                    : 'Review recent changes and consider optimization.'}
                </Text>
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
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.lg,
  },
  headerStats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  statLabel: {
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
  chartCard: {
    padding: spacing.lg,
  },
  chartContainer: {
    gap: spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  chartPeriod: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  periodChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  periodTextSelected: {
    color: '#FFFFFF',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderRadius: 10,
  },
  barLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  barValue: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    width: (screenWidth - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  metricValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  metricTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  metricFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  insightsCard: {
    padding: spacing.lg,
  },
  insightItem: {
    marginBottom: spacing.lg,
  },
  insightTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginLeft: spacing.lg + spacing.sm,
  },
  insightDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginLeft: spacing.lg + spacing.sm,
  },
  performanceList: {
    gap: spacing.md,
  },
  performanceItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  performanceTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  performanceValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  performanceBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  performanceFill: {
    height: '100%',
    borderRadius: 3,
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
  modalMetric: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalMetricValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  modalTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTrendText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modalSectionText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default AdvancedAnalyticsScreen;
