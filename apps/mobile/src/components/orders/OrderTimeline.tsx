import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { OrderStatus } from './OrderStatusBadge';
import { colors, spacing, typography } from '../../theme';

interface TimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  date?: string;
}

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  createdAt: string;
  paidAt?: string | null;
  deliveredAt?: string | null;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  currentStatus,
  createdAt,
  paidAt,
  deliveredAt,
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSteps = (): TimelineStep[] => {
    if (currentStatus === 'CANCELLED') {
      return [
        {
          status: 'PENDING',
          label: t('orders.timeline.orderPlaced', 'Order Placed'),
          description: t('orders.timeline.orderPlacedDesc', 'Your order has been received'),
          icon: 'receipt-outline',
          date: createdAt,
        },
        {
          status: 'CANCELLED',
          label: t('orders.timeline.orderCancelled', 'Order Cancelled'),
          description: t('orders.timeline.orderCancelledDesc', 'This order has been cancelled'),
          icon: 'close-circle-outline',
        },
      ];
    }

    return [
      {
        status: 'PENDING',
        label: t('orders.timeline.orderPlaced', 'Order Placed'),
        description: t('orders.timeline.orderPlacedDesc', 'Your order has been received'),
        icon: 'receipt-outline',
        date: createdAt,
      },
      {
        status: 'CONFIRMED',
        label: t('orders.timeline.orderConfirmed', 'Order Confirmed'),
        description: t('orders.timeline.orderConfirmedDesc', 'Your order is being prepared'),
        icon: 'checkmark-circle-outline',
        date: paidAt || undefined,
      },
      {
        status: 'SHIPPED',
        label: t('orders.timeline.orderShipped', 'Order Shipped'),
        description: t('orders.timeline.orderShippedDesc', 'Your order is on its way'),
        icon: 'cube-outline',
      },
      {
        status: 'DELIVERED',
        label: t('orders.timeline.orderDelivered', 'Order Delivered'),
        description: t('orders.timeline.orderDeliveredDesc', 'Your order has been delivered'),
        icon: 'home-outline',
        date: deliveredAt || undefined,
      },
    ];
  };

  const steps = getSteps();

  const getStepStatus = (step: TimelineStep, index: number): 'completed' | 'active' | 'pending' => {
    const statusOrder: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(step.status);

    if (currentStatus === 'CANCELLED') {
      if (step.status === 'PENDING') return 'completed';
      if (step.status === 'CANCELLED') return 'active';
      return 'pending';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('orders.timeline.title', 'Order Timeline')}</Text>

      <View style={styles.timeline}>
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step, index);
          const isLast = index === steps.length - 1;

          return (
            <View key={step.status} style={styles.stepContainer}>
              <View style={styles.stepLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    stepStatus === 'completed' && styles.iconContainerCompleted,
                    stepStatus === 'active' && styles.iconContainerActive,
                    stepStatus === 'pending' && styles.iconContainerPending,
                  ]}
                >
                  <Ionicons
                    name={step.icon}
                    size={20}
                    color={
                      stepStatus === 'completed' || stepStatus === 'active'
                        ? colors.white
                        : colors.text.tertiary
                    }
                  />
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.line,
                      stepStatus === 'completed' && styles.lineCompleted,
                      stepStatus === 'active' && styles.linePending,
                      stepStatus === 'pending' && styles.linePending,
                    ]}
                  />
                )}
              </View>

              <View style={styles.stepRight}>
                <Text
                  style={[
                    styles.stepLabel,
                    stepStatus === 'active' && styles.stepLabelActive,
                    stepStatus === 'pending' && styles.stepLabelPending,
                  ]}
                >
                  {step.label}
                </Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
                {step.date && <Text style={styles.stepDate}>{formatDate(step.date)}</Text>}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.styles.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  timeline: {
    paddingLeft: spacing.sm,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepLeft: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerCompleted: {
    backgroundColor: colors.success,
  },
  iconContainerActive: {
    backgroundColor: colors.primary,
  },
  iconContainerPending: {
    backgroundColor: colors.border,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  lineCompleted: {
    backgroundColor: colors.success,
  },
  linePending: {
    backgroundColor: colors.border,
  },
  stepRight: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  stepLabel: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  stepLabelActive: {
    color: colors.primary,
  },
  stepLabelPending: {
    color: colors.text.secondary,
  },
  stepDescription: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xxs,
  },
  stepDate: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
});
