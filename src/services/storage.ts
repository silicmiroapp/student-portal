import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// ── Web storage ────────────────────────────────────────────────
// Web has no native encrypted keychain equivalent.
// We use sessionStorage (not localStorage) so tokens are cleared when
// the browser tab is closed, reducing the exposure window.
//
// For production web deployments, consider:
// 1. Using httpOnly cookies set by the server (preferred)
// 2. A web crypto-based encryption wrapper around storage
// 3. Storing only short-lived tokens client-side
const webStorage = {
  async get(key: string): Promise<string | null> {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Storage full or blocked — fail silently
    }
  },
  async remove(key: string): Promise<void> {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },
};

// ── Native storage ─────────────────────────────────────────────
// iOS: encrypted keychain
// Android: encrypted keystore (EncryptedSharedPreferences)
const nativeStorage = {
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

export const storage = Platform.OS === 'web' ? webStorage : nativeStorage;
