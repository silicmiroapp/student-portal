import api from '@/services/api';
import { ENV } from '@/config/env';
import { ENDPOINTS } from '@/constants/api';
import type {
  InboxNotification,
  NotificationListResponse,
  UnreadCountResponse,
  NotificationPreferences,
  RegisterDeviceRequest,
  DeviceRegistration,
  Announcement,
  AnnouncementListResponse,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementStatsResponse,
  NotificationType,
} from '@/types/notifications';
import {
  MOCK_NOTIFICATIONS,
  MOCK_NOTIFICATION_PREFERENCES,
  MOCK_ANNOUNCEMENTS,
} from '@/mocks/notifications';

const MOCK_DELAY = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Mutable mock state (persists within session) ─────────────────
let mockNotifications = structuredClone(MOCK_NOTIFICATIONS);
let mockPreferences = structuredClone(MOCK_NOTIFICATION_PREFERENCES);
let mockAnnouncements = structuredClone(MOCK_ANNOUNCEMENTS);

// ── Mock API ─────────────────────────────────────────────────────

const mockApi = {
  // ── Device registration ──────────────────────────────────
  async registerDevice(req: RegisterDeviceRequest): Promise<DeviceRegistration> {
    await delay(MOCK_DELAY);
    return {
      id: `device-${Date.now()}`,
      userId: 'user-1',
      expoPushToken: req.expoPushToken,
      deviceId: req.deviceId,
      platform: req.platform,
      appVersion: req.appVersion,
      osVersion: req.osVersion,
      deviceName: req.deviceName,
      isActive: true,
      lastUsedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  },

  async unregisterDevice(_deviceId: string): Promise<void> {
    await delay(MOCK_DELAY);
  },

  // ── Inbox ────────────────────────────────────────────────
  async getNotifications(params: {
    page?: number;
    limit?: number;
    type?: NotificationType;
    unread?: boolean;
  }): Promise<NotificationListResponse> {
    await delay(MOCK_DELAY);
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    let filtered = mockNotifications.filter((n) => !n.dismissedAt);
    if (params.type) {
      filtered = filtered.filter((n) => n.type === params.type);
    }
    if (params.unread) {
      filtered = filtered.filter((n) => !n.isRead);
    }

    // Sort newest first
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return {
      notifications: structuredClone(items),
      total: filtered.length,
      page,
      limit,
      hasMore: start + limit < filtered.length,
    };
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    await delay(300);
    const count = mockNotifications.filter(
      (n) => !n.isRead && !n.dismissedAt
    ).length;
    return { count };
  },

  async markAsRead(id: string): Promise<void> {
    await delay(300);
    const notif = mockNotifications.find((n) => n.id === id);
    if (notif && !notif.isRead) {
      notif.isRead = true;
      notif.readAt = new Date().toISOString();
    }
  },

  async markAllAsRead(): Promise<void> {
    await delay(MOCK_DELAY);
    const now = new Date().toISOString();
    for (const n of mockNotifications) {
      if (!n.isRead && !n.dismissedAt) {
        n.isRead = true;
        n.readAt = now;
      }
    }
  },

  async dismissNotification(id: string): Promise<void> {
    await delay(300);
    const notif = mockNotifications.find((n) => n.id === id);
    if (notif) {
      notif.dismissedAt = new Date().toISOString();
    }
  },

  // ── Preferences ──────────────────────────────────────────
  async getPreferences(): Promise<NotificationPreferences> {
    await delay(MOCK_DELAY);
    return structuredClone(mockPreferences);
  },

  async updatePreferences(
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    await delay(MOCK_DELAY);
    mockPreferences = { ...mockPreferences, ...prefs };
    return structuredClone(mockPreferences);
  },

  // ── Admin announcements ──────────────────────────────────
  async createAnnouncement(
    req: CreateAnnouncementRequest
  ): Promise<Announcement> {
    await delay(MOCK_DELAY);
    const announcement: Announcement = {
      id: `ann-${Date.now()}`,
      title: req.title,
      body: req.body,
      priority: req.priority,
      status: req.scheduledAt ? 'scheduled' : 'published',
      recipients: req.recipients,
      recipientCount: req.recipients === 'all' ? 1250 : (req.recipients as string[]).length,
      scheduledAt: req.scheduledAt,
      publishedAt: req.scheduledAt ? undefined : new Date().toISOString(),
      expiresAt: req.expiresAt,
      authorId: 'admin-1',
      authorRole: 'admin',
      authorName: 'Portal Admin',
      createdAt: new Date().toISOString(),
    };
    mockAnnouncements.unshift(announcement);

    // Also add to inbox for all users if published immediately
    if (announcement.status === 'published') {
      const inboxItem: InboxNotification = {
        id: `notif-${Date.now()}`,
        userId: 'user-1',
        type: 'announcement',
        eventName: 'announcement.published',
        title: announcement.title,
        body: announcement.body,
        deepLink: `/(main)/notifications/notif-${Date.now()}`,
        referenceId: announcement.id,
        referenceType: 'announcement',
        priority: announcement.priority,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      mockNotifications.unshift(inboxItem);
    }

    return structuredClone(announcement);
  },

  async getAnnouncements(params?: {
    page?: number;
    limit?: number;
  }): Promise<AnnouncementListResponse> {
    await delay(MOCK_DELAY);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const start = (page - 1) * limit;
    const items = mockAnnouncements.slice(start, start + limit);

    return {
      announcements: structuredClone(items),
      total: mockAnnouncements.length,
      page,
      limit,
    };
  },

  async getAnnouncement(id: string): Promise<Announcement> {
    await delay(MOCK_DELAY);
    const ann = mockAnnouncements.find((a) => a.id === id);
    if (!ann) throw new Error('Announcement not found');
    return structuredClone(ann);
  },

  async updateAnnouncement(
    id: string,
    req: UpdateAnnouncementRequest
  ): Promise<Announcement> {
    await delay(MOCK_DELAY);
    const ann = mockAnnouncements.find((a) => a.id === id);
    if (!ann) throw new Error('Announcement not found');
    if (ann.status === 'published') throw new Error('Cannot edit a published announcement');

    if (req.title !== undefined) ann.title = req.title;
    if (req.body !== undefined) ann.body = req.body;
    if (req.priority !== undefined) ann.priority = req.priority;
    if (req.scheduledAt !== undefined) ann.scheduledAt = req.scheduledAt;
    if (req.expiresAt !== undefined) ann.expiresAt = req.expiresAt;

    return structuredClone(ann);
  },

  async cancelAnnouncement(id: string): Promise<void> {
    await delay(MOCK_DELAY);
    const ann = mockAnnouncements.find((a) => a.id === id);
    if (!ann) throw new Error('Announcement not found');
    ann.status = 'cancelled';
  },

  async getAnnouncementStats(): Promise<AnnouncementStatsResponse> {
    await delay(MOCK_DELAY);
    return {
      totalSent: mockAnnouncements.filter((a) => a.status === 'published').length,
      totalDelivered: 2400,
      totalFailed: 12,
      broadcastsToday: 1,
      maxBroadcastsPerDay: 3,
    };
  },
};

// ── Real API ─────────────────────────────────────────────────────

const realApi = {
  async registerDevice(req: RegisterDeviceRequest): Promise<DeviceRegistration> {
    const { data } = await api.post<DeviceRegistration>(
      ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE,
      req
    );
    return data;
  },

  async unregisterDevice(deviceId: string): Promise<void> {
    await api.delete(ENDPOINTS.NOTIFICATIONS.UNREGISTER_DEVICE(deviceId));
  },

  async getNotifications(params: {
    page?: number;
    limit?: number;
    type?: NotificationType;
    unread?: boolean;
  }): Promise<NotificationListResponse> {
    const { data } = await api.get<NotificationListResponse>(
      ENDPOINTS.NOTIFICATIONS.LIST,
      { params }
    );
    return data;
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const { data } = await api.get<UnreadCountResponse>(
      ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    return data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  async markAllAsRead(): Promise<void> {
    await api.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  async dismissNotification(id: string): Promise<void> {
    await api.delete(ENDPOINTS.NOTIFICATIONS.DISMISS(id));
  },

  async getPreferences(): Promise<NotificationPreferences> {
    const { data } = await api.get<NotificationPreferences>(
      ENDPOINTS.NOTIFICATIONS.PREFERENCES
    );
    return data;
  },

  async updatePreferences(
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const { data } = await api.put<NotificationPreferences>(
      ENDPOINTS.NOTIFICATIONS.PREFERENCES,
      prefs
    );
    return data;
  },

  async createAnnouncement(req: CreateAnnouncementRequest): Promise<Announcement> {
    const { data } = await api.post<Announcement>(
      ENDPOINTS.ADMIN.ANNOUNCEMENTS,
      req
    );
    return data;
  },

  async getAnnouncements(params?: {
    page?: number;
    limit?: number;
  }): Promise<AnnouncementListResponse> {
    const { data } = await api.get<AnnouncementListResponse>(
      ENDPOINTS.ADMIN.ANNOUNCEMENTS,
      { params }
    );
    return data;
  },

  async getAnnouncement(id: string): Promise<Announcement> {
    const { data } = await api.get<Announcement>(
      ENDPOINTS.ADMIN.ANNOUNCEMENT_DETAIL(id)
    );
    return data;
  },

  async updateAnnouncement(
    id: string,
    req: UpdateAnnouncementRequest
  ): Promise<Announcement> {
    const { data } = await api.patch<Announcement>(
      ENDPOINTS.ADMIN.ANNOUNCEMENT_DETAIL(id),
      req
    );
    return data;
  },

  async cancelAnnouncement(id: string): Promise<void> {
    await api.delete(ENDPOINTS.ADMIN.ANNOUNCEMENT_DETAIL(id));
  },

  async getAnnouncementStats(): Promise<AnnouncementStatsResponse> {
    const { data } = await api.get<AnnouncementStatsResponse>(
      ENDPOINTS.ADMIN.NOTIFICATION_STATS
    );
    return data;
  },
};

// ── Export based on environment ───────────────────────────────────
export const notificationsApi = ENV.USE_MOCK_API ? mockApi : realApi;
