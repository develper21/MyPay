import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.sm,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 36 },
      medium: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 48 },
      large: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, minHeight: 56 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? colors.border : colors.primary,
      },
      secondary: {
        backgroundColor: disabled ? colors.surfaceVariant : colors.surface,
        borderWidth: 1,
        borderColor: disabled ? colors.border : colors.primary,
      },
      danger: {
        backgroundColor: disabled ? '#FEE2E2' : colors.danger,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: typography.fontWeight.semibold,
    };

    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: typography.fontSize.sm },
      medium: { fontSize: typography.fontSize.base },
      large: { fontSize: typography.fontSize.lg },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: colors.textOnPrimary },
      secondary: { color: disabled ? colors.textTertiary : colors.primary },
      danger: { color: colors.textOnPrimary },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.primary : colors.textOnPrimary}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Additional styles if needed
});

export default Button;
