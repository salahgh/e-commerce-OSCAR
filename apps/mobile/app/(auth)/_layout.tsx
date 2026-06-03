import { Stack } from 'expo-router';
import { makeThemedStyles } from '../../src/theme';

const useStyles = makeThemedStyles((colors) => ({
  headerStyle: {
    backgroundColor: colors.surface,
  },
  headerTintColor: colors.primary,
}));

export default function AuthLayout() {
  const styles = useStyles();
  return (
    <Stack
      screenOptions={{
        headerStyle: styles.headerStyle,
        headerTintColor: styles.headerTintColor,
        headerShadowVisible: false,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Register',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: 'Reset Password',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
