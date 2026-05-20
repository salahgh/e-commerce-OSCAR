import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { InfoScreen } from '../../src/components/info';
import { colors, spacing, typography } from '../../src/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FaqScreen() {
  const { t } = useTranslation();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const qa = [
    { q: t('faqPage.q1'), a: t('faqPage.a1') },
    { q: t('faqPage.q2'), a: t('faqPage.a2') },
    { q: t('faqPage.q3'), a: t('faqPage.a3') },
    { q: t('faqPage.q4'), a: t('faqPage.a4') },
    { q: t('faqPage.q5'), a: t('faqPage.a5') },
  ];

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIdx((cur) => (cur === i ? null : i));
  };

  return (
    <InfoScreen title={t('info.faq')} intro={t('faqPage.intro')}>
      <View style={styles.list}>
        {qa.map((item, i) => {
          const open = openIdx === i;
          return (
            <View key={i} style={styles.item}>
              <TouchableOpacity style={styles.head} onPress={() => toggle(i)} activeOpacity={0.7}>
                <Text style={styles.q}>{item.q}</Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={colors.text.secondary}
                  style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
                />
              </TouchableOpacity>
              {open ? <Text style={styles.a}>{item.a}</Text> : null}
            </View>
          );
        })}
      </View>
    </InfoScreen>
  );
}

const styles = StyleSheet.create({
  list: {},
  item: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  q: {
    flex: 1,
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  a: {
    marginTop: spacing.sm,
    ...typography.styles.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
});
