import { useEffect, useCallback, useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { UserManagement } from '@/components/admin/UserManagement';
import { SystemActivitySection } from '@/components/admin/SystemActivity';
import { FinanceMonitoring } from '@/components/admin/FinanceMonitoring';
import { SystemSettingsPanel } from '@/components/admin/SystemSettingsPanel';
import { AnnouncementComposer } from '@/components/admin/AnnouncementComposer';
import { AnnouncementList } from '@/components/admin/AnnouncementList';
import { useAdminStore } from '@/features/admin/store';
import { useNotificationStore } from '@/features/notifications/store';
import { useAuthStore } from '@/features/auth/store';
import { useHasPermission, useHasAnyPermission } from '@/hooks/usePermission';
import { securityLog } from '@/services/securityLog';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONTS } from '@/constants/theme';
import { Permission, ROLE_DEFINITIONS } from '@/types/rbac';
import type { UserRecord } from '@/types/admin';
import type { UserRole } from '@/types/rbac';

type AdminTab = 'overview' | 'users' | 'activity' | 'finance' | 'announcements' | 'system';

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { colors, fontSize } = useTheme();
  const { user } = useAuthStore();
  const {
    stats,
    users,
    activity,
    logs,
    studentFinance,
    systemSettings,
    isLoading,
    isToggling,
    isActingOn,
    successMessage,
    fetchStats,
    fetchUsers,
    fetchActivity,
    fetchLogs,
    fetchStudentFinance,
    fetchSystemSettings,
    toggleUserStatus,
    lockUser,
    unlockUser,
    suspendUser,
    unsuspendUser,
    resetPassword,
    changeUserRole,
    forceLogout,
    toggleMaintenanceMode,
    toggleFeatureFlag,
    clearStudentFinance,
    clearSuccessMessage,
  } = useAdminStore();
  const { fetchAnnouncements, fetchAnnouncementStats } = useNotificationStore();

  // Permission-based tab visibility
  const canViewUsers = useHasPermission(Permission.USERS_VIEW);
  const canViewActivity = useHasAnyPermission([
    Permission.LOGS_VIEW_USER_ACTIVITY,
    Permission.LOGS_VIEW_AUDIT_TRAIL,
  ]);
  const canViewFinance = useHasPermission(Permission.FINANCE_VIEW_STUDENT);
  const canViewSystem = useHasPermission(Permission.SYSTEM_MANAGE_SETTINGS);
  const canViewAnnouncements = useHasAnyPermission([
    Permission.COMM_SEND_ANNOUNCEMENT_ALL,
    Permission.COMM_MANAGE_ANNOUNCEMENT,
  ]);

  // Build tabs based on permissions
  const TABS = useMemo(() => {
    const tabs: { label: string; value: AdminTab }[] = [
      { label: 'Overview', value: 'overview' },
    ];
    if (canViewUsers) tabs.push({ label: 'Users', value: 'users' });
    if (canViewActivity) tabs.push({ label: 'Activity', value: 'activity' });
    if (canViewFinance) tabs.push({ label: 'Finance', value: 'finance' });
    if (canViewAnnouncements) tabs.push({ label: 'Announce', value: 'announcements' });
    if (canViewSystem) tabs.push({ label: 'System', value: 'system' });
    return tabs;
  }, [canViewUsers, canViewActivity, canViewFinance, canViewAnnouncements, canViewSystem]);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Auto-clear success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(clearSuccessMessage, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearSuccessMessage]);

  // Log admin access
  useEffect(() => {
    if (user) {
      securityLog.adminAccess(user.id, 'admin_dashboard');
    }
  }, [user]);

  // Fetch data for active tab
  useEffect(() => {
    switch (activeTab) {
      case 'overview':
        fetchStats();
        break;
      case 'users':
        fetchUsers();
        break;
      case 'activity':
        fetchActivity();
        fetchLogs();
        break;
      case 'finance':
        fetchUsers();
        break;
      case 'announcements':
        fetchAnnouncements();
        fetchAnnouncementStats();
        break;
      case 'system':
        fetchSystemSettings();
        break;
    }
  }, [activeTab, fetchStats, fetchUsers, fetchActivity, fetchLogs, fetchAnnouncements, fetchAnnouncementStats, fetchSystemSettings]);

  const onRefresh = useCallback(() => {
    switch (activeTab) {
      case 'overview':
        fetchStats();
        break;
      case 'users':
        fetchUsers();
        break;
      case 'activity':
        fetchActivity();
        fetchLogs();
        break;
      case 'finance':
        fetchUsers();
        clearStudentFinance();
        break;
      case 'announcements':
        fetchAnnouncements();
        fetchAnnouncementStats();
        break;
      case 'system':
        fetchSystemSettings();
        break;
    }
  }, [activeTab, fetchStats, fetchUsers, fetchActivity, fetchLogs, fetchAnnouncements, fetchAnnouncementStats, fetchSystemSettings, clearStudentFinance]);

  // ── User action handlers ──────────────────────────────────
  const handleToggleUser = useCallback((userId: string) => {
    if (user) securityLog.adminUserModified(user.id, 'toggle_status', userId);
    toggleUserStatus(userId);
  }, [user, toggleUserStatus]);

  const handleLockUser = useCallback((userId: string) => {
    if (user) securityLog.adminUserLocked(user.id, user.role, userId);
    lockUser(userId);
  }, [user, lockUser]);

  const handleUnlockUser = useCallback((userId: string) => {
    if (user) securityLog.adminUserUnlocked(user.id, user.role, userId);
    unlockUser(userId);
  }, [user, unlockUser]);

  const handleSuspendUser = useCallback((userId: string, reason: string) => {
    if (user) securityLog.adminUserSuspended(user.id, user.role, userId, reason);
    suspendUser(userId, { userId, reason });
  }, [user, suspendUser]);

  const handleUnsuspendUser = useCallback((userId: string) => {
    unsuspendUser(userId);
  }, [unsuspendUser]);

  const handleResetPassword = useCallback((userId: string) => {
    if (user) securityLog.adminPasswordReset(user.id, user.role, userId);
    resetPassword({ userId, notifyUser: true });
  }, [user, resetPassword]);

  const handleForceLogout = useCallback((userId: string) => {
    if (user) securityLog.adminForceLogout(user.id, user.role, userId);
    forceLogout(userId);
  }, [user, forceLogout]);

  const handleChangeRole = useCallback((userId: string, newRole: UserRole, reason: string) => {
    const target = users.find((u) => u.id === userId);
    if (user && target) {
      securityLog.adminRoleChanged(user.id, user.role, userId, target.role, newRole);
    }
    changeUserRole({ userId, newRole, reason });
  }, [user, users, changeUserRole]);

  const handleViewFinance = useCallback((target: UserRecord) => {
    if (user) securityLog.adminFinanceViewed(user.id, target.id);
    fetchStudentFinance(target.id);
  }, [user, fetchStudentFinance]);

  const roleLabel = ROLE_DEFINITIONS[user?.role ?? 'user']?.label ?? 'User';
  const isFirstLoad = isLoading && !stats && users.length === 0;

  if (isFirstLoad) {
    return <LoadingScreen />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <View style={styles.headerRow}>
          <View style={[styles.adminBadge, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSize.xl }]}>
              Admin Panel
            </Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              {user?.name} · {roleLabel} · {user?.email}
            </Text>
          </View>
        </View>
      </View>

      {/* Success banner */}
      {successMessage && (
        <View style={[styles.successBanner, { backgroundColor: colors.successLight }]}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={[styles.successText, { color: colors.success, fontSize: fontSize.xs }]}>
            {successMessage}
          </Text>
        </View>
      )}

      {/* Tab selector */}
      <View style={styles.tabContainer}>
        <SegmentedControl
          items={TABS}
          selectedValue={activeTab}
          onSelect={setActiveTab}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <View style={styles.section}>
            <SectionHeader title="System Overview" />
            <AdminOverview stats={stats} />
          </View>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && canViewUsers && (
          <View style={styles.section}>
            <SectionHeader title="User Management" />
            <UserManagement
              users={users}
              isToggling={isToggling}
              isActingOn={isActingOn}
              onToggleUser={handleToggleUser}
              onLockUser={handleLockUser}
              onUnlockUser={handleUnlockUser}
              onSuspendUser={handleSuspendUser}
              onUnsuspendUser={handleUnsuspendUser}
              onResetPassword={handleResetPassword}
              onForceLogout={handleForceLogout}
              onChangeRole={handleChangeRole}
              onViewFinance={handleViewFinance}
            />
          </View>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && canViewActivity && (
          <View style={styles.section}>
            <SystemActivitySection activity={activity} logs={logs} />
          </View>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && canViewFinance && (
          <View style={styles.section}>
            <SectionHeader title="Finance Monitoring" />
            <FinanceMonitoring
              users={users}
              studentFinance={studentFinance}
              isLoading={isLoading}
              onSelectStudent={handleViewFinance}
            />
          </View>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && canViewAnnouncements && (
          <View style={styles.section}>
            <SectionHeader title="Announcements" />
            <AnnouncementComposer onSuccess={() => {
              fetchAnnouncements();
              fetchAnnouncementStats();
            }} />
            <View style={{ height: SPACING.md }} />
            <AnnouncementList />
          </View>
        )}

        {/* System Tab (SuperAdmin only) */}
        {activeTab === 'system' && canViewSystem && systemSettings && (
          <View style={styles.section}>
            <SystemSettingsPanel
              settings={systemSettings}
              isLoading={isLoading}
              onToggleMaintenance={toggleMaintenanceMode}
              onToggleFeatureFlag={toggleFeatureFlag}
            />
          </View>
        )}

        <View style={{ height: insets.bottom + SPACING.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  adminBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
  },
  headerSub: {
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  successText: {
    fontFamily: FONTS.semiBold,
    flex: 1,
  },
  tabContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  section: {
    marginBottom: 28,
  },
});
