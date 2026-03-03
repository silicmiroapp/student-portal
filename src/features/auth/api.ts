import api from '@/services/api';
import { ENV } from '@/config/env';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';
import { getDefaultPermissions } from '@/services/rbac';

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

// Mock credential table — in production, auth is server-side only.
// SECURITY: These only exist in mock mode, blocked in production by ENV checks.
const MOCK_ACCOUNTS: Record<string, { password: string; response: AuthResponse }> = {
  'demo@student.edu': {
    password: 'Demo1234',
    response: {
      user: {
        id: '1',
        email: 'demo@student.edu',
        name: 'Demo User',
        role: 'user',
        permissions: getDefaultPermissions('user'),
        studentId: 'BUS-2025-0142',
        program: 'Bachelor of Business Administration',
        enrollmentYear: 2025,
        lmsUsername: 'demo',
      },
      accessToken: '',
      refreshToken: '',
    },
  },
  'admin@portal.edu': {
    password: 'Admin1234',
    response: {
      user: {
        id: '0',
        email: 'admin@portal.edu',
        name: 'System Admin',
        role: 'super_admin',
        permissions: getDefaultPermissions('super_admin'),
      },
      accessToken: '',
      refreshToken: '',
    },
  },
  'admin2@portal.edu': {
    password: 'Admin1234',
    response: {
      user: {
        id: '10',
        email: 'admin2@portal.edu',
        name: 'Portal Admin',
        role: 'admin',
        permissions: getDefaultPermissions('admin'),
      },
      accessToken: '',
      refreshToken: '',
    },
  },
  'support@portal.edu': {
    password: 'Support1234',
    response: {
      user: {
        id: '11',
        email: 'support@portal.edu',
        name: 'Support Agent',
        role: 'support_admin',
        permissions: getDefaultPermissions('support_admin'),
      },
      accessToken: '',
      refreshToken: '',
    },
  },
};

const mockApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    checkRateLimit();
    await delay(MOCK_DELAY);

    const email = data.email.toLowerCase().trim();
    const account = MOCK_ACCOUNTS[email];

    // Generic error — do NOT reveal whether the email exists
    if (!account || account.password !== data.password) {
      throw new Error('Invalid email or password');
    }

    return {
      ...account.response,
      user: { ...account.response.user },
      accessToken: `mock-access-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
    };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    await delay(MOCK_DELAY);

    // Registration always creates a regular user — never admin
    return {
      user: {
        id: `${Date.now()}`,
        email: data.email,
        name: data.name,
        role: 'user',
        permissions: getDefaultPermissions('user'),
        studentId: `STU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        program: 'Bachelor of Business Administration',
        enrollmentYear: new Date().getFullYear(),
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
