import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle;
  variant?: 'default' | 'circle' | 'square';
  backgroundColor?: string;
  disabled?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  color = colors.text.primary,
  size = 24,
  style,
  variant = 'default',
  backgroundColor,
  disabled = false,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const segments = useSegments();

  // Check if we can go back
  const canGoBack = segments.length > 1;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (canGoBack) {
      router.back();
    }
  };

  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case 'circle':
        return {
          ...styles.circleButton,
          backgroundColor: backgroundColor || colors.surface,
        };
      case 'square':
        return {
          ...styles.squareButton,
          backgroundColor: backgroundColor || colors.surface,
        };
      default:
        return styles.defaultButton;
    }
  };

  if (!canGoBack && !onPress) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[getButtonStyle(), disabled && styles.disabled, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.goBack', 'Go back')}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
        size={size}
        color={disabled ? colors.text.disabled : color}
      />
    </TouchableOpacity>
  );
};

// Close button variant
interface CloseButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle;
  variant?: 'default' | 'circle' | 'square';
  backgroundColor?: string;
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onPress,
  color = colors.text.primary,
  size = 24,
  style,
  variant = 'default',
  backgroundColor,
}) => {
  const { t } = useTranslation();
  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case 'circle':
        return {
          ...styles.circleButton,
          backgroundColor: backgroundColor || colors.surface,
        };
      case 'square':
        return {
          ...styles.squareButton,
          backgroundColor: backgroundColor || colors.surface,
        };
      default:
        return styles.defaultButton;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.close', 'Close')}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="close" size={size} color={color} />
    </TouchableOpacity>
  );
};

// Floating back button for use on product pages with images
interface FloatingBackButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
}

export const FloatingBackButton: React.FC<FloatingBackButtonProps> = ({
  onPress,
  style,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const segments = useSegments();

  const canGoBack = segments.length > 1;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (canGoBack) {
      router.back();
    }
  };

  if (!canGoBack && !onPress) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.floatingButton, style]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.goBack', 'Go back')}
      activeOpacity={0.8}
    >
      <Ionicons
        name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
        size={24}
        color={colors.text.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  defaultButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  squareButton: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  floatingButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
