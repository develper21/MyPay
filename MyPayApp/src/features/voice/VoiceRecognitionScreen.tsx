import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  confidence: number;
  enabled: boolean;
}

interface VoiceSession {
  id: string;
  command: string;
  timestamp: string;
  success: boolean;
  confidence: number;
}

const VoiceRecognitionScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([
    {
      id: '1',
      command: 'Send money to John',
      action: 'payment',
      confidence: 95,
      enabled: true,
    },
    {
      id: '2',
      command: 'Check my balance',
      action: 'balance',
      confidence: 98,
      enabled: true,
    },
    {
      id: '3',
      command: 'Pay electricity bill',
      action: 'bill_payment',
      confidence: 92,
      enabled: false,
    },
  ]);

  const [recentSessions, setRecentSessions] = useState<VoiceSession[]>([
    {
      id: '1',
      command: 'Send money to John',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      success: true,
      confidence: 95,
    },
    {
      id: '2',
      command: 'Check balance',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      success: true,
      confidence: 98,
    },
  ]);

  const [isListening, setIsListening] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  const startListening = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      Alert.alert('Voice Command', 'Command recognized: "Check my balance"');
    }, 3000);
  };

  const toggleCommand = (commandId: string) => {
    setVoiceCommands(prev => 
      prev.map(cmd => 
        cmd.id === commandId 
          ? { ...cmd, enabled: !cmd.enabled }
          : cmd
      )
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <GradientCard gradientColors={[colors.primary, colors.primary + '80']} padding={0}>
          <View style={styles.headerCard}>
            <Icon name="mic" size={48} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Voice Recognition</Text>
            <Text style={styles.headerSubtitle}>Control MyPay with your voice</Text>
          </View>
        </GradientCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Commands</Text>
          
          {voiceCommands.map(command => (
            <Card key={command.id} style={styles.commandCard}>
              <View style={styles.commandHeader}>
                <View style={styles.commandInfo}>
                  <Icon name="record-voice-over" size={24} color={colors.primary} />
                  <View style={styles.commandDetails}>
                    <Text style={styles.commandText}>{command.command}</Text>
                    <Text style={styles.actionText}>Action: {command.action}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => toggleCommand(command.id)}>
                  <Icon 
                    name={command.enabled ? 'check-circle' : 'radio-button-unchecked'}
                    size={24}
                    color={command.enabled ? '#4CAF50' : colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.confidenceBar}>
                <Text style={styles.confidenceText}>Confidence: {command.confidence}%</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${command.confidence}%` }]} />
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.listenButton} onPress={startListening}>
            <Icon 
              name={isListening ? "stop" : "mic"} 
              size={32} 
              color={colors.primary} 
            />
            <Text style={styles.listenText}>
              {isListening ? 'Listening...' : 'Tap to Speak'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          
          {recentSessions.map(session => (
            <Card key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionInfo}>
                  <Icon name="history" size={20} color={session.success ? '#4CAF50' : colors.danger} />
                  <View style={styles.sessionDetails}>
                    <Text style={styles.sessionCommand}>{session.command}</Text>
                    <Text style={styles.sessionTime}>{formatTime(session.timestamp)}</Text>
                  </View>
                </View>
                <Text style={[session.success ? styles.successText : styles.failText]}>
                  {session.success ? 'Success' : 'Failed'}
                </Text>
              </View>
            </Card>
          ))}
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
  commandCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  commandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  commandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commandDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  commandText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  confidenceBar: {
    marginTop: spacing.sm,
  },
  confidenceText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  listenText: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.md,
  },
  sessionCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  sessionCommand: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sessionTime: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
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
});

export default VoiceRecognitionScreen;
