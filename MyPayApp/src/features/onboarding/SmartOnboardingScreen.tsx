import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'info' | 'action' | 'tutorial';
  completed: boolean;
}

const SmartOnboardingScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([
    {
      id: 'welcome',
      title: 'Welcome to MyPay',
      description: 'Your secure and simple digital payment companion',
      icon: 'emoji-emotions',
      type: 'info',
      completed: false,
    },
    {
      id: 'security',
      title: 'Security First',
      description: 'Learn how to keep your account safe',
      icon: 'security',
      type: 'tutorial',
      completed: false,
    },
    {
      id: 'first_payment',
      title: 'Make Your First Payment',
      description: 'Send money safely with our protection features',
      icon: 'send',
      type: 'action',
      completed: false,
    },
    {
      id: 'trip_wallet',
      title: 'Trip Wallets',
      description: 'Create dedicated wallets for your travel expenses',
      icon: 'flight-takeoff',
      type: 'tutorial',
      completed: false,
    },
    {
      id: 'dispute',
      title: 'Dispute Resolution',
      description: 'Know what to do if something goes wrong',
      icon: 'gavel',
      type: 'info',
      completed: false,
    },
  ]);

  const progressPercentage = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleNextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      // Mark current step as completed
      const updatedSteps = [...onboardingSteps];
      updatedSteps[currentStep].completed = true;
      setOnboardingSteps(updatedSteps);
      
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding completed
      Alert.alert(
        'Congratulations!',
        'You\'ve completed the onboarding. You\'re now ready to use MyPay safely!',
        [{ text: 'Get Started', onPress: () => console.log('Navigate to home') }]
      );
    }
  };

  const handleSkipStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleUserLevelSelect = (level: 'beginner' | 'intermediate' | 'advanced') => {
    setUserLevel(level);
    
    // Customize onboarding based on user level
    if (level === 'advanced') {
      // Skip basic steps for advanced users
      setCurrentStep(2); // Jump to first payment
    } else if (level === 'intermediate') {
      setCurrentStep(1); // Start from security
    }
  };

  const renderStepContent = () => {
    const step = onboardingSteps[currentStep];
    
    switch (step.id) {
      case 'welcome':
        return (
          <View style={styles.stepContent}>
            <Icon name={step.icon} size={80} color={colors.primary} />
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            
            <View style={styles.levelSelection}>
              <Text style={styles.levelTitle}>How familiar are you with digital payments?</Text>
              <TouchableOpacity 
                style={[
                  styles.levelOption,
                  userLevel === 'beginner' && styles.levelOptionSelected
                ]}
                onPress={() => handleUserLevelSelect('beginner')}
              >
                <Icon name="school" size={24} color={userLevel === 'beginner' ? colors.primary : colors.textSecondary} />
                <Text style={[
                  styles.levelText,
                  userLevel === 'beginner' && styles.levelTextSelected
                ]}>
                  Beginner
                </Text>
                <Text style={styles.levelSubtext}>New to digital payments</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.levelOption,
                  userLevel === 'intermediate' && styles.levelOptionSelected
                ]}
                onPress={() => handleUserLevelSelect('intermediate')}
              >
                <Icon name="trending-up" size={24} color={userLevel === 'intermediate' ? colors.primary : colors.textSecondary} />
                <Text style={[
                  styles.levelText,
                  userLevel === 'intermediate' && styles.levelTextSelected
                ]}>
                  Intermediate
                </Text>
                <Text style={styles.levelSubtext}>Use digital payments regularly</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.levelOption,
                  userLevel === 'advanced' && styles.levelOptionSelected
                ]}
                onPress={() => handleUserLevelSelect('advanced')}
              >
                <Icon name="stars" size={24} color={userLevel === 'advanced' ? colors.primary : colors.textSecondary} />
                <Text style={[
                  styles.levelText,
                  userLevel === 'advanced' && styles.levelTextSelected
                ]}>
                  Advanced
                </Text>
                <Text style={styles.levelSubtext}>Very experienced with payments</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'security':
        return (
          <View style={styles.stepContent}>
            <Icon name={step.icon} size={80} color={colors.primary} />
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            
            <View style={styles.securityTips}>
              <Text style={styles.tipsTitle}>Security Best Practices:</Text>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Never share your OTP with anyone</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Always verify recipient details</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Use strong, unique passwords</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Enable biometric authentication</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Check transaction history regularly</Text>
              </View>
            </View>
          </View>
        );

      case 'first_payment':
        return (
          <View style={styles.stepContent}>
            <Icon name={step.icon} size={80} color={colors.primary} />
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            
            <View style={styles.paymentDemo}>
              <Text style={styles.demoTitle}>How to Make a Payment:</Text>
              
              <View style={styles.demoStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.demoStepText}>Enter recipient details (UPI ID or mobile)</Text>
              </View>
              
              <View style={styles.demoStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.demoStepText}>Enter the amount and description</Text>
              </View>
              
              <View style={styles.demoStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.demoStepText}>Review safety checks and confirm</Text>
              </View>
              
              <View style={styles.safetyNote}>
                <Icon name="shield" size={20} color={colors.primary} />
                <Text style={styles.safetyNoteText}>
                  MyPay automatically checks for fraud and alerts you of any risks
                </Text>
              </View>
            </View>
          </View>
        );

      case 'trip_wallet':
        return (
          <View style={styles.stepContent}>
            <Icon name={step.icon} size={80} color={colors.primary} />
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            
            <View style={styles.tripWalletInfo}>
              <Text style={styles.infoTitle}>Why Use Trip Wallets?</Text>
              <View style={styles.benefitItem}>
                <Icon name="account-balance-wallet" size={20} color={colors.primary} />
                <Text style={styles.benefitText}>Separate travel budget from main account</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="savings" size={20} color={colors.primary} />
                <Text style={styles.benefitText}>Save money specifically for trips</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="security" size={20} color={colors.primary} />
                <Text style={styles.benefitText}>Secure spending during travel</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="analytics" size={20} color={colors.primary} />
                <Text style={styles.benefitText}>Track travel expenses easily</Text>
              </View>
            </View>
          </View>
        );

      case 'dispute':
        return (
          <View style={styles.stepContent}>
            <Icon name={step.icon} size={80} color={colors.primary} />
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            
            <View style={styles.disputeInfo}>
              <Text style={styles.infoTitle}>If Something Goes Wrong:</Text>
              <View style={styles.disputeStep}>
                <Icon name="error-outline" size={20} color={colors.danger} />
                <Text style={styles.disputeStepText}>Immediately report unauthorized transactions</Text>
              </View>
              <View style={styles.disputeStep}>
                <Icon name="support-agent" size={20} color={colors.primary} />
                <Text style={styles.disputeStepText}>Contact support through the app</Text>
              </View>
              <View style={styles.disputeStep}>
                <Icon name="description" size={20} color={colors.primary} />
                <Text style={styles.disputeStepText}>File a dispute with all details</Text>
              </View>
              <View style={styles.disputeStep}>
                <Icon name="schedule" size={20} color={colors.primary} />
                <Text style={styles.disputeStepText}>Track dispute status in real-time</Text>
              </View>
              
              <View style={styles.supportNote}>
                <Icon name="phone" size={20} color="#4CAF50" />
                <Text style={styles.supportNoteText}>
                  24/7 customer support available for all users
                </Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {onboardingSteps.length}
        </Text>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {currentStep > 0 && (
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkipStep}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNextStep}
        >
          <Text style={styles.nextText}>
            {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Icon name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  stepContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  stepTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  stepDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  levelSelection: {
    width: '100%',
    gap: spacing.md,
  },
  levelTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  levelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  levelOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  levelText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginLeft: spacing.md,
  },
  levelTextSelected: {
    color: colors.primary,
  },
  levelSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  securityTips: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  tipsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  paymentDemo: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  demoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  demoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  demoStepText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  safetyNoteText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  tripWalletInfo: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  infoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  benefitText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  disputeInfo: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  disputeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  disputeStepText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  supportNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF5020',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  supportNoteText: {
    fontSize: typography.fontSize.sm,
    color: '#4CAF50',
    marginLeft: spacing.sm,
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  skipButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  nextText: {
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.semibold,
    marginRight: spacing.sm,
  },
});

export default SmartOnboardingScreen;
