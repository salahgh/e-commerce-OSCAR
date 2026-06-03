import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { InfoScreen, Section } from '../../src/components/info';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../src/theme';

export default function ContactScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const colors = useThemeColors();
  const email = t('contactPage.emailValue');
  const phone = t('contactPage.phoneValue');

  return (
    <InfoScreen title={t('info.contact')} intro={t('contactPage.intro')} showContactCta={false}>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => Linking.openURL(`mailto:${email}`)}
          activeOpacity={0.7}
        >
          <Ionicons name="mail-outline" size={18} color={colors.text.secondary} />
          <Text style={styles.cardLabel}>{t('contactPage.emailTitle')}</Text>
          <Text style={styles.cardValue}>{email}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`)}
          activeOpacity={0.7}
        >
          <Ionicons name="call-outline" size={18} color={colors.text.secondary} />
          <Text style={styles.cardLabel}>{t('contactPage.phoneTitle')}</Text>
          <Text style={styles.cardValue}>{phone}</Text>
        </TouchableOpacity>
        <View style={styles.card}>
          <Ionicons name="location-outline" size={18} color={colors.text.secondary} />
          <Text style={styles.cardLabel}>{t('contactPage.addressTitle')}</Text>
          <Text style={styles.cardValue}>{t('contactPage.addressLine1')}</Text>
          <Text style={styles.cardValue}>{t('contactPage.addressLine2')}</Text>
        </View>
        <View style={styles.card}>
          <Ionicons name="time-outline" size={18} color={colors.text.secondary} />
          <Text style={styles.cardLabel}>{t('contactPage.hoursTitle')}</Text>
          <Text style={styles.cardValue}>{t('contactPage.hoursValue')}</Text>
        </View>
      </View>
    </InfoScreen>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    grid: { gap: spacing.sm },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    cardLabel: {
      ...typography.styles.caption,
      color: colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardValue: {
      ...typography.styles.body,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    },
  })
);
