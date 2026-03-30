import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';

const CODE_LENGTH = 6;

export default function VerifyPhoneScreen() {
  const insets = useSafeAreaInsets();
  const { fontFamily } = useAppFont();
  const { t } = useTranslation();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];

    if (text.length > 1) {
      // Handle paste
      const chars = text.split('').slice(0, CODE_LENGTH - index);
      chars.forEach((char, i) => {
        if (index + i < CODE_LENGTH) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + chars.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newCode[index] = text;
      setCode(newCode);
      if (text && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    setError(null);
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  const handleConfirm = async () => {
    const fullCode = code.join('');
    if (fullCode.length < CODE_LENGTH) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: Call verification API
      // await verifyPhone(fullCode);
      router.replace('/(auth)/register-success');
    } catch (err: any) {
      setError(t('auth.verifyCodeError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCode(Array(CODE_LENGTH).fill(''));
    setError(null);
    inputRefs.current[0]?.focus();
    // TODO: Call resend API
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      {/* Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="information-circle" size={20} color={colors.error} />
          <Text style={[styles.errorText, { fontFamily: fontFamily.medium }]}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Ionicons name="close" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Title */}
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>
          {t('auth.verifyPhoneTitle')}
        </Text>
        <Text style={[styles.subtitle, { fontFamily: fontFamily.regular }]}>
          {t('auth.verifyPhoneSubtitle')}
        </Text>
      </View>

      {/* OTP Inputs */}
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            style={[
              styles.codeInput,
              { fontFamily: fontFamily.bold },
              digit ? styles.codeInputFilled : styles.codeInputEmpty,
              error && digit ? styles.codeInputError : null,
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={index === 0 ? CODE_LENGTH : 1}
            selectTextOnFocus
          />
        ))}
      </View>

      {/* Resend */}
      <View style={styles.resendContainer}>
        <Text style={[styles.resendText, { fontFamily: fontFamily.regular }]}>
          {t('auth.didNotReceiveCode')}{' '}
        </Text>
        <TouchableOpacity onPress={handleResend}>
          <Text style={[styles.resendLink, { fontFamily: fontFamily.medium }]}>{t('auth.resendCode')}</Text>
        </TouchableOpacity>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Confirm Button */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[styles.confirmButton, code.join('').length < CODE_LENGTH && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          activeOpacity={0.8}
          disabled={code.join('').length < CODE_LENGTH || loading}
        >
          <Text style={[styles.confirmText, { fontFamily: fontFamily.medium }]}>
            {loading ? t('auth.verifying') : t('common.confirm')}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { fontFamily: fontFamily.regular }]}>
            {t('auth.haveAccount')}{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.loginLink, { fontFamily: fontFamily.medium }]}>{t('auth.signIn')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    paddingVertical: spacing.lg,
  },
  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FFCCCC',
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  // Header
  header: {
    marginTop: spacing['2xl'],
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: 26,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    color: '#6A7282',
    lineHeight: 22,
  },
  // OTP
  codeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  codeInput: {
    width: 48,
    height: 52,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 22,
    color: colors.text.primary,
  },
  codeInputEmpty: {
    backgroundColor: '#F0F0F0',
    borderWidth: 0,
  },
  codeInputFilled: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  codeInputError: {
    borderColor: colors.error,
  },
  // Resend
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  resendLink: {
    fontSize: 14,
    color: '#183DE5',
  },
  // Bottom
  bottomSection: {
    paddingTop: spacing.md,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    fontSize: 16,
    color: colors.text.inverse,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  loginLink: {
    fontSize: 15,
    color: '#183DE5',
  },
});
