import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function CoursesLayout() {
  const { colors, reduceMotion } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: reduceMotion ? 'none' : 'slide_from_right',
      }}
    />
  );
}
