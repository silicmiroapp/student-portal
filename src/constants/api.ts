// API configuration — switch BASE_URL when connecting to a real backend
export const API_CONFIG = {
  BASE_URL: 'https://api.example.com/v1',
  TIMEOUT: 10000,
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
    DETAIL: (id: string) => `/courses/${id}`,
    CONTENT: (id: string) => `/courses/${id}/content`,
    PROGRESS: (id: string) => `/courses/${id}/progress`,
  },
  GRADES: '/grades',
  PROFILE: '/profile',
  SCHEDULE: {
    EXAMS: '/schedule/exams',
  },
} as const;
