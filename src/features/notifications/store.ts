import { create } from 'zustand';
import type {
  InboxNotification,
  NotificationPreferences,
  Announcement,
  NotificationType,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementStatsResponse,
} from '@/types/notifications';
import { notificationsApi } from './api';
import {
  getExpoPushToken,
  storeLocalToken,
  clearLocalToken,
  storeDeviceRegistrationId,
  getDeviceRegistrationId,
  getDeviceInfo,
  setupNotificationChannels,
  setBadgeCount,
} from '@/services/pushNotifications';

// ── Types ────────────────────────────────────────────────────────

interface NotificationState {
  // Inbox
  notifications: InboxNotification[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  filter: NotificationType | null;

  // Preferences
  preferences: NotificationPreferences | null;
  isLoadingPreferences: boolean;

  // Push registration
  isPushRegistered: boolean;

  // Announcements (admin)
  announcements: Announcement[];
  announcementStats: AnnouncementStatsResponse | null;
  isLoadingAnnouncements: boolean;
  announcementError: string | null;

  // Foreground notification (for toast)
  foregroundNotification: { title: string; body: string; data?: any } | null;

  // Actions
  registerForPush: () => Promise<void>;
  unregisterDevice: () => Promise<void>;
  fetchNotifications: (reset?: boolean) => Promise<void>;
  fetchMore: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  setFilter: (type: NotificationType | null) => void;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  showForegroundNotification: (title: string, body: string, data?: any) => void;
  clearForegroundNotification: () => void;

  // Admin announcement actions
  createAnnouncement: (req: CreateAnnouncementRequest) => Promise<boolean>;
  fetchAnnouncements: () => Promise<void>;
  updateAnnouncement: (id: string, req: UpdateAnnouncementRequest) => Promise<boolean>;
  cancelAnnouncement: (id: string) => Promise<boolean>;
  fetchAnnouncementStats: () => Promise<void>;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

// ── Store ────────────────────────────────────────────────────────

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  page: 1,
  hasMore: true,
  filter: null,
  preferences: null,
  isLoadingPreferences: false,
  isPushRegistered: false,
  announcements: [],
  announcementStats: null,
  isLoadingAnnouncements: false,
  announcementError: null,
  foregroundNotification: null,

  // ── Push registration ────────────────────────────────────
  registerForPush: async () => {
    try {
      await setupNotificationChannels();

      const token = await getExpoPushToken();
      if (!token) return;

      await storeLocalToken(token);

      const deviceInfo = getDeviceInfo();
      const registration = await notificationsApi.registerDevice({
        expoPushToken: token,
        ...deviceInfo,
      });

      await storeDeviceRegistrationId(registration.id);
      set({ isPushRegistered: true });
    } catch (err) {
      console.error('Push registration failed:', err);
    }
  },

  unregisterDevice: async () => {
    try {
      const registrationId = await getDeviceRegistrationId();
      if (registrationId) {
        await notificationsApi.unregisterDevice(registrationId);
      }
      await clearLocalToken();
      set({ isPushRegistered: false });
    } catch (err) {
      console.error('Device unregistration failed:', err);
      // Still clear local token even if API fails
      await clearLocalToken();
    }
  },

  // ── Inbox ────────────────────────────────────────────────
  fetchNotifications: async (reset = true) => {
    const { filter } = get();
    set(reset ? { isLoading: true, error: null, page: 1 } : {});

    try {
      const res = await notificationsApi.getNotifications({
        page: 1,
        limit: 20,
        type: filter ?? undefined,
      });
      set({
        notifications: res.notifications,
        hasMore: res.hasMore,
        page: 1,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to load notifications.'),
        isLoading: false,
      });
    }
  },

  fetchMore: async () => {
    const { page, hasMore, isLoadingMore, filter } = get();
    if (!hasMore || isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      const nextPage = page + 1;
      const res = await notificationsApi.getNotifications({
        page: nextPage,
        limit: 20,
        type: filter ?? undefined,
      });
      set((state) => ({
        notifications: [...state.notifications, ...res.notifications],
        hasMore: res.hasMore,
        page: nextPage,
        isLoadingMore: false,
      }));
    } catch {
      set({ isLoadingMore: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      set({ unreadCount: res.count });
      await setBadgeCount(res.count);
    } catch {
      // Non-critical
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
      const newCount = get().unreadCount;
      await setBadgeCount(newCount);
    } catch {
      // Non-critical — will sync on next fetch
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: true,
          readAt: n.readAt ?? new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
      await setBadgeCount(0);
    } catch {
      // Non-critical
    }
  },

  dismissNotification: async (id: string) => {
    // Optimistic update
    const prev = get().notifications;
    const dismissed = prev.find((n) => n.id === id);
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: dismissed && !dismissed.isRead
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
    }));

    try {
      await notificationsApi.dismissNotification(id);
    } catch {
      // Revert on failure
      set({ notifications: prev });
    }
  },

