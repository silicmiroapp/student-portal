import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

// Auth stack — login is the root, register slides in from right
export default function AuthLayout() {
  const { colors, reduceMotion } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: reduceMotion ? 'none' : 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" options={{ animation: 'none' }} />
      <Stack.Screen name="register" options={{ animation: reduceMotion ? 'none' : 'slide_from_right' }} />
    </Stack>
  );
}
