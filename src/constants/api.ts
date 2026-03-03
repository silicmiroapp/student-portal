import { ENV } from '@/config/env';

// API configuration — resolved from environment variables at build time.
// NEVER hardcode secrets or real URLs here.
export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  TIMEOUT: ENV.API_TIMEOUT,
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
} as const;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  DASHBOARD: '/dashboard',
  COURSES: {
    LIST: '/courses',
    DETAIL: (id: string) => `/courses/${encodeURIComponent(id)}`,
    CONTENT: (id: string) => `/courses/${encodeURIComponent(id)}/content`,
    PROGRESS: (id: string) => `/courses/${encodeURIComponent(id)}/progress`,
  },
  GRADES: '/grades',
  PROFILE: '/profile',
  SCHEDULE: {
    EXAMS: '/schedule/exams',
  },
  FINANCE: {
    PLAN: '/finance/plan',
    SUMMARY: '/finance/summary',
    PAY: (installmentId: string) =>
      `/finance/installments/${encodeURIComponent(installmentId)}/pay`,
  },
  ADMIN: {
    // User management
    USERS: '/admin/users',
    USER_DETAIL: (id: string) => `/admin/users/${encodeURIComponent(id)}`,
    USER_TOGGLE: (id: string) => `/admin/users/${encodeURIComponent(id)}/toggle`,
    USER_LOCK: (id: string) => `/admin/users/${encodeURIComponent(id)}/lock`,
    USER_UNLOCK: (id: string) => `/admin/users/${encodeURIComponent(id)}/unlock`,
    USER_SUSPEND: (id: string) => `/admin/users/${encodeURIComponent(id)}/suspend`,
    USER_UNSUSPEND: (id: string) => `/admin/users/${encodeURIComponent(id)}/unsuspend`,
    USER_RESET_PASSWORD: (id: string) => `/admin/users/${encodeURIComponent(id)}/reset-password`,
    USER_CHANGE_ROLE: (id: string) => `/admin/users/${encodeURIComponent(id)}/role`,
    USER_FORCE_LOGOUT: (id: string) => `/admin/users/${encodeURIComponent(id)}/force-logout`,
    USER_REVOKE_SESSIONS: (id: string) => `/admin/users/${encodeURIComponent(id)}/revoke-sessions`,
    USER_TOGGLE_2FA: (id: string) => `/admin/users/${encodeURIComponent(id)}/toggle-2fa`,

    // Monitoring
    ACTIVITY: '/admin/activity',
    LOGS: '/admin/logs',
    STATS: '/admin/stats',
    AUDIT_TRAIL: '/admin/audit-trail',

    // Finance
    STUDENT_FINANCE: (studentId: string) =>
      `/admin/finance/${encodeURIComponent(studentId)}`,

    // Communication
    SEND_NOTIFICATION: '/admin/notifications/send',
    SEND_ANNOUNCEMENT: '/admin/announcements/send',
    SEND_DIRECT_MESSAGE: '/admin/messages/send',

    // System (SuperAdmin only)
    SYSTEM_SETTINGS: '/admin/system/settings',
    FEATURE_FLAGS: '/admin/system/feature-flags',
    MAINTENANCE_MODE: '/admin/system/maintenance',
  },
} as const;
