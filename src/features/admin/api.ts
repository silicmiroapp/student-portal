import api from '@/services/api';
import { ENV } from '@/config/env';
import { ENDPOINTS } from '@/constants/api';
import type {
  UserRecord,
  SystemActivity,
  AdminLog,
  AdminStats,
} from '@/types/admin';
import type { FinancialPlan } from '@/types/finance';
import {
  MOCK_USERS,
  MOCK_SYSTEM_ACTIVITY,
  MOCK_ADMIN_LOGS,
  getMockAdminStats,
} from '@/mocks/admin';
import { MOCK_FINANCIAL_PLAN } from '@/mocks/finance';

const MOCK_DELAY = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Mutable mock state (persists within session) ──────────────
let mockUsers = structuredClone(MOCK_USERS);
let mockActivity = structuredClone(MOCK_SYSTEM_ACTIVITY);
let mockLogs = structuredClone(MOCK_ADMIN_LOGS);

function addMockLog(action: string, targetUserId?: string, targetEmail?: string, details?: string) {
  mockLogs.unshift({
    id: `log-${Date.now()}`,
    adminUserId: '0',
    adminEmail: 'admin@portal.edu',
    action,
    targetUserId,
    targetEmail,
    timestamp: new Date().toISOString(),
    details,
  });
}

// ── Mock API ──────────────────────────────────────────────────
// SECURITY: In production, every admin endpoint validates the
// caller's role server-side via the JWT. The mock simulates this
// by simply returning data — real endpoints MUST reject non-admin.

const mockApi = {
  async getStats(): Promise<AdminStats> {
    await delay(MOCK_DELAY);
    return getMockAdminStats();
  },

  async getUsers(): Promise<UserRecord[]> {
    await delay(MOCK_DELAY);
    return structuredClone(mockUsers);
  },

  async toggleUserStatus(userId: string): Promise<UserRecord> {
    await delay(MOCK_DELAY);
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    if (user.role === 'admin') throw new Error('Cannot modify admin account');

    user.isActive = !user.isActive;
    const action = user.isActive ? 'Enabled user account' : 'Disabled user account';
    addMockLog(action, user.id, user.email);

    return structuredClone(user);
  },

  async getSystemActivity(): Promise<SystemActivity[]> {
    await delay(MOCK_DELAY);
    return structuredClone(mockActivity);
  },

  async getAdminLogs(): Promise<AdminLog[]> {
    await delay(MOCK_DELAY);
    return structuredClone(mockLogs);
  },

  async getStudentFinance(studentId: string): Promise<FinancialPlan> {
    await delay(MOCK_DELAY);
    addMockLog('Viewed student finance data', studentId, mockUsers.find((u) => u.id === studentId)?.email);
    return structuredClone(MOCK_FINANCIAL_PLAN);
  },
};

// ── Real API ──────────────────────────────────────────────────
const realApi = {
  async getStats(): Promise<AdminStats> {
    const { data } = await api.get<AdminStats>(ENDPOINTS.ADMIN.STATS);
    return data;
  },

  async getUsers(): Promise<UserRecord[]> {
    const { data } = await api.get<UserRecord[]>(ENDPOINTS.ADMIN.USERS);
    return data;
  },

  async toggleUserStatus(userId: string): Promise<UserRecord> {
    const { data } = await api.post<UserRecord>(ENDPOINTS.ADMIN.USER_TOGGLE(userId));
    return data;
  },

  async getSystemActivity(): Promise<SystemActivity[]> {
    const { data } = await api.get<SystemActivity[]>(ENDPOINTS.ADMIN.ACTIVITY);
    return data;
  },

  async getAdminLogs(): Promise<AdminLog[]> {
    const { data } = await api.get<AdminLog[]>(ENDPOINTS.ADMIN.LOGS);
    return data;
  },

  async getStudentFinance(studentId: string): Promise<FinancialPlan> {
    const { data } = await api.get<FinancialPlan>(ENDPOINTS.ADMIN.STUDENT_FINANCE(studentId));
    return data;
  },
};

export const adminApi = ENV.USE_MOCK_API ? mockApi : realApi;
