// ─── Notification Type Definitions ──────────────────────────────
// Types for the push notification + in-app inbox system.

// ── Notification categories ──────────────────────────────────────
export type NotificationType = 'finance' | 'grades' | 'announcement';

export type NotificationEventName =
  // Finance events
  | 'finance.invoice_created'
  | 'finance.due_date_approaching_7d'
  | 'finance.due_date_approaching_1d'
  | 'finance.installment_overdue'
  | 'finance.payment_failed'
  | 'finance.payment_confirmed'
  // Grade events
  | 'grades.grade_published'
  | 'grades.grade_updated'
  | 'grades.results_released'
  // Announcement events
  | 'announcement.published';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type DeliveryChannel = 'push' | 'email' | 'inbox';
export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'skipped';

// ── In-app inbox notification ────────────────────────────────────
export interface InboxNotification {
  id: string;
  userId: string;
  type: NotificationType;
  eventName: NotificationEventName;
  title: string;
  body: string;
  deepLink?: string;
  referenceId?: string;
  referenceType?: string;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  dismissedAt?: string;
  createdAt: string;
}

// ── Device registration ──────────────────────────────────────────
export interface DeviceRegistration {
  id: string;
  userId: string;
  expoPushToken: string;
  deviceId?: string;
  platform: 'ios' | 'android' | 'web';
  appVersion?: string;
  osVersion?: string;
  deviceName?: string;
  isActive: boolean;
  lastUsedAt: string;
  createdAt: string;
}

export interface RegisterDeviceRequest {
  expoPushToken: string;
  deviceId?: string;
  platform: 'ios' | 'android' | 'web';
  appVersion?: string;
  osVersion?: string;
  deviceName?: string;
}

// ── Notification preferences ─────────────────────────────────────
export interface NotificationPreferences {
  pushEnabled: boolean;
  financePush: boolean;
  gradesPush: boolean;
  announcementsPush: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;   // HH:mm format
  timezone: string;
}

// ── Announcements ────────────────────────────────────────────────
export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'cancelled';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  status: AnnouncementStatus;
  recipients: 'all' | string[];
  recipientCount?: number;
  scheduledAt?: string;
  publishedAt?: string;
  expiresAt?: string;
  authorId: string;
  authorRole: string;
  authorName?: string;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  body: string;
  priority: NotificationPriority;
  recipients: 'all' | string[];
  scheduledAt?: string;
  expiresAt?: string;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  body?: string;
  priority?: NotificationPriority;
  scheduledAt?: string;
  expiresAt?: string;
}

// ── Delivery event log ───────────────────────────────────────────
export interface NotificationDeliveryEvent {
  id: string;
  notificationId?: string;
  userId: string;
  deviceId?: string;
  eventType: NotificationEventName;
  channel: DeliveryChannel;
  status: DeliveryStatus;
  expoTicketId?: string;
  errorMessage?: string;
  idempotencyKey: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: string;
  createdAt: string;
}

// ── API response types ───────────────────────────────────────────
export interface NotificationListResponse {
  notifications: InboxNotification[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

export interface AnnouncementListResponse {
  announcements: Announcement[];
  total: number;
  page: number;
  limit: number;
}

export interface AnnouncementStatsResponse {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  broadcastsToday: number;
  maxBroadcastsPerDay: number;
}

// ── Push notification data payload ───────────────────────────────
// This is the `data` field inside the Expo push notification payload.
export interface PushNotificationData {
  type: NotificationType;
  deepLink: string;
  notificationId?: string;
  eventName?: NotificationEventName;
}

// ── Android notification channels ────────────────────────────────
export const NOTIFICATION_CHANNELS = {
  PAYMENT_REMINDERS: {
    id: 'payment-reminders',
    name: 'Payment Reminders',
    importance: 4, // HIGH
    description: 'Reminders about upcoming and overdue payments',
  },
  ACADEMIC_UPDATES: {
    id: 'academic-updates',
    name: 'Academic Updates',
    importance: 3, // DEFAULT
    description: 'Grade postings and academic notifications',
  },
  ANNOUNCEMENTS: {
    id: 'announcements',
    name: 'Announcements',
    importance: 3, // DEFAULT
    description: 'Admin announcements and general updates',
  },
} as const;
