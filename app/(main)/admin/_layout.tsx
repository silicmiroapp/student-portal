import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function AdminLayout() {
  const { colors } = useTheme();
  const isAdmin = useAdminGuard();

  // Block rendering until admin check completes — non-admins are redirected by the guard
  if (!isAdmin) {
    return <LoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
