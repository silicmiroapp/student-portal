import api from '@/services/api';
import { ENV } from '@/config/env';
import { ENDPOINTS } from '@/constants/api';
import type {
  UserRecord,
  SystemActivity,
  AdminStats,
  ResetPasswordRequest,
  ChangeRoleRequest,
  SuspendUserRequest,
  SendAnnouncementRequest,
  SendNotificationRequest,
} from '@/types/admin';
import type { AdminLog } from '@/types/admin';
import type { SystemSettings, UserRole } from '@/types/rbac';
import type { FinancialPlan } from '@/types/finance';
import { getDefaultPermissions } from '@/services/rbac';
import {
  MOCK_USERS,
  MOCK_SYSTEM_ACTIVITY,
  MOCK_ADMIN_LOGS,
  MOCK_SYSTEM_SETTINGS,
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
let mockSettings = structuredClone(MOCK_SYSTEM_SETTINGS);

function addMockLog(
  action: AdminLog['action'],
  actorId: string,
  actorEmail: string,
  actorRole: UserRole,
  targetUserId?: string,
  targetEmail?: string,
  details?: string,
  previousValue?: string,
  newValue?: string
) {
  mockLogs.unshift({
    id: `log-${Date.now()}`,
    actorId,
    actorEmail,
    actorRole,
    action,
    targetUserId,
    targetEmail,
    timestamp: new Date().toISOString(),
    details,
    previousValue,
    newValue,
    ipAddress: '127.0.0.1',
  });
}

// Default actor for mock — the logged-in admin.
// In production, the server determines this from the JWT.
const MOCK_ACTOR = { id: '0', email: 'admin@portal.edu', role: 'super_admin' as UserRole };

function findUser(userId: string): UserRecord {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) throw new Error('User not found');
  return user;
}

// ── Mock API ──────────────────────────────────────────────────
// SECURITY: In production, every admin endpoint validates the
// caller's role AND permissions server-side via the JWT.
// The mock simulates the expected contract.

