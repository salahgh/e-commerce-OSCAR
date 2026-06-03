import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  size?: 'small' | 'medium' | 'large';
  containerStyle?: ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  error,
  size = 'medium',
  containerStyle,
}) => {
  const styles = useStyles();
  const colors = useThemeColors();

  const getSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  const boxSize = getSize();

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => !disabled && onChange(!checked)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkbox,
            { width: boxSize, height: boxSize },
            checked && styles.checkboxChecked,
            disabled && styles.checkboxDisabled,
            error && styles.checkboxError,
          ]}
        >
          {checked && <Ionicons name="checkmark" size={boxSize - 6} color={colors.text.inverse} />}
        </View>

        {(label || description) && (
          <View style={styles.textContainer}>
            {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
            {description && <Text style={styles.description}>{description}</Text>}
          </View>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.sm,
    },
    touchable: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    checkbox: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: spacing.borderRadius.sm,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkboxDisabled: {
      backgroundColor: colors.background,
      borderColor: colors.borderLight,
      opacity: 0.6,
    },
    checkboxError: {
      borderColor: colors.error,
    },
    textContainer: {
      flex: 1,
      marginLeft: spacing.md,
    },
    label: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    },
    labelDisabled: {
      color: colors.text.disabled,
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    errorText: {
      fontSize: typography.fontSize.xs,
      color: colors.error,
      marginTop: spacing.xs,
      marginLeft: 32,
    },
  })
);
