import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function NotificationsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
