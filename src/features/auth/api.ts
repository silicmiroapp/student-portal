import api from '@/services/api';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';

// ─── Configuration ────────────────────────────────────────────
// Set to false to use real API endpoints
const USE_MOCK = true;

// ─── Mock Implementation ──────────────────────────────────────
const MOCK_DELAY = 800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    await delay(MOCK_DELAY);

    if (data.email === 'fail@test.com') {
      throw new Error('Invalid email or password');
    }

    // Demo account: demo@student.edu / demo123
    const isDemoAccount = data.email === 'demo@student.edu';

    return {
      user: {
        id: '1',
        email: isDemoAccount ? 'demo@student.edu' : data.email,
        name: isDemoAccount ? 'Marko Petrovic' : 'Test User',
        studentId: 'BUS-2025-0142',
        program: 'Bachelor of Business Administration',
        enrollmentYear: 2025,
        lmsUsername: isDemoAccount ? 'mpetrovic' : 'testuser_lms',
      },
      accessToken: `mock-access-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
    };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    await delay(MOCK_DELAY);

    if (data.email === 'taken@test.com') {
      throw new Error('An account with this email already exists');
    }

    return {
      user: {
        id: '2',
        email: data.email,
        name: data.name,
        studentId: 'BUS-2025-0200',
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
// Uses the Axios instance from services/api.ts which handles
// token injection, refresh, and error normalization automatically.
const realApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
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
// Swap between mock and real by changing USE_MOCK above
export const authApi = USE_MOCK ? mockApi : realApi;