const mockApi = {
  // ── Stats ────────────────────────────────────────────────
  async getStats(): Promise<AdminStats> {
    await delay(MOCK_DELAY);
    return getMockAdminStats();
  },

  // ── User Management ──────────────────────────────────────
  async getUsers(): Promise<UserRecord[]> {
    await delay(MOCK_DELAY);
    return structuredClone(mockUsers);
  },

  async toggleUserStatus(userId: string): Promise<UserRecord> {
    await delay(MOCK_DELAY);
    const user = findUser(userId);
    if (user.role !== 'user') throw new Error('Cannot modify admin accounts via toggle');

    user.isActive = !user.isActive;
    const action = user.isActive ? 'user.activated' : 'user.deactivated';
    addMockLog(action, MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role, user.id, user.email);

    return structuredClone(user);
  },

  async lockUser(userId: string): Promise<UserRecord> {
    await delay(MOCK_DELAY);
    const user = findUser(userId);
    if (user.isLocked) throw new Error('User is already locked');

    user.isLocked = true;
    addMockLog('user.locked', MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role, user.id, user.email);

    mockActivity.unshift({
      id: `act-${Date.now()}`,
      type: 'account_locked',
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
      details: `Locked by ${MOCK_ACTOR.email}`,
    });

    return structuredClone(user);
  },

  async unlockUser(userId: string): Promise<UserRecord> {
    await delay(MOCK_DELAY);
    const user = findUser(userId);
    if (!user.isLocked) throw new Error('User is not locked');

    user.isLocked = false;
    addMockLog('user.unlocked', MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role, user.id, user.email);

    mockActivity.unshift({
      id: `act-${Date.now()}`,
      type: 'account_unlocked',
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
      details: `Unlocked by ${MOCK_ACTOR.email}`,
    });

    return structuredClone(user);
  },

  async suspendUser(userId: string, request: SuspendUserRequest): Promise<UserRecord> {
    await delay(MOCK_DELAY);
    const user = findUser(userId);
    if (user.isSuspended) throw new Error('User is already suspended');

    user.isSuspended = true;
    user.isActive = false;
    addMockLog(
      'user.suspended',
      MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role,
      user.id, user.email,
      request.reason
    );

    return structuredClone(user);
  },

  async unsuspendUser(userId: string): Promise<UserRecord> {
    await delay(MOCK_DELAY);
    const user = findUser(userId);
    if (!user.isSuspended) throw new Error('User is not suspended');

    user.isSuspended = false;
    user.isActive = true;
    addMockLog('user.activated', MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role, user.id, user.email, 'Unsuspended');

    return structuredClone(user);
  },

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await delay(MOCK_DELAY);
    const user = findUser(request.userId);

    user.mustChangePassword = true;
    addMockLog(
      'user.password_reset',
      MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role,
      user.id, user.email,
      `Password reset. Notify: ${request.notifyUser}. Force change: yes.`
    );

    mockActivity.unshift({
      id: `act-${Date.now()}`,
      type: 'password_reset',
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
      details: `Password reset by ${MOCK_ACTOR.email}`,
    });
  },

  async changeUserRole(request: ChangeRoleRequest): Promise<UserRecord> {
    await delay(MOCK_DELAY);
    const user = findUser(request.userId);
    const previousRole = user.role;

    user.role = request.newRole;
    user.permissions = getDefaultPermissions(request.newRole);

    addMockLog(
      'user.role_changed',
      MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role,
      user.id, user.email,
      request.reason,
      previousRole,
      request.newRole
    );

    mockActivity.unshift({
      id: `act-${Date.now()}`,
      type: 'role_changed',
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
      details: `Role changed from ${previousRole} to ${request.newRole} by ${MOCK_ACTOR.email}`,
    });

    return structuredClone(user);
  },

  async forceLogout(userId: string): Promise<void> {
    await delay(MOCK_DELAY);
    const user = findUser(userId);

    addMockLog(
      'session.force_logout',
      MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role,
      user.id, user.email
    );

    mockActivity.unshift({
      id: `act-${Date.now()}`,
      type: 'session_revoked',
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
      details: `All sessions revoked by ${MOCK_ACTOR.email}`,
    });
  },

  async revokeSessions(userId: string): Promise<void> {
    await delay(MOCK_DELAY);
    const user = findUser(userId);

    addMockLog(
      'session.revoked',
      MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role,
      user.id, user.email
    );
  },

  async toggle2FA(userId: string): Promise<UserRecord> {
    await delay(MOCK_DELAY);
    const user = findUser(userId);

    user.twoFactorEnabled = !user.twoFactorEnabled;
    addMockLog(
      'security.2fa_toggled',
      MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role,
      user.id, user.email,
      `2FA ${user.twoFactorEnabled ? 'enabled' : 'disabled'}`
    );

    return structuredClone(user);
  },

  // ── Monitoring ───────────────────────────────────────────
  async getSystemActivity(): Promise<SystemActivity[]> {
    await delay(MOCK_DELAY);
    return structuredClone(mockActivity);
  },

  async getAdminLogs(): Promise<AdminLog[]> {
    await delay(MOCK_DELAY);
    return structuredClone(mockLogs);
  },

  // ── Finance ──────────────────────────────────────────────
  async getStudentFinance(studentId: string): Promise<FinancialPlan> {
    await delay(MOCK_DELAY);
    addMockLog(
      'finance.viewed',
      MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role,
      studentId, mockUsers.find((u) => u.id === studentId)?.email
    );
    return structuredClone(MOCK_FINANCIAL_PLAN);
  },

  // ── Communication ────────────────────────────────────────
  async sendNotification(request: SendNotificationRequest): Promise<void> {
    await delay(MOCK_DELAY);
    addMockLog(
      'communication.push_sent',
      MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role,
      undefined, undefined,
      `"${request.title}" to ${request.recipients === 'all' ? 'all users' : `${request.recipients.length} users`}`
    );
  },

  async sendAnnouncement(request: SendAnnouncementRequest): Promise<void> {
    await delay(MOCK_DELAY);
    addMockLog(
      'communication.announcement_sent',
      MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role,
      undefined, undefined,
      `"${request.title}" (${request.priority} priority)`
    );
  },

  // ── System Settings (SuperAdmin only) ────────────────────
  async getSystemSettings(): Promise<SystemSettings> {
    await delay(MOCK_DELAY);
    return structuredClone(mockSettings);
  },

  async updateSystemSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    await delay(MOCK_DELAY);
    mockSettings = { ...mockSettings, ...updates };

    addMockLog(
      'system.settings_changed',
      MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role,
      undefined, undefined,
      `Settings updated: ${Object.keys(updates).join(', ')}`
    );

    return structuredClone(mockSettings);
  },

  async toggleMaintenanceMode(): Promise<SystemSettings> {
    await delay(MOCK_DELAY);
    mockSettings.maintenanceMode = !mockSettings.maintenanceMode;

    addMockLog(
      'system.maintenance_mode_toggled',
      MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role,
      undefined, undefined,
      `Maintenance mode ${mockSettings.maintenanceMode ? 'enabled' : 'disabled'}`,
      String(!mockSettings.maintenanceMode),
      String(mockSettings.maintenanceMode)
    );

    return structuredClone(mockSettings);
  },

  async toggleFeatureFlag(flag: string): Promise<SystemSettings> {
    await delay(MOCK_DELAY);
    const previous = mockSettings.featureFlags[flag] ?? false;
    mockSettings.featureFlags[flag] = !previous;

    addMockLog(
      'system.feature_flag_toggled',
      MOCK_ACTOR.id, MOCK_ACTOR.email, MOCK_ACTOR.role,
      undefined, undefined,
      `Feature flag "${flag}" ${mockSettings.featureFlags[flag] ? 'enabled' : 'disabled'}`,
      String(previous),
      String(mockSettings.featureFlags[flag])
    );

    return structuredClone(mockSettings);
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

  async lockUser(userId: string): Promise<UserRecord> {
    const { data } = await api.post<UserRecord>(ENDPOINTS.ADMIN.USER_LOCK(userId));
    return data;
  },

  async unlockUser(userId: string): Promise<UserRecord> {
    const { data } = await api.post<UserRecord>(ENDPOINTS.ADMIN.USER_UNLOCK(userId));
    return data;
  },

  async suspendUser(userId: string, request: SuspendUserRequest): Promise<UserRecord> {
    const { data } = await api.post<UserRecord>(ENDPOINTS.ADMIN.USER_SUSPEND(userId), request);
    return data;
  },

  async unsuspendUser(userId: string): Promise<UserRecord> {
    const { data } = await api.post<UserRecord>(ENDPOINTS.ADMIN.USER_UNSUSPEND(userId));
    return data;
  },

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await api.post(ENDPOINTS.ADMIN.USER_RESET_PASSWORD(request.userId), request);
  },

  async changeUserRole(request: ChangeRoleRequest): Promise<UserRecord> {
    const { data } = await api.post<UserRecord>(
      ENDPOINTS.ADMIN.USER_CHANGE_ROLE(request.userId),
      request
    );
    return data;
  },

  async forceLogout(userId: string): Promise<void> {
    await api.post(ENDPOINTS.ADMIN.USER_FORCE_LOGOUT(userId));
  },

  async revokeSessions(userId: string): Promise<void> {
    await api.post(ENDPOINTS.ADMIN.USER_REVOKE_SESSIONS(userId));
  },

  async toggle2FA(userId: string): Promise<UserRecord> {
    const { data } = await api.post<UserRecord>(ENDPOINTS.ADMIN.USER_TOGGLE_2FA(userId));
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

  async sendNotification(request: SendNotificationRequest): Promise<void> {
    await api.post(ENDPOINTS.ADMIN.SEND_NOTIFICATION, request);
  },

  async sendAnnouncement(request: SendAnnouncementRequest): Promise<void> {
    await api.post(ENDPOINTS.ADMIN.ANNOUNCEMENTS, request);
  },

  async getSystemSettings(): Promise<SystemSettings> {
    const { data } = await api.get<SystemSettings>(ENDPOINTS.ADMIN.SYSTEM_SETTINGS);
    return data;
  },

  async updateSystemSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    const { data } = await api.put<SystemSettings>(ENDPOINTS.ADMIN.SYSTEM_SETTINGS, updates);
    return data;
  },

  async toggleMaintenanceMode(): Promise<SystemSettings> {
    const { data } = await api.post<SystemSettings>(ENDPOINTS.ADMIN.MAINTENANCE_MODE);
    return data;
  },

  async toggleFeatureFlag(flag: string): Promise<SystemSettings> {
    const { data } = await api.post<SystemSettings>(ENDPOINTS.ADMIN.FEATURE_FLAGS, { flag });
    return data;
  },
};

export const adminApi = ENV.USE_MOCK_API ? mockApi : realApi;
