import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Web fallback using localStorage (not encrypted — fine for development only)
const webStorage = {
  async get(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  },
  async set(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  },
  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  },
};

// Native uses encrypted keychain (iOS) / keystore (Android)
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
