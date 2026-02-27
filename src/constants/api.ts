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
} as const;
