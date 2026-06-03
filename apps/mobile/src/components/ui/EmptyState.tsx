import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../theme';
import { Button } from './Button';
import { useAppFont } from '../../hooks/useAppFont';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon?: IoniconsName | React.ReactNode;
  title: string;
  description?: string;
  message?: string;
  actionLabel?: string;
  actionText?: string;
  onActionPress?: () => void;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  message,
  actionLabel,
  actionText,
  onActionPress,
  onAction,
  style,
}) => {
  const styles = useStyles();
  const colors = useThemeColors();
  const { fontFamily } = useAppFont();

  const displayMessage = description || message;
  const displayActionLabel = actionLabel || actionText;
  const displayOnAction = onActionPress || onAction;

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <Ionicons name={icon as IoniconsName} size={64} color={colors.text.tertiary} />;
    }
    return icon;
  };

  return (
    <View style={[styles.container, style]}>
      {icon ? <View style={styles.iconContainer}>{renderIcon()}</View> : null}

      <Text style={[styles.title, { fontFamily: fontFamily.semiBold }]}>{title}</Text>

      {displayMessage ? (
        <Text style={[styles.description, { fontFamily: fontFamily.regular }]}>
          {displayMessage}
        </Text>
      ) : null}

      {displayActionLabel && displayOnAction ? (
        <Button
          title={displayActionLabel}
          onPress={displayOnAction}
          variant="primary"
          style={styles.action}
        />
      ) : null}
    </View>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing['4xl'],
    },
    iconContainer: {
      marginBottom: spacing['2xl'],
    },
    title: {
      ...typography.styles.h3,
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    description: {
      ...typography.styles.body,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing['2xl'],
    },
    action: {
      marginTop: spacing.lg,
      minWidth: 200,
    },
  })
);
