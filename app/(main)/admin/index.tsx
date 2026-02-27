import { useEffect, useCallback, useState } from 'react';
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
import { useAdminStore } from '@/features/admin/store';
import { useAuthStore } from '@/features/auth/store';
import { securityLog } from '@/services/securityLog';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONTS } from '@/constants/theme';
import type { UserRecord } from '@/types/admin';

type AdminTab = 'overview' | 'users' | 'activity' | 'finance';

const TABS: { label: string; value: AdminTab }[] = [
  { label: 'Overview', value: 'overview' },
  { label: 'Users', value: 'users' },
  { label: 'Activity', value: 'activity' },
  { label: 'Finance', value: 'finance' },
];

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
    isLoading,
    isToggling,
    fetchStats,
    fetchUsers,
    fetchActivity,
    fetchLogs,
    toggleUserStatus,
    fetchStudentFinance,
    clearStudentFinance,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

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
    }
  }, [activeTab, fetchStats, fetchUsers, fetchActivity, fetchLogs]);

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
    }
  }, [activeTab, fetchStats, fetchUsers, fetchActivity, fetchLogs, clearStudentFinance]);

  const handleToggleUser = useCallback((userId: string) => {
    if (user) {
      securityLog.adminUserModified(user.id, 'toggle_status', userId);
    }
    toggleUserStatus(userId);
  }, [user, toggleUserStatus]);

  const handleViewFinance = useCallback((target: UserRecord) => {
    if (user) {
      securityLog.adminFinanceViewed(user.id, target.id);
    }
    fetchStudentFinance(target.id);
  }, [user, fetchStudentFinance]);

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
          <View>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSize.xl }]}>
              Admin Panel
            </Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              {user?.name} · {user?.email}
            </Text>
          </View>
        </View>
      </View>

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
        {activeTab === 'users' && (
          <View style={styles.section}>
            <SectionHeader title="User Management" />
            <UserManagement
              users={users}
              isToggling={isToggling}
              onToggleUser={handleToggleUser}
              onViewFinance={handleViewFinance}
            />
          </View>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <View style={styles.section}>
            <SystemActivitySection activity={activity} logs={logs} />
          </View>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
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
  headerTitle: {
    fontFamily: FONTS.bold,
  },
  headerSub: {
    fontFamily: FONTS.regular,
    marginTop: 1,
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
