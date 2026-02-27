import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '@/constants/api';
import { storage } from './storage';

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
let pendingRequests: Array<(token: string) => void> = [];

function processPendingRequests(token: string) {
  pendingRequests.forEach((cb) => cb(token));
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

    // If already refreshing, queue this request to retry after refresh completes
    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await storage.get(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) throw new Error('No refresh token');

      // Call the refresh endpoint (swap URL when backend is ready)
      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      await storage.set(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      if (data.refreshToken) {
        await storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      }

      // Retry the original request + all queued requests with new token
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      processPendingRequests(data.accessToken);

      return api(originalRequest);
    } catch {
      // Refresh failed — clear everything and force re-login
      await storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      await storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      await storage.remove(STORAGE_KEYS.USER_DATA);
      pendingRequests = [];

      // The auth store's hydrate check will detect missing token and redirect
      return Promise.reject(normalizeError(error));
    } finally {
      isRefreshing = false;
    }
  }
);

// Convert Axios errors into user-friendly messages
function normalizeError(error: AxiosError): Error {
  if (!error.response) {
    return new Error('Network error. Please check your connection.');
  }

  const data = error.response.data as { message?: string } | undefined;
  const message = data?.message || `Request failed (${error.response.status})`;

  return new Error(message);
}

export default api;
