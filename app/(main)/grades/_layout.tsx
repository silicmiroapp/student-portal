import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function GradesLayout() {
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
