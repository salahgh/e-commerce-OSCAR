import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { makeThemedStyles } from '../../src/theme';

const useStyles = makeThemedStyles((colors) => ({
  headerStyle: {
    backgroundColor: colors.surface,
  },
  headerTintColor: colors.primary,
}));

export default function AuthLayout() {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerStyle: styles.headerStyle,
        headerTintColor: styles.headerTintColor,
        headerShadowVisible: false,
        headerBackTitle: t('common.back'),
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: t('auth.login'),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: t('auth.register'),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: t('auth.resetPassword'),
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
