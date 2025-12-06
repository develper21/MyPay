import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GradientCard from '../../components/ui/GradientCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/theme';

interface AssistantMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: string;
  category: 'transaction' | 'security' | 'general' | 'help';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

const SmartAssistantScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: '1',
      type: 'assistant',
      message: 'Hello! I\'m your MyPay assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
      category: 'general',
    },
    {
      id: '2',
      type: 'assistant',
      message: 'I notice you haven\'t set up biometric authentication yet. Would you like me to guide you through it?',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      category: 'security',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1));

  const quickActions: QuickAction[] = [
    {
      id: 'check_balance',
      title: 'Check Balance',
      description: 'View your account balance',
      icon: 'account-balance-wallet',
      action: () => sendQuickMessage('What is my current balance?'),
    },
    {
      id: 'recent_transactions',
      title: 'Recent Transactions',
      description: 'Show last 5 transactions',
      icon: 'history',
      action: () => sendQuickMessage('Show me my recent transactions'),
    },
    {
      id: 'pay_bills',
      title: 'Pay Bills',
      description: 'Quick bill payment',
      icon: 'receipt',
      action: () => sendQuickMessage('I want to pay my bills'),
    },
    {
      id: 'security_help',
      title: 'Security Help',
      description: 'Security settings and tips',
      icon: 'security',
      action: () => sendQuickMessage('Help me secure my account'),
    },
  ];

  const suggestions = [
    'How do I enable biometric authentication?',
    'What are the transaction limits?',
    'Show me my spending summary',
    'How to report fraud?',
    'Set up auto-pay for bills',
    'Check my credit score',
  ];

  useEffect(() => {
    animateSuggestions();
  }, []);

  const animateSuggestions = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const sendQuickMessage = (message: string) => {
    setInputText(message);
    sendMessage();
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputText,
      timestamp: new Date().toISOString(),
      category: 'general',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setShowSuggestions(false);

    // Simulate AI response
    setTimeout(() => {
      const assistantResponse = generateAIResponse(inputText);
      setMessages(prev => [...prev, assistantResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): AssistantMessage => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('balance')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        message: 'Your current account balance is ₹45,230.50. This includes your main wallet balance of ₹42,000 and trip wallet balance of ₹3,230.50.',
        timestamp: new Date().toISOString(),
        category: 'transaction',
      };
    }
    
    if (lowerMessage.includes('transaction')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        message: 'Here are your recent transactions:\n1. ₹500 - Swiggy - Today 2:30 PM\n2. ₹1,200 - Amazon - Yesterday 8:15 PM\n3. ₹250 - Uber - Dec 4, 6:45 PM\n4. ₹2,000 - Electricity Bill - Dec 3, 10:00 AM\n5. ₹150 - Phone Recharge - Dec 2, 5:30 PM',
        timestamp: new Date().toISOString(),
        category: 'transaction',
      };
    }
    
    if (lowerMessage.includes('biometric') || lowerMessage.includes('fingerprint')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        message: 'To enable biometric authentication:\n1. Go to Settings > Security\n2. Toggle on "Biometric Authentication"\n3. Verify with your PIN\n4. Scan your fingerprint when prompted\n\nThis provides extra security and faster login!',
        timestamp: new Date().toISOString(),
        category: 'security',
      };
    }
    
    if (lowerMessage.includes('fraud') || lowerMessage.includes('security')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        message: 'For fraud protection:\n• Enable transaction alerts\n• Set up biometric authentication\n• Review suspicious transactions\n• Use strong PIN\n• Never share OTP\n\nIf you suspect fraud, immediately call our 24/7 helpline at 1800-123-4567.',
        timestamp: new Date().toISOString(),
        category: 'security',
      };
    }
    
    return {
      id: Date.now().toString(),
      type: 'assistant',
      message: 'I understand you need help with "' + userMessage + '". Let me connect you with the right information or transfer you to a human agent if needed. Could you provide more details about your query?',
      timestamp: new Date().toISOString(),
      category: 'help',
    };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transaction': return colors.primary;
      case 'security': return colors.danger;
      case 'general': return '#8BC34A';
      case 'help': return '#FF9800';
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <GradientCard gradientColors={[colors.primary, colors.primary + '80']} padding={0}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Icon name="smart-toy" size={32} color="#FFFFFF" />
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>MyPay Assistant</Text>
                <Text style={styles.headerSubtitle}>AI-powered help 24/7</Text>
              </View>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.statusText}>Online</Text>
              </View>
            </View>
            
            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2.3s</Text>
                <Text style={styles.statLabel}>Avg Response</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>98%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>24/7</Text>
                <Text style={styles.statLabel}>Available</Text>
              </View>
            </View>
          </View>
        </GradientCard>
      </View>

      {/* Quick Actions */}
      {showSuggestions && (
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickActions}>
              {quickActions.map(action => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionButton}
                  onPress={action.action}
                >
                  <Icon name={action.icon} size={24} color={colors.primary} />
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionDescription}>{action.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map(message => (
          <View key={message.id} style={styles.messageContainer}>
            <View style={[
              styles.messageBubble,
              message.type === 'user' ? styles.userMessage : styles.assistantMessage
            ]}>
              <Text style={[
                styles.messageText,
                message.type === 'user' ? styles.userMessageText : styles.assistantMessageText
              ]}>
                {message.message}
              </Text>
              <View style={styles.messageFooter}>
                <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(message.category) }]} />
              </View>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={styles.messageContainer}>
            <View style={[
              styles.messageBubble,
              styles.assistantMessage
            ]}>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, { animationDelay: '0s' }]} />
                <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
                <View style={[styles.typingDot, { animationDelay: '0.4s' }]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggestions */}
      {showSuggestions && (
        <Animated.View style={[styles.suggestionsContainer, { opacity: fadeAnim }]}>
          <Text style={styles.suggestionsTitle}>Try asking:</Text>
          <View style={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => sendQuickMessage(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={20} color={inputText.trim() ? '#FFFFFF' : colors.textTertiary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.voiceButton}>
          <Icon name="mic" size={24} color={colors.primary} />
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
  header: {
    paddingTop: spacing.xl,
  },
  headerContent: {
    padding: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  statusIndicator: {
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
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: typography.fontWeight.semibold,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  quickActionsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  quickActionDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  messageContainer: {
    marginBottom: spacing.md,
  },
  messageBubble: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: colors.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  messageTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginRight: spacing.sm,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
  },
  suggestionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  suggestionsTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.sm,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: colors.border,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default SmartAssistantScreen;