  setFilter: (type) => {
    set({ filter: type });
    get().fetchNotifications(true);
  },

  // ── Preferences ──────────────────────────────────────────
  fetchPreferences: async () => {
    set({ isLoadingPreferences: true });
    try {
      const prefs = await notificationsApi.getPreferences();
      set({ preferences: prefs, isLoadingPreferences: false });
    } catch {
      set({ isLoadingPreferences: false });
    }
  },

  updatePreferences: async (prefs) => {
    try {
      const updated = await notificationsApi.updatePreferences(prefs);
      set({ preferences: updated });
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to update preferences.'));
    }
  },

  // ── Foreground toast ─────────────────────────────────────
  showForegroundNotification: (title, body, data) => {
    set({ foregroundNotification: { title, body, data } });
  },

  clearForegroundNotification: () => {
    set({ foregroundNotification: null });
  },

  // ── Admin announcements ──────────────────────────────────
  createAnnouncement: async (req) => {
    set({ isLoadingAnnouncements: true, announcementError: null });
    try {
      const ann = await notificationsApi.createAnnouncement(req);
      set((state) => ({
        announcements: [ann, ...state.announcements],
        isLoadingAnnouncements: false,
      }));
      return true;
    } catch (err) {
      set({
        announcementError: getErrorMessage(err, 'Failed to create announcement.'),
        isLoadingAnnouncements: false,
      });
      return false;
    }
  },

  fetchAnnouncements: async () => {
    set({ isLoadingAnnouncements: true, announcementError: null });
    try {
      const res = await notificationsApi.getAnnouncements();
      set({
        announcements: res.announcements,
        isLoadingAnnouncements: false,
      });
    } catch (err) {
      set({
        announcementError: getErrorMessage(err, 'Failed to load announcements.'),
        isLoadingAnnouncements: false,
      });
    }
  },

  updateAnnouncement: async (id, req) => {
    try {
      const updated = await notificationsApi.updateAnnouncement(id, req);
      set((state) => ({
        announcements: state.announcements.map((a) =>
          a.id === id ? updated : a
        ),
      }));
      return true;
    } catch (err) {
      set({
        announcementError: getErrorMessage(err, 'Failed to update announcement.'),
      });
      return false;
    }
  },

  cancelAnnouncement: async (id) => {
    try {
      await notificationsApi.cancelAnnouncement(id);
      set((state) => ({
        announcements: state.announcements.map((a) =>
          a.id === id ? { ...a, status: 'cancelled' as const } : a
        ),
      }));
      return true;
    } catch (err) {
      set({
        announcementError: getErrorMessage(err, 'Failed to cancel announcement.'),
      });
      return false;
    }
  },

  fetchAnnouncementStats: async () => {
    try {
      const stats = await notificationsApi.getAnnouncementStats();
      set({ announcementStats: stats });
    } catch {
      // Non-critical
    }
  },
}));
