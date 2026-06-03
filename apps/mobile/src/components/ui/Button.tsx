import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../theme';
import { haptics } from '../../utils/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  ...props
}) => {
  const styles = useStyles();
  const colors = useThemeColors();
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.base,
      ...styles[`size_${size}`],
      ...(fullWidth && styles.fullWidth),
    };

    // Variant styles
    switch (variant) {
      case 'primary':
        return { ...baseStyle, ...styles.primary };
      case 'secondary':
        return { ...baseStyle, ...styles.secondary };
      case 'outline':
        return { ...baseStyle, ...styles.outline };
      case 'ghost':
        return { ...baseStyle, ...styles.ghost };
      case 'danger':
        return { ...baseStyle, ...styles.danger };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.text,
      ...styles[`text_${size}`],
    };

    // Variant text styles
    switch (variant) {
      case 'primary':
        return { ...baseTextStyle, color: colors.text.inverse };
      case 'secondary':
        return { ...baseTextStyle, color: colors.primary };
      case 'outline':
        return { ...baseTextStyle, color: colors.primary };
      case 'ghost':
        return { ...baseTextStyle, color: colors.primary };
      case 'danger':
        return { ...baseTextStyle, color: colors.text.inverse };
      default:
        return baseTextStyle;
    }
  };

  const getLoaderColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return colors.text.inverse;
      default:
        return colors.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), isDisabled && styles.disabled, style]}
      onPress={() => {
        haptics.light();
        onPress();
      }}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <>{icon}</>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && <>{icon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: spacing.borderRadius.md,
      borderWidth: 0,
    },
    fullWidth: {
      width: '100%',
    },

    // Size variants
    size_small: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      minHeight: 36,
    },
    size_medium: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      minHeight: 44,
    },
    size_large: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing['2xl'],
      minHeight: 52,
    },

    // Color variants
    primary: {
      backgroundColor: colors.primary,
      ...spacing.shadows.sm,
    },
    secondary: {
      backgroundColor: colors.secondary,
      ...spacing.shadows.sm,
    },
    outline: {
      backgroundColor: colors.transparent,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: colors.transparent,
    },
    danger: {
      backgroundColor: colors.error,
      ...spacing.shadows.sm,
    },

    // Disabled state
    disabled: {
      opacity: 0.5,
    },

    // Text styles
    text: {
      ...typography.styles.button,
      textAlign: 'center',
    },
    text_small: {
      fontSize: typography.fontSize.sm,
    },
    text_medium: {
      fontSize: typography.fontSize.md,
    },
    text_large: {
      fontSize: typography.fontSize.lg,
    },
  })
);
