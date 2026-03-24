import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface DividerProps {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: keyof typeof spacing;
  color?: string;
  thickness?: number;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  label,
  orientation = 'horizontal',
  spacing: spacingProp = 'md',
  color = colors.border,
  thickness = 1,
  style,
}) => {
  const spacingValue = spacing[spacingProp] || spacing.md;

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.verticalDivider,
          {
            width: thickness,
            backgroundColor: color,
            marginHorizontal: spacingValue,
          },
          style,
        ]}
      />
    );
  }

  if (label) {
    return (
      <View style={[styles.horizontalWithLabel, { marginVertical: spacingValue }, style]}>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontalDivider,
        {
          height: thickness,
          backgroundColor: color,
          marginVertical: spacingValue,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontalDivider: {
    width: '100%',
  },
  verticalDivider: {
    height: '100%',
  },
  horizontalWithLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  line: {
    flex: 1,
  },
  label: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginHorizontal: spacing.md,
  },
});
