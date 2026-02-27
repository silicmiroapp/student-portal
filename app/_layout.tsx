import { useEffect, useCallback } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/store';
import { COLORS } from '@/constants/theme';

// Root layout — wraps the entire app with providers and handles auth routing
export default function RootLayout() {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Auth guard — redirect based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(main)/dashboard');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  // Android hardware back button — exit app from login or home (don't go back to splash)
  const onBackPress = useCallback(() => {
    const group = segments[0];
    const screen = (segments as string[])[1] as string | undefined;
    const isRootScreen =
      (group === '(auth)' && screen === 'login') ||
      (group === '(main)' && screen === 'dashboard');

    if (isRootScreen) {
      BackHandler.exitApp();
      return true;
    }
    return false; // let default back behavior handle it
  }, [segments]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [onBackPress]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Slot />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
