import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { makeThemedStyles, spacing, typography } from '../../theme';
import { Button } from './Button';
import { useAppFont } from '../../hooks/useAppFont';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Oops!',
  message,
  onRetry,
  retryLabel = 'Retry',
  style,
}) => {
  const styles = useStyles();
  const { fontFamily } = useAppFont();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⚠️</Text>
      </View>

      <Text style={[styles.title, { fontFamily: fontFamily.semiBold }]}>{title}</Text>
      <Text style={[styles.message, { fontFamily: fontFamily.regular }]}>{message}</Text>

      {onRetry && (
        <Button title={retryLabel} onPress={onRetry} variant="primary" style={styles.retryButton} />
      )}
    </View>
  );
};

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  style?: ViewStyle;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss, style }) => {
  const styles = useStyles();
  const { fontFamily } = useAppFont();

  return (
    <View style={[styles.banner, style]}>
      <Text style={styles.bannerIcon}>❌</Text>
      <Text style={[styles.bannerText, { fontFamily: fontFamily.regular }]}>{message}</Text>
      {onDismiss && (
        <Text
          style={[styles.dismissButton, { fontFamily: fontFamily.regular }]}
          onPress={onDismiss}
        >
          ✕
        </Text>
      )}
    </View>
  );
};

interface InlineErrorProps {
  message: string;
  style?: ViewStyle;
}

export const InlineError: React.FC<InlineErrorProps> = ({ message, style }) => {
  const styles = useStyles();
  const { fontFamily } = useAppFont();

  return (
    <View style={[styles.inlineError, style]}>
      <Text style={[styles.inlineErrorIcon, { fontFamily: fontFamily.bold }]}>!</Text>
      <Text style={[styles.inlineErrorText, { fontFamily: fontFamily.regular }]}>{message}</Text>
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
    icon: {
      fontSize: 64,
    },
    title: {
      ...typography.styles.h2,
      color: colors.text.primary,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    message: {
      ...typography.styles.body,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing['2xl'],
    },
    retryButton: {
      marginTop: spacing.lg,
      minWidth: 200,
    },

    // Error Banner
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.errorLight,
      padding: spacing.md,
      borderRadius: spacing.borderRadius.md,
      marginBottom: spacing.md,
    },
    bannerIcon: {
      fontSize: 20,
      marginRight: spacing.sm,
    },
    bannerText: {
      flex: 1,
      ...typography.styles.bodySmall,
      color: colors.text.inverse,
    },
    dismissButton: {
      fontSize: 20,
      color: colors.text.inverse,
      paddingHorizontal: spacing.sm,
    },

    // Inline Error
    inlineError: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.errorLight,
      padding: spacing.sm,
      borderRadius: spacing.borderRadius.sm,
      marginTop: spacing.xs,
    },
    inlineErrorIcon: {
      fontSize: 16,
      color: colors.text.inverse,
      fontWeight: typography.fontWeight.bold,
      marginRight: spacing.xs,
      backgroundColor: colors.error,
      borderRadius: 12,
      width: 20,
      height: 20,
      textAlign: 'center',
      lineHeight: 20,
    },
    inlineErrorText: {
      ...typography.styles.caption,
      color: colors.text.inverse,
      flex: 1,
    },
  })
);
