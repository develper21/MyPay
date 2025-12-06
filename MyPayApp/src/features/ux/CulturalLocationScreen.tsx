import React, { useState } from 'react';
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

interface CulturalFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  category: 'language' | 'currency' | 'payment' | 'festival';
  importance: 'high' | 'medium' | 'low';
}

const CulturalLocalizationScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [culturalFeatures, setCulturalFeatures] = useState<CulturalFeature[]>([
    {
      id: 'hindi_support',
      title: 'Hindi Language Support',
      description: 'Complete app interface in Hindi for better accessibility',
      icon: 'translate',
      enabled: true,
      category: 'language',
      importance: 'high',
    },
    {
      id: 'regional_languages',
      title: 'Regional Languages',
      description: 'Support for Tamil, Telugu, Bengali, Marathi, Gujarati',
      icon: 'language',
      enabled: false,
      category: 'language',
      importance: 'medium',
    },
    {
      id: 'inr_formatting',
      title: 'Indian Currency Formatting',
      description: 'Proper INR formatting with lakhs and crores',
      icon: 'currency-rupee',
      enabled: true,
      category: 'currency',
      importance: 'high',
    },
    {
      id: 'upi_integration',
      title: 'UPI Payment Methods',
      description: 'Support for all major UPI apps and QR codes',
      icon: 'qr-code-scanner',
      enabled: true,
      category: 'payment',
      importance: 'high',
    },
    {
      id: 'festival_offers',
      title: 'Festival Special Offers',
      description: 'Diwali, Eid, Christmas, and other festival promotions',
      icon: 'celebration',
      enabled: true,
      category: 'festival',
      importance: 'medium',
    },
  ]);

  const [localizationScore, setLocalizationScore] = useState(75);

  const toggleFeature = (featureId: string) => {
    setCulturalFeatures(prev => 
      prev.map(feature => 
        feature.id === featureId 
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );
    calculateLocalizationScore();
  };

  const calculateLocalizationScore = () => {
    const enabledFeatures = culturalFeatures.filter(f => f.enabled).length;
    const totalFeatures = culturalFeatures.length;
    const score = Math.round((enabledFeatures / totalFeatures) * 100);
    setLocalizationScore(score);
  };

  const getLocalizationLevel = () => {
    if (localizationScore >= 80) return { level: 'Fully Localized', color: '#4CAF50' };
    if (localizationScore >= 60) return { level: 'Well Localized', color: '#8BC34A' };
    if (localizationScore >= 40) return { level: 'Partially Localized', color: '#FF9800' };
    return { level: 'Basic Localization', color: colors.danger };
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return colors.danger;
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return colors.textTertiary;
    }
  };

  const localizationLevel = getLocalizationLevel();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Localization Score */}
        <GradientCard gradientColors={[localizationLevel.color, localizationLevel.color + '80']} padding={0}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreLabel}>Localization Score</Text>
              <Icon name="language" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.scoreValue}>{localizationScore}%</Text>
            <Text style={styles.scoreLevel}>{localizationLevel.level}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${localizationScore}%`, backgroundColor: '#FFFFFF' }
                ]} 
              />
            </View>
            <Text style={styles.scoreDescription}>
              Optimized for Indian users
            </Text>
          </View>
        </GradientCard>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="translate" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Change Language</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="currency-rupee" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Currency Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="public" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Regional Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cultural Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cultural Features</Text>
          
          {['language', 'currency', 'payment', 'festival'].map(category => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>
                {category === 'language' ? 'Language Support' : 
                 category === 'currency' ? 'Currency & Formatting' : 
                 category === 'payment' ? 'Payment Methods' : 'Festival & Events'}
              </Text>
              
              {culturalFeatures
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
                          <View style={styles.importanceBadge}>
                            <Text style={[styles.importanceText, { color: getImportanceColor(feature.importance) }]}>
                              {feature.importance.toUpperCase()} PRIORITY
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

        {/* Regional Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regional Preferences</Text>
          <Card style={styles.regionCard}>
            <View style={styles.regionHeader}>
              <Icon name="location-on" size={24} color={colors.primary} />
              <Text style={styles.regionTitle}>Popular Regions</Text>
            </View>
            <View style={styles.regionList}>
              <View style={styles.regionItem}>
                <Text style={styles.regionName}>North India</Text>
                <Text style={styles.regionDetails}>Hindi, INR, UPI</Text>
              </View>
              <View style={styles.regionItem}>
                <Text style={styles.regionName}>South India</Text>
                <Text style={styles.regionDetails}>Tamil/Telugu, INR, UPI</Text>
              </View>
              <View style={styles.regionItem}>
                <Text style={styles.regionName}>East India</Text>
                <Text style={styles.regionDetails}>Bengali, INR, UPI</Text>
              </View>
              <View style={styles.regionItem}>
                <Text style={styles.regionName}>West India</Text>
                <Text style={styles.regionDetails}>Gujarati, INR, UPI</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Cultural Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cultural Tips</Text>
          <Card style={styles.tipsCard}>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Icon name="lightbulb" size={20} color={colors.primary} />
                <Text style={styles.tipText}>Use Hindi for better rural accessibility</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="celebration" size={20} color={colors.primary} />
                <Text style={styles.tipText}>Festival offers increase user engagement</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="currency-rupee" size={20} color={colors.primary} />
                <Text style={styles.tipText}>INR formatting builds user trust</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="qr-code-scanner" size={20} color={colors.primary} />
                <Text style={styles.tipText}>UPI is preferred payment method in India</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
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
  importanceBadge: {
    alignSelf: 'flex-start',
  },
  importanceText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  regionCard: {
    padding: spacing.lg,
  },
  regionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  regionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  regionList: {
    gap: spacing.md,
  },
  regionItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  regionName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  regionDetails: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
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
});

export default CulturalLocalizationScreen;