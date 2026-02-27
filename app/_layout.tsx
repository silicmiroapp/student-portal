import { useEffect, useCallback, useRef } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform, BackHandler, AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, OpenSans_400Regular, OpenSans_600SemiBold, OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import { useAuthStore } from '@/features/auth/store';
import { useSettingsStore } from '@/features/settings/store';
import { useTheme } from '@/hooks/useTheme';

// Root layout — wraps the entire app with providers and handles auth routing
export default function RootLayout() {
  const { isAuthenticated, isLoading, hydrate, touchSession } = useAuthStore();
  const { isHydrated: settingsHydrated, hydrate: hydrateSettings } = useSettingsStore();
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  useEffect(() => {
    hydrate();
    hydrateSettings();
  }, [hydrate, hydrateSettings]);

  // Keep session alive — update last-active timestamp when app returns to foreground
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (isAuthenticated) {
          touchSession();
        }
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [isAuthenticated, touchSession]);

  // Auth guard — redirect based on auth state
  useEffect(() => {
    if (isLoading || !fontsLoaded || !settingsHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(main)/dashboard');
    }
  }, [isAuthenticated, isLoading, fontsLoaded, settingsHydrated, segments, router]);

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

  if (isLoading || !fontsLoaded || !settingsHydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Slot />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
