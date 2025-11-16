import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../theme';

export type PaymentMethod = 'CIB' | 'BARIDIMOB' | 'COD';

interface PaymentMethodOption {
  id: PaymentMethod;
  nameKey: string;
  name: string;
  descriptionKey: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'CIB',
    nameKey: 'checkout.cibCard',
    name: 'CIB Card',
    descriptionKey: 'checkout.cibCardDescription',
    description: 'Pay securely with your CIB card',
    icon: 'card-outline',
  },
  {
    id: 'BARIDIMOB',
    nameKey: 'checkout.baridimob',
    name: 'BaridiMob',
    descriptionKey: 'checkout.baridimobDescription',
    description: 'Pay with BaridiMob mobile wallet',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'COD',
    nameKey: 'checkout.cashOnDelivery',
    name: 'Cash on Delivery',
    descriptionKey: 'checkout.cashOnDeliveryDescription',
    description: 'Pay when you receive your order',
    icon: 'cash-outline',
  },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('checkout.paymentMethod', 'Payment Method')}</Text>
        <Text style={styles.subtitle}>
          {t('checkout.paymentMethodSubtitle', 'How would you like to pay?')}
        </Text>
      </View>

      <View style={styles.methodsList}>
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;

          return (
            <TouchableOpacity
              key={method.id}
              style={[styles.methodCard, isSelected && styles.methodCardSelected]}
              onPress={() => onSelect(method.id)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <View style={styles.methodContent}>
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                  <Ionicons
                    name={method.icon}
                    size={28}
                    color={isSelected ? colors.primary : colors.text.secondary}
                  />
                </View>

                <View style={styles.methodInfo}>
                  <Text style={[styles.methodName, isSelected && styles.methodNameSelected]}>
                    {t(method.nameKey, method.name)}
                  </Text>
                  <Text style={styles.methodDescription}>
                    {t(method.descriptionKey, method.description)}
                  </Text>
                </View>

                <View style={styles.checkContainer}>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                  {!isSelected && <View style={styles.uncheckedCircle} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedMethod === 'COD' && (
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            {t(
              'checkout.codInfo',
              'Please have exact change ready. Our delivery partner will collect payment upon delivery.'
            )}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.styles.h3,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  methodsList: {
    gap: spacing.md,
  },
  methodCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
  },
  methodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSelected: {
    backgroundColor: colors.primary + '20',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  methodNameSelected: {
    color: colors.primary,
  },
  methodDescription: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  checkContainer: {
    width: 24,
    height: 24,
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.info + '15',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  infoText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    flex: 1,
  },
});
