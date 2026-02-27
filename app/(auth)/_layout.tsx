import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';

// Auth stack — login is the root, register slides in from right
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" options={{ animation: 'none' }} />
      <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
