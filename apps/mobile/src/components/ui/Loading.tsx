import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { makeThemedStyles, useThemeColors, spacing } from '../../theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'large', color, style }) => {
  const styles = useStyles();
  const colors = useThemeColors();
  const resolvedColor = color ?? colors.primary;

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={resolvedColor} />
    </View>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  color?: string;
  backgroundColor?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  color,
  backgroundColor,
}) => {
  const styles = useStyles();
  const colors = useThemeColors();
  const resolvedColor = color ?? colors.primary;
  const resolvedBg = backgroundColor ?? colors.overlay;

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: resolvedBg }]}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color={resolvedColor} />
      </View>
    </View>
  );
};

// Skeleton loader for content placeholders
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = spacing.borderRadius.sm,
  style,
}) => {
  const styles = useStyles();

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

// Pre-configured skeleton components
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  const styles = useStyles();

  return (
    <View style={styles.skeletonTextContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={16}
          width={index === lines - 1 ? '70%' : '100%'}
          style={styles.skeletonTextLine}
        />
      ))}
    </View>
  );
};

export const SkeletonCard: React.FC = () => {
  const styles = useStyles();

  return (
    <View style={styles.skeletonCard}>
      <Skeleton width="100%" height={200} style={styles.skeletonImage} />
      <View style={styles.skeletonCardContent}>
        <Skeleton width="80%" height={20} style={styles.skeletonTitle} />
        <Skeleton width="60%" height={16} style={styles.skeletonSubtitle} />
        <View style={styles.skeletonRow}>
          <Skeleton width={80} height={32} />
          <Skeleton width={100} height={32} />
        </View>
      </View>
    </View>
  );
};

export const SkeletonProductCard: React.FC = () => {
  const styles = useStyles();

  return (
    <View style={styles.skeletonProductCard}>
      <Skeleton width="100%" height={180} style={styles.skeletonProductImage} />
      <View style={styles.skeletonProductContent}>
        <Skeleton width="90%" height={16} style={{ marginBottom: spacing.xs }} />
        <Skeleton width="70%" height={14} style={{ marginBottom: spacing.sm }} />
        <Skeleton width={60} height={20} />
      </View>
    </View>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing['2xl'],
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    overlayContent: {
      backgroundColor: colors.surface,
      padding: spacing['2xl'],
      borderRadius: spacing.borderRadius.lg,
      ...spacing.shadows.lg,
    },
    skeleton: {
      backgroundColor: colors.borderLight,
    },
    skeletonTextContainer: {
      width: '100%',
    },
    skeletonTextLine: {
      marginBottom: spacing.sm,
    },
    skeletonCard: {
      backgroundColor: colors.surface,
      borderRadius: spacing.borderRadius.lg,
      overflow: 'hidden',
      ...spacing.shadows.md,
    },
    skeletonImage: {
      marginBottom: 0,
    },
    skeletonCardContent: {
      padding: spacing.lg,
    },
    skeletonTitle: {
      marginBottom: spacing.sm,
    },
    skeletonSubtitle: {
      marginBottom: spacing.md,
    },
    skeletonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    skeletonProductCard: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: spacing.borderRadius.lg,
      overflow: 'hidden',
      marginBottom: spacing.md,
      ...spacing.shadows.sm,
    },
    skeletonProductImage: {
      aspectRatio: 3 / 4,
    },
    skeletonProductContent: {
      padding: spacing.md,
    },
  })
);
