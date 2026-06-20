import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Keyboard, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';
import { rtlIcon } from '../../src/utils/rtl';

export default function SupportScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { fontFamily } = useAppFont();
  const styles = useStyles();
  const colors = useThemeColors();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    Keyboard.dismiss();
    if (!message.trim()) return;

    setSending(true);
    try {
      // Open the user's mail app pre-filled to the support address.
      const email = t('contactPage.emailValue');
      const subject = t('profile.helpSupport', 'Help & Support');
      const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        message.trim()
      )}`;
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error('no-mail-client');
      await Linking.openURL(url);
      setMessage('');
      router.back();
    } catch {
      Alert.alert(t('common.error'), t('profile.cannotSend'));
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name={rtlIcon('arrow-back')} size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: fontFamily.medium }]}>
          {t('profile.helpSupport')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>{t('profile.needHelp')}</Text>
        <Text style={[styles.subtitle, { fontFamily: fontFamily.regular }]}>
          {t('profile.helpSubtitle')}
        </Text>

        {/* Message Input */}
        <TextInput
          style={[styles.messageInput, { fontFamily: fontFamily.regular }]}
          placeholder={t('profile.messagePlaceholder')}
          placeholderTextColor={colors.text.tertiary}
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
        />

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          activeOpacity={0.8}
          disabled={!message.trim() || sending}
        >
          <Text style={[styles.sendButtonText, { fontFamily: fontFamily.medium }]}>
            {sending ? t('common.sending') : t('common.send')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      color: colors.text.primary,
    },
    content: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
    },
    title: {
      fontSize: 20,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 22,
      marginBottom: spacing.xl,
    },
    messageInput: {
      height: 140,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      fontSize: 14,
      color: colors.text.primary,
      marginBottom: spacing.lg,
    },
    sendButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    sendButtonText: {
      fontSize: 16,
      color: colors.text.inverse,
    },
  })
);
