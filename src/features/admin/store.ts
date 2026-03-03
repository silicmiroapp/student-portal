import { create } from 'zustand';
import type {
  UserRecord,
  SystemActivity,
  AdminLog,
  AdminStats,
  ResetPasswordRequest,
  ChangeRoleRequest,
  SuspendUserRequest,
  SendAnnouncementRequest,
  SendNotificationRequest,
} from '@/types/admin';
import type { SystemSettings } from '@/types/rbac';
import type { FinancialPlan } from '@/types/finance';
import { adminApi } from './api';

interface AdminState {
  stats: AdminStats | null;
  users: UserRecord[];
  activity: SystemActivity[];
  logs: AdminLog[];
  studentFinance: FinancialPlan | null;
  systemSettings: SystemSettings | null;

  isLoading: boolean;
  isToggling: string | null;
  /** Tracks which user is being acted on (for lock/unlock/suspend buttons) */
  isActingOn: string | null;
  error: string | null;
  successMessage: string | null;

  // ── Fetch operations ─────────────────────────────────────
  fetchStats: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchActivity: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchStudentFinance: (studentId: string) => Promise<void>;
  fetchSystemSettings: () => Promise<void>;

  // ── User management ──────────────────────────────────────
  toggleUserStatus: (userId: string) => Promise<void>;
  lockUser: (userId: string) => Promise<void>;
  unlockUser: (userId: string) => Promise<void>;
  suspendUser: (userId: string, request: SuspendUserRequest) => Promise<void>;
  unsuspendUser: (userId: string) => Promise<void>;
  resetPassword: (request: ResetPasswordRequest) => Promise<void>;
  changeUserRole: (request: ChangeRoleRequest) => Promise<void>;
  forceLogout: (userId: string) => Promise<void>;
  revokeSessions: (userId: string) => Promise<void>;
  toggle2FA: (userId: string) => Promise<void>;

  // ── Communication ────────────────────────────────────────
  sendNotification: (request: SendNotificationRequest) => Promise<void>;
  sendAnnouncement: (request: SendAnnouncementRequest) => Promise<void>;

  // ── System settings ──────────────────────────────────────
  updateSystemSettings: (updates: Partial<SystemSettings>) => Promise<void>;
  toggleMaintenanceMode: () => Promise<void>;
  toggleFeatureFlag: (flag: string) => Promise<void>;

