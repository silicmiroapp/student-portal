import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { NOTIFICATION_CHANNELS, type PushNotificationData } from '@/types/notifications';
import { storage } from '@/services/storage';
import { STORAGE_KEYS } from '@/constants/api';
import { ENV } from '@/config/env';

// ── Configure default notification behavior ──────────────────────
// Foreground: we show our own in-app toast, so suppress OS banner.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

// ── Android notification channels ────────────────────────────────
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  const channels = Object.values(NOTIFICATION_CHANNELS);
  for (const ch of channels) {
    await Notifications.setNotificationChannelAsync(ch.id, {
      name: ch.name,
      importance: ch.importance as Notifications.AndroidImportance,
      description: ch.description,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#b9312c',
    });
  }
}

// ── Permission request ───────────────────────────────────────────
export async function requestPushPermissions(): Promise<boolean> {
  // Push notifications require a physical device
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ── Get Expo push token ──────────────────────────────────────────
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const granted = await requestPushPermissions();
    if (!granted) return null;

    const projectId =
      ENV.EXPO_PROJECT_ID ||
      Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.warn('No Expo project ID configured — push token unavailable');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  } catch (err) {
    console.error('Failed to get push token:', err);
    return null;
  }
}

// ── Store/retrieve local push token ──────────────────────────────
export async function storeLocalToken(token: string): Promise<void> {
  await storage.set(STORAGE_KEYS.PUSH_TOKEN, token);
}

export async function getStoredToken(): Promise<string | null> {
  return storage.get(STORAGE_KEYS.PUSH_TOKEN);
}

export async function clearLocalToken(): Promise<void> {
  await Promise.all([
    storage.remove(STORAGE_KEYS.PUSH_TOKEN),
    storage.remove(STORAGE_KEYS.DEVICE_REGISTRATION_ID),
  ]);
}

// ── Store/retrieve device registration ID ────────────────────────
export async function storeDeviceRegistrationId(id: string): Promise<void> {
  await storage.set(STORAGE_KEYS.DEVICE_REGISTRATION_ID, id);
}

export async function getDeviceRegistrationId(): Promise<string | null> {
  return storage.get(STORAGE_KEYS.DEVICE_REGISTRATION_ID);
}

// ── Notification tap handler ─────────────────────────────────────
// Parse the deep link from the notification data and navigate.
export function handleNotificationTap(
  response: Notifications.NotificationResponse
): void {
  const data = response.notification.request.content.data as
    | Partial<PushNotificationData>
    | undefined;

  if (data?.deepLink) {
    // Small delay to let the app fully mount if launched from killed state
    setTimeout(() => {
      router.push(data.deepLink as any);
    }, 100);
  }
}

// ── Listener subscriptions ───────────────────────────────────────
// Returns cleanup functions to call on unmount.

export type NotificationReceivedCallback = (
  notification: Notifications.Notification
) => void;

export function addForegroundListener(
  callback: NotificationReceivedCallback
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addTapListener(): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(
    handleNotificationTap
  );
}

// ── Check last notification (cold start) ─────────────────────────
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return Notifications.getLastNotificationResponseAsync();
}

// ── Badge management ─────────────────────────────────────────────
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// ── Device info helpers ──────────────────────────────────────────
export function getDeviceInfo() {
  return {
    deviceId: Device.modelId ?? undefined,
    platform: Platform.OS as 'ios' | 'android' | 'web',
    osVersion: Platform.Version?.toString(),
    deviceName: Device.deviceName ?? undefined,
    appVersion: Constants.expoConfig?.version,
  };
}
