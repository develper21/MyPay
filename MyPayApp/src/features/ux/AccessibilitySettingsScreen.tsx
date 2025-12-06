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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

interface AccessibilityFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  category: 'visual' | 'hearing' | 'motor' | 'cognitive';
}

const AccessibilitySettingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<AccessibilityFeature[]>([
    {
      id: 'large_text',
      title: 'Large Text',
      description: 'Increase font size for better readability',
      icon: 'text-fields',
      enabled: false,
      category: 'visual',
    },
    {
      id: 'high_contrast',
      title: 'High Contrast',
      description: 'Enhanced color contrast for better visibility',
      icon: 'contrast',
      enabled: false,
      category: 'visual',
    },
    {
      id: 'screen_reader',
      title: 'Screen Reader Support',
      description: 'Optimized for screen readers like TalkBack and VoiceOver',
      icon: 'record-voice-over',
      enabled: true,
      category: 'visual',
    },
    {
      id: 'voice_commands',
      title: 'Voice Commands',
      description: 'Control the app using voice commands',
      icon: 'mic',
      enabled: false,
      category: 'motor',
    },
    {
      id: 'haptic_feedback',
      title: 'Haptic Feedback',
      description: 'Vibration feedback for better interaction',
      icon: 'vibration',
      enabled: true,
      category: 'motor',
    },
    {
      id: 'simple_mode',
      title: 'Simple Mode',
      description: 'Simplified interface with essential features only',
      icon: 'view-module',
      enabled: false,
      category: 'cognitive',
    },
    {
      id: 'audio_cues',
      title: 'Audio Cues',
      description: 'Sound alerts for important actions',
      icon: 'volume-up',
      enabled: false,
      category: 'hearing',
    },
    {
      id: 'auto_suggest',
      title: 'Auto-Suggest',
      description: 'Smart suggestions for faster transactions',
      icon: 'lightbulb',
      enabled: true,
      category: 'cognitive',
    },
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleFeature = (featureId: string) => {
    setAccessibilityFeatures(prev => 
      prev.map(feature => 
        feature.id === featureId 
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );

    // Show preview for visual changes
    const visualFeatures = ['large_text', 'high_contrast'];
    if (visualFeatures.includes(featureId)) {
      setShowPreview(true);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Accessibility Settings',
      'This will reset all accessibility settings to default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setAccessibilityFeatures(prev => 
              prev.map(feature => ({ ...feature, enabled: feature.id === 'screen_reader' || feature.id === 'haptic_feedback' || feature.id === 'auto_suggest' }))
            );
            Alert.alert('Success', 'Accessibility settings reset to defaults');
          }
        }
      ]
    );
  };

  const getAccessibilityScore = () => {
    const enabledFeatures = accessibilityFeatures.filter(f => f.enabled).length;
    const totalFeatures = accessibilityFeatures.length;
    return Math.round((enabledFeatures / totalFeatures) * 100);
  };

  const filteredFeatures = selectedCategory === 'all' 
    ? accessibilityFeatures 
    : accessibilityFeatures.filter(f => f.category === selectedCategory);

  const categories = [
    { id: 'all', title: 'All Features', icon: 'apps' },
    { id: 'visual', title: 'Visual', icon: 'visibility' },
    { id: 'hearing', title: 'Hearing', icon: 'hearing' },
    { id: 'motor', title: 'Motor', icon: 'pan-tool' },
    { id: 'cognitive', title: 'Cognitive', icon: 'psychology' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Accessibility Score */}
        <Card style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Icon name="accessibility" size={32} color={colors.primary} />
            <Text style={styles.scoreLabel}>Accessibility Score</Text>
          </View>
          <Text style={styles.scoreValue}>{getAccessibilityScore()}%</Text>
          <Text style={styles.scoreDescription}>
            {getAccessibilityScore() >= 70 ? 'Great accessibility setup' : 'Consider enabling more features'}
          </Text>
        </Card>

        {/* Quick Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Quick Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>Enable screen reader for voice guidance</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>Use high contrast for better visibility</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>Try voice commands for hands-free operation</Text>
            </View>
          </View>
        </Card>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipSelected
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Icon 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.id ? '#FFFFFF' : colors.primary} 
                />
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextSelected
                ]}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Accessibility Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility Features</Text>
          
          {filteredFeatures.map(feature => (
            <Card key={feature.id} style={styles.featureCard}>
              <View style={styles.featureContent}>
                <View style={styles.featureInfo}>
                  <View style={styles.featureIcon}>
                    <Icon name={feature.icon} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.featureDetails}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
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

        {/* Advanced Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Settings</Text>
          
          <Card style={styles.advancedCard}>
            <TouchableOpacity style={styles.advancedItem}>
              <Icon name="font-size" size={24} color={colors.primary} />
              <View style={styles.advancedInfo}>
                <Text style={styles.advancedTitle}>Font Size</Text>
                <Text style={styles.advancedDescription}>Adjust text size across the app</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.advancedItem}>
              <Icon name="color-lens" size={24} color={colors.primary} />
              <View style={styles.advancedInfo}>
                <Text style={styles.advancedTitle}>Color Scheme</Text>
                <Text style={styles.advancedDescription}>Choose color theme and contrast</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.advancedItem}>
              <Icon name="speed" size={24} color={colors.primary} />
              <View style={styles.advancedInfo}>
                <Text style={styles.advancedTitle}>Animation Speed</Text>
                <Text style={styles.advancedDescription}>Control animation and transition speed</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Reset Button */}
        <View style={styles.section}>
          <Button
            title="Reset to Defaults"
            variant="secondary"
            onPress={resetToDefaults}
            style={styles.resetButton}
          />
        </View>
      </ScrollView>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle}>Preview Changes</Text>
            <Text style={styles.previewDescription}>
              Accessibility changes will take effect immediately. You can adjust them anytime.
            </Text>
            <Button
              title="Got it"
              onPress={() => setShowPreview(false)}
              style={styles.previewButton}
            />
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
    margin: spacing.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  scoreValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  scoreDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  tipsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
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
  categorySection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
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
  },
  advancedCard: {
    padding: 0,
  },
  advancedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  advancedInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  advancedTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  advancedDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  resetButton: {
    marginBottom: spacing.xl,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    margin: spacing.lg,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  previewDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  previewButton: {
    width: '100%',
  },
});

export default AccessibilitySettingsScreen;
