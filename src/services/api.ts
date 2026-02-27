import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '@/constants/api';
import { storage } from './storage';
import { securityLog } from './securityLog';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Inject auth token into every outgoing request
api.interceptors.request.use(async (config) => {
  const token = await storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track refresh state to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}> = [];

// Timeout for the pending-request queue — prevents infinite waits
const REFRESH_QUEUE_TIMEOUT_MS = 15_000;

function processPendingRequests(token: string) {
  pendingRequests.forEach((req) => req.resolve(token));
  pendingRequests = [];
}

function rejectPendingRequests(err: Error) {
  pendingRequests.forEach((req) => req.reject(err));
  pendingRequests = [];
}

// Response interceptor — handles 401s with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401, and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(normalizeError(error));
    }

    originalRequest._retry = true;

    // If already refreshing, queue this request with a timeout
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        const entry = {
          resolve: (newToken: string) => {
            clearTimeout(timer);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          },
          reject: (err: Error) => {
            clearTimeout(timer);
            reject(err);
          },
        };

        const timer = setTimeout(() => {
          const idx = pendingRequests.indexOf(entry);
          if (idx !== -1) pendingRequests.splice(idx, 1);
          reject(new Error('Token refresh timed out'));
        }, REFRESH_QUEUE_TIMEOUT_MS);

        pendingRequests.push(entry);
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await storage.get(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/refresh`,
        { refreshToken },
        { timeout: API_CONFIG.TIMEOUT }
      );

      await storage.set(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      if (data.refreshToken) {
        await storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      }

      securityLog.tokenRefresh();

      // Retry the original request + all queued requests with new token
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      processPendingRequests(data.accessToken);

      return api(originalRequest);
    } catch (refreshError) {
      securityLog.tokenRefreshFailure(
        refreshError instanceof Error ? refreshError.message : 'Unknown error'
      );

      // Refresh failed — clear everything and force re-login
      await storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      await storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      await storage.remove(STORAGE_KEYS.USER_DATA);
      rejectPendingRequests(new Error('Session expired'));

      return Promise.reject(normalizeError(error));
    } finally {
      isRefreshing = false;
    }
  }
);

// Convert Axios errors into user-friendly messages
// SECURITY: Never expose raw server error details to the client
function normalizeError(error: AxiosError): Error {
  if (!error.response) {
    return new Error('Network error. Please check your connection.');
  }

  const status = error.response.status;
  const data = error.response.data as { message?: string } | undefined;

  // Only surface server-provided messages for client errors (4xx)
  // For 5xx, return a generic message to avoid leaking internals
  if (status >= 500) {
    return new Error('Something went wrong. Please try again later.');
  }

  const message = data?.message || `Request failed (${status})`;
  return new Error(message);
}

export default api;
