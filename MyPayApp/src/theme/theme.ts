export const colors = {
  // Primary brand colors (inspired by modern fintech apps)
  primary: '#6366F1',        // Indigo - modern and trustworthy
  primaryDark: '#4F46E5',     // Darker indigo
  primaryLight: '#818CF8',    // Lighter indigo
  
  // Secondary colors
  secondary: '#10B981',       // Emerald - for success/positive actions
  accent: '#F59E0B',          // Amber - for highlights
  danger: '#EF4444',          // Red - for errors/danger
  
  // Neutral colors (modern grayscale)
  background: '#F9FAFB',      // Light gray background
  surface: '#FFFFFF',         // White for cards
  surfaceVariant: '#F3F4F6',  // Light gray for variant surfaces
  
  // Text colors
  text: '#111827',            // Primary text
  textSecondary: '#6B7280',    // Secondary text
  textTertiary: '#9CA3AF',    // Tertiary text
  textOnPrimary: '#FFFFFF',   // Text on primary color
  
  // Border and divider colors
  border: '#E5E7EB',          // Light borders
  divider: '#F3F4F6',         // Dividers
  
  // Special colors
  shimmer: '#E5E7EB',         // For loading effects
  overlay: 'rgba(0, 0, 0, 0.5)', // For overlays
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
    massive: 36,
  },
  
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const gradients = {
  primary: ['#6366F1', '#8B5CF6'],
  success: ['#10B981', '#34D399'],
  warning: ['#F59E0B', '#FCD34D'],
  danger: ['#EF4444', '#F87171'],
  sunset: ['#F97316', '#EF4444'],
  ocean: ['#06B6D4', '#3B82F6'],
};

export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const breakpoints = {
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Common styles that can be reused
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  
  header: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  
  subheader: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  
  caption: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
};

export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  gradients,
  animations,
  breakpoints,
  commonStyles,
};
