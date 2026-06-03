import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../theme';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string | number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const styles = useStyles();
  const colors = useThemeColors();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'secondary') return colors.text.primary;
    return colors.text.inverse;
  };

  return (
    <View
      style={[
        styles.badge,
        styles[`badge_${size}`],
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      <Text style={[styles.text, styles[`text_${size}`], { color: getTextColor() }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

// Notification badge (small circular badge with number)
interface NotificationBadgeProps {
  count: number;
  max?: number;
  style?: ViewStyle;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, max = 99, style }) => {
  const styles = useStyles();
  const displayCount = count > max ? `${max}+` : count.toString();

  if (count === 0) return null;

  return (
    <View style={[styles.notificationBadge, style]}>
      <Text style={styles.notificationText}>{displayCount}</Text>
    </View>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: spacing.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badge_small: {
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
    },
    badge_medium: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    badge_large: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    text: {
      fontWeight: typography.fontWeight.semiBold,
    },
    text_small: {
      fontSize: typography.fontSize.xs,
    },
    text_medium: {
      fontSize: typography.fontSize.sm,
    },
    text_large: {
      fontSize: typography.fontSize.md,
    },
    notificationBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: colors.error,
      borderRadius: spacing.borderRadius.full,
      minWidth: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: colors.surface,
    },
    notificationText: {
      color: colors.text.inverse,
      fontSize: 10,
      fontWeight: typography.fontWeight.bold,
    },
  })
);
