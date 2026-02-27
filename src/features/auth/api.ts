import api from '@/services/api';
import { ENV } from '@/config/env';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';

// ─── Configuration ────────────────────────────────────────────
// Mock mode is controlled by environment, NOT a hardcoded flag.
// In production builds, ENV.USE_MOCK_API is always false (enforced at startup).

// ─── Client-side rate limiting ────────────────────────────────
// Prevents rapid-fire login attempts from the UI.
// This is NOT a substitute for server-side rate limiting.
const LOGIN_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 60_000,    // 1 minute
  lockoutMs: 300_000,  // 5 minute lockout after exceeding
};

let loginAttempts: number[] = [];
let lockoutUntil = 0;

function checkRateLimit(): void {
  const now = Date.now();

  if (now < lockoutUntil) {
    const remaining = Math.ceil((lockoutUntil - now) / 1000);
    throw new Error(`Too many login attempts. Try again in ${remaining} seconds.`);
  }

  // Purge attempts outside the window
  loginAttempts = loginAttempts.filter(
    (t) => now - t < LOGIN_RATE_LIMIT.windowMs
  );

  if (loginAttempts.length >= LOGIN_RATE_LIMIT.maxAttempts) {
    lockoutUntil = now + LOGIN_RATE_LIMIT.lockoutMs;
    loginAttempts = [];
    throw new Error('Too many login attempts. Please wait 5 minutes before trying again.');
  }

  loginAttempts.push(now);
}

// ─── Mock Implementation ──────────────────────────────────────
const MOCK_DELAY = 800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    checkRateLimit();
    await delay(MOCK_DELAY);

    // Generic error — do NOT reveal whether the email exists
    if (data.password.length < 8) {
      throw new Error('Invalid email or password');
    }

    return {
      user: {
        id: '1',
        email: data.email,
        name: 'Demo User',
        studentId: 'STU-2025-0001',
        program: 'Bachelor of Business Administration',
        enrollmentYear: 2025,
        lmsUsername: data.email.split('@')[0],
      },
      accessToken: `mock-access-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
    };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    await delay(MOCK_DELAY);

    return {
      user: {
        id: '2',
        email: data.email,
        name: data.name,
        studentId: 'STU-2025-0002',
        program: 'Bachelor of Business Administration',
        enrollmentYear: 2025,
        lmsUsername: data.email.split('@')[0],
      },
      accessToken: `mock-access-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
    };
  },

  async logout(): Promise<void> {
    await delay(300);
  },
};

// ─── Real API Implementation ──────────────────────────────────
const realApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    checkRateLimit();
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};

// ─── Export ───────────────────────────────────────────────────
export const authApi = ENV.USE_MOCK_API ? mockApi : realApi;
