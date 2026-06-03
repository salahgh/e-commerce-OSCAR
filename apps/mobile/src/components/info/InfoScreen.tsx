import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { spacing, typography, makeThemedStyles } from '../../theme';

interface InfoScreenProps {
  title: string;
  intro?: string;
  showContactCta?: boolean;
  children: React.ReactNode;
}

/**
 * Shared wrapper for static information screens (shipping, returns, legal,
 * about, etc). Mirrors `InfoPageLayout` from frontend-v2.
 */
export function InfoScreen({ title, intro, showContactCta = true, children }: InfoScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title, headerBackTitle: '' }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>
        {intro ? <Text style={styles.intro}>{intro}</Text> : null}
        <View style={styles.body}>{children}</View>

        {showContactCta && (
          <View style={styles.cta}>
            <Text style={styles.ctaHeading}>{t('info.helpHeading')}</Text>
            <TouchableOpacity onPress={() => router.push('/info/contact' as any)}>
              <Text style={styles.ctaLink}>
                {t('info.helpCta')} <Ionicons name="arrow-forward" size={14} />
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.paragraph}>{children}</Text>;
}

export function Bullets({ items }: { items: string[] }) {
  const styles = useStyles();
  return (
    <View style={styles.bullets}>
      {items.map((line, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xl },
    title: {
      ...typography.styles.h2,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
      marginBottom: spacing.xs,
    },
    intro: {
      ...typography.styles.body,
      color: colors.text.secondary,
      marginBottom: spacing.lg,
    },
    body: { gap: spacing.lg },
    section: { gap: spacing.sm },
    sectionTitle: {
      ...typography.styles.h4,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
    },
    paragraph: {
      ...typography.styles.body,
      color: colors.text.primary,
      lineHeight: 22,
    },
    bullets: { gap: spacing.xs },
    bulletRow: { flexDirection: 'row', gap: spacing.sm },
    bulletDot: {
      ...typography.styles.body,
      color: colors.text.secondary,
    },
    bulletText: {
      flex: 1,
      ...typography.styles.body,
      color: colors.text.primary,
      lineHeight: 22,
    },
    cta: {
      marginTop: spacing.xl,
      padding: spacing.md,
      borderRadius: 12,
      backgroundColor: colors.surface,
      gap: spacing.xs,
    },
    ctaHeading: {
      ...typography.styles.body,
      color: colors.text.secondary,
    },
    ctaLink: {
      ...typography.styles.body,
      color: colors.primary,
      fontWeight: typography.fontWeight.semiBold,
    },
  })
);
