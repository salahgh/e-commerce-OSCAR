import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  iconColor?: string;
  isDestructive?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  iconColor,
  isDestructive = false,
}) => {
  const colors = useThemeColors();
  const styles = useStyles();
  const { fontFamily } = useAppFont();

  const handlePress = () => {
    if (onPress && !showSwitch) {
      onPress();
    }
  };

  const textColor = isDestructive ? colors.error : colors.text.primary;
  const defaultIconColor = isDestructive ? colors.error : colors.primary;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={onPress && !showSwitch ? 0.7 : 1}
      disabled={!onPress && !showSwitch}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: (iconColor || defaultIconColor) + '20' }]}
      >
        <Ionicons name={icon} size={22} color={iconColor || defaultIconColor} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: textColor, fontFamily: fontFamily.medium }]}>
          {label}
        </Text>
        {value && !showSwitch && (
          <Text style={[styles.value, { fontFamily: fontFamily.regular }]}>{value}</Text>
        )}
      </View>

      {showSwitch && onSwitchChange ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary + '60' }}
          thumbColor={switchValue ? colors.primary : colors.text.tertiary}
        />
      ) : (
        showChevron && <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      )}
    </TouchableOpacity>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 12,
      marginBottom: spacing.sm,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    content: {
      flex: 1,
    },
    label: {
      ...typography.styles.body,
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing.xxs,
    },
    value: {
      ...typography.styles.bodySmall,
      color: colors.text.secondary,
    },
  })
);
