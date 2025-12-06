import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows, spacing } from '../../theme/theme';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  gradientColors?: string[];
  padding?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const GradientCard: React.FC<GradientCardProps> = ({
  children,
  style,
  onPress,
  gradientColors = ['#6366F1', '#8B5CF6'],
  padding = spacing.lg,
}) => {
  const cardStyle = [
    styles.card,
    {
      borderRadius: borderRadius.xl,
      padding,
      width: style?.width || screenWidth - spacing.lg * 2,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={gradientColors as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {children}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      <LinearGradient
        colors={gradientColors as unknown as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...shadows.lg,
    marginVertical: spacing.sm,
    alignSelf: 'center',
  },
  gradient: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
});

export default GradientCard;