  // ── Utilities ────────────────────────────────────────────
  clearError: () => void;
  clearSuccessMessage: () => void;
  clearStudentFinance: () => void;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

/** Update a single user in the users array */
function updateUserInList(users: UserRecord[], updated: UserRecord): UserRecord[] {
  return users.map((u) => (u.id === updated.id ? updated : u));
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  users: [],
  activity: [],
  logs: [],
  studentFinance: null,
  systemSettings: null,

  isLoading: false,
  isToggling: null,
  isActingOn: null,
  error: null,
  successMessage: null,

  // ── Fetch operations ─────────────────────────────────────

  fetchStats: async () => {
    try {
      const stats = await adminApi.getStats();
      set({ stats });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load admin stats') });
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await adminApi.getUsers();
      set({ users, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load users'), isLoading: false });
    }
  },

  fetchActivity: async () => {
    set({ isLoading: true, error: null });
    try {
      const activity = await adminApi.getSystemActivity();
      set({ activity, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load system activity'), isLoading: false });
    }
  },

  fetchLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const logs = await adminApi.getAdminLogs();
      set({ logs, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load admin logs'), isLoading: false });
    }
  },

  fetchStudentFinance: async (studentId: string) => {
    set({ isLoading: true, error: null, studentFinance: null });
    try {
      const plan = await adminApi.getStudentFinance(studentId);
      set({ studentFinance: plan, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load student finance'), isLoading: false });
    }
  },

  fetchSystemSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const systemSettings = await adminApi.getSystemSettings();
      set({ systemSettings, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load system settings'), isLoading: false });
    }
  },

  // ── User management ──────────────────────────────────────

  toggleUserStatus: async (userId: string) => {
    set({ isToggling: userId });
    try {
      const updated = await adminApi.toggleUserStatus(userId);
      set((s) => ({
        users: updateUserInList(s.users, updated),
        isToggling: null,
        successMessage: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      }));
      get().fetchStats();
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to update user status'),
        isToggling: null,
      });
    }
  },

  lockUser: async (userId: string) => {
    set({ isActingOn: userId });
    try {
      const updated = await adminApi.lockUser(userId);
      set((s) => ({
        users: updateUserInList(s.users, updated),
        isActingOn: null,
        successMessage: 'User account locked',
      }));
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to lock user'),
        isActingOn: null,
      });
    }
  },

  unlockUser: async (userId: string) => {
    set({ isActingOn: userId });
    try {
      const updated = await adminApi.unlockUser(userId);
      set((s) => ({
        users: updateUserInList(s.users, updated),
        isActingOn: null,
        successMessage: 'User account unlocked',
      }));
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to unlock user'),
        isActingOn: null,
      });
    }
  },

  suspendUser: async (userId: string, request: SuspendUserRequest) => {
    set({ isActingOn: userId });
    try {
      const updated = await adminApi.suspendUser(userId, request);
      set((s) => ({
        users: updateUserInList(s.users, updated),
        isActingOn: null,
        successMessage: 'User account suspended',
      }));
      get().fetchStats();
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to suspend user'),
        isActingOn: null,
      });
    }
  },

  unsuspendUser: async (userId: string) => {
    set({ isActingOn: userId });
    try {
      const updated = await adminApi.unsuspendUser(userId);
      set((s) => ({
        users: updateUserInList(s.users, updated),
        isActingOn: null,
        successMessage: 'User account unsuspended',
      }));
      get().fetchStats();
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to unsuspend user'),
        isActingOn: null,
      });
    }
  },

  resetPassword: async (request: ResetPasswordRequest) => {
    set({ isActingOn: request.userId });
    try {
      await adminApi.resetPassword(request);
      // Update local state to reflect forced password change
      set((s) => ({
        users: s.users.map((u) =>
          u.id === request.userId ? { ...u, mustChangePassword: true } : u
        ),
        isActingOn: null,
        successMessage: 'Password reset successfully. User will be required to change password on next login.',
      }));
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to reset password'),
        isActingOn: null,
      });
    }
  },

  changeUserRole: async (request: ChangeRoleRequest) => {
    set({ isActingOn: request.userId });
    try {
      const updated = await adminApi.changeUserRole(request);
      set((s) => ({
        users: updateUserInList(s.users, updated),
        isActingOn: null,
        successMessage: `Role changed to ${updated.role} successfully`,
      }));
      get().fetchStats();
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to change user role'),
        isActingOn: null,
      });
    }
  },

  forceLogout: async (userId: string) => {
    set({ isActingOn: userId });
    try {
      await adminApi.forceLogout(userId);
      set({
        isActingOn: null,
        successMessage: 'User has been logged out from all devices',
      });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to force logout'),
        isActingOn: null,
      });
    }
  },

  revokeSessions: async (userId: string) => {
    set({ isActingOn: userId });
    try {
      await adminApi.revokeSessions(userId);
      set({
        isActingOn: null,
        successMessage: 'All sessions revoked',
      });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to revoke sessions'),
        isActingOn: null,
      });
    }
  },

  toggle2FA: async (userId: string) => {
    set({ isActingOn: userId });
    try {
      const updated = await adminApi.toggle2FA(userId);
      set((s) => ({
        users: updateUserInList(s.users, updated),
        isActingOn: null,
        successMessage: `2FA ${updated.twoFactorEnabled ? 'enabled' : 'disabled'} for user`,
      }));
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to toggle 2FA'),
        isActingOn: null,
      });
    }
  },

  // ── Communication ────────────────────────────────────────

  sendNotification: async (request: SendNotificationRequest) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.sendNotification(request);
      set({
        isLoading: false,
        successMessage: 'Notification sent successfully',
      });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to send notification'),
        isLoading: false,
      });
    }
  },

  sendAnnouncement: async (request: SendAnnouncementRequest) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.sendAnnouncement(request);
      set({
        isLoading: false,
        successMessage: 'Announcement sent successfully',
      });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to send announcement'),
        isLoading: false,
      });
    }
  },

  // ── System settings ──────────────────────────────────────

  updateSystemSettings: async (updates: Partial<SystemSettings>) => {
    set({ isLoading: true, error: null });
    try {
      const settings = await adminApi.updateSystemSettings(updates);
      set({ systemSettings: settings, isLoading: false, successMessage: 'Settings updated' });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to update settings'),
        isLoading: false,
      });
    }
  },

  toggleMaintenanceMode: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await adminApi.toggleMaintenanceMode();
      set({
        systemSettings: settings,
        isLoading: false,
        successMessage: `Maintenance mode ${settings.maintenanceMode ? 'enabled' : 'disabled'}`,
      });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to toggle maintenance mode'),
        isLoading: false,
      });
    }
  },

  toggleFeatureFlag: async (flag: string) => {
    set({ isLoading: true, error: null });
    try {
      const settings = await adminApi.toggleFeatureFlag(flag);
      set({
        systemSettings: settings,
        isLoading: false,
        successMessage: `Feature flag "${flag}" ${settings.featureFlags[flag] ? 'enabled' : 'disabled'}`,
      });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to toggle feature flag'),
        isLoading: false,
      });
    }
  },

  // ── Utilities ────────────────────────────────────────────

  clearError: () => set({ error: null }),
  clearSuccessMessage: () => set({ successMessage: null }),
  clearStudentFinance: () => set({ studentFinance: null }),
}));
