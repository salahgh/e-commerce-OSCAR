import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';

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
  color,
  thickness = 1,
  style,
}) => {
  const styles = useStyles();
  const colors = useThemeColors();
  const { fontFamily } = useAppFont();
  const resolvedColor = color ?? colors.border;
  const spacingValue = spacing[spacingProp] || spacing.md;

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.verticalDivider,
          {
            width: thickness,
            backgroundColor: resolvedColor,
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
        <View style={[styles.line, { backgroundColor: resolvedColor, height: thickness }]} />
        <Text style={[styles.label, { fontFamily: fontFamily.regular }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: resolvedColor, height: thickness }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontalDivider,
        {
          height: thickness,
          backgroundColor: resolvedColor,
          marginVertical: spacingValue,
        },
        style,
      ]}
    />
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
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
  })
);
