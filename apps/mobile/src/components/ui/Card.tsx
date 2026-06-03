import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { makeThemedStyles, useThemeColors, spacing } from '../../theme';

type CardVariant = 'elevated' | 'outlined' | 'flat';

interface BaseCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: keyof typeof spacing | number;
  style?: ViewStyle;
}

interface PressableCardProps extends BaseCardProps, TouchableOpacityProps {
  onPress: () => void;
  pressable: true;
}

interface NonPressableCardProps extends BaseCardProps {
  onPress?: never;
  pressable?: false;
}

export type CardProps = PressableCardProps | NonPressableCardProps;

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'lg',
  style,
  onPress,
  pressable = false,
  ...props
}) => {
  const styles = useStyles();
  const colors = useThemeColors();

  const getPadding = () => {
    if (typeof padding === 'number') return padding;
    return spacing[padding] || spacing.lg;
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: spacing.borderRadius.lg,
      padding: getPadding(),
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...spacing.shadows.md,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'flat':
        return baseStyle;
      default:
        return baseStyle;
    }
  };

  if (pressable && onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.7}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

// Pre-configured card variants for common use cases
export const ProductCard: React.FC<CardProps> = (props) => (
  <Card variant="elevated" padding="md" {...props} />
);

export const InfoCard: React.FC<CardProps> = (props) => (
  <Card variant="outlined" padding="lg" {...props} />
);

export const FlatCard: React.FC<CardProps> = (props) => (
  <Card variant="flat" padding="md" {...props} />
);

const useStyles = makeThemedStyles((_colors) =>
  StyleSheet.create({
    // Card styles are computed inline via getCardStyle() using dynamic colors
  })
);
