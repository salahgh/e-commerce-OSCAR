import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'filled' | 'outlined';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  variant = 'filled',
  style,
  textStyle,
}) => {
  const styles = useStyles();
  const colors = useThemeColors();

  const getChipStyle = (): ViewStyle => {
    if (variant === 'outlined') {
      return {
        ...styles.chip,
        ...styles.outlined,
        ...(selected && styles.outlinedSelected),
      };
    }
    return {
      ...styles.chip,
      ...styles.filled,
      ...(selected && styles.filledSelected),
    };
  };

  const getTextStyle = (): TextStyle => {
    if (variant === 'outlined') {
      return {
        ...styles.text,
        color: selected ? colors.primary : colors.text.secondary,
      };
    }
    return {
      ...styles.text,
      color: selected ? colors.text.inverse : colors.text.secondary,
    };
  };

  return (
    <TouchableOpacity
      style={[getChipStyle(), style]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={[getTextStyle(), textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: spacing.borderRadius.full,
      marginRight: spacing.sm,
      marginBottom: spacing.sm,
    },
    filled: {
      backgroundColor: colors.background,
    },
    filledSelected: {
      backgroundColor: colors.primary,
    },
    outlined: {
      backgroundColor: colors.transparent,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outlinedSelected: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    text: {
      ...typography.styles.bodySmall,
      fontWeight: typography.fontWeight.medium,
    },
  })
);
