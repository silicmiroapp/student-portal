import { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuthStore } from '@/features/auth/store';
import { useAdminStore } from '@/features/admin/store';
import { useHasPermission, useHasAnyPermission } from '@/hooks/usePermission';
import { useTheme } from '@/hooks/useTheme';
import { Permission, ROLE_DEFINITIONS } from '@/types/rbac';
import {
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  FONTS,
} from '@/constants/theme';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAuditAction(action: string): string {
  return action.replace(/\./g, ' ').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AdminHomeDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const { stats, activity, logs, isLoading, fetchStats, fetchActivity, fetchLogs } = useAdminStore();
  const { colors, fontSize } = useTheme();

  const canViewUsers = useHasPermission(Permission.USERS_VIEW);
  const canViewActivity = useHasAnyPermission([
    Permission.LOGS_VIEW_USER_ACTIVITY,
    Permission.LOGS_VIEW_AUDIT_TRAIL,
  ]);
  const canViewSystem = useHasPermission(Permission.SYSTEM_MANAGE_SETTINGS);

  useEffect(() => {
    fetchStats();
    fetchActivity();
    fetchLogs();
  }, [fetchStats, fetchActivity, fetchLogs]);

  const onRefresh = useCallback(() => {
    fetchStats();
    fetchActivity();
    fetchLogs();
  }, [fetchStats, fetchActivity, fetchLogs]);

  const roleLabel = ROLE_DEFINITIONS[user?.role ?? 'user']?.label ?? 'User';
  const isFirstLoad = isLoading && !stats;

  if (isFirstLoad) {
    return <LoadingScreen />;
  }

  // Quick action cards visible based on permissions
  const quickActions: { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; onPress: () => void }[] = [];

  if (canViewUsers) {
    quickActions.push({
      label: 'Manage Users',
      icon: 'people-outline',
      color: colors.secondary,
      bg: colors.secondaryLight,
      onPress: () => router.push('/(main)/admin'),
    });
  }
  if (canViewActivity) {
    quickActions.push({
      label: 'View Activity',
      icon: 'pulse-outline',
      color: colors.info,
      bg: colors.infoLight,
      onPress: () => router.push('/(main)/admin'),
    });
  }
  if (canViewSystem) {
    quickActions.push({
      label: 'System Settings',
      icon: 'settings-outline',
      color: colors.warning,
      bg: colors.warningLight,
      onPress: () => router.push('/(main)/admin'),
    });
  }

  // Recent logs (last 5)
  const recentLogs = logs.slice(0, 5);
  // Recent activity (last 5)
  const recentActivity = activity.slice(0, 5);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.roleBadgeIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={[styles.greeting, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
              Good {getGreeting()},
            </Text>
            <Text style={[styles.userName, { color: colors.text, fontSize: fontSize.xl }]}>
              {user?.name ?? 'Admin'}
            </Text>
            <Text style={[styles.roleLabel, { color: colors.primary, fontSize: fontSize.xs }]}>
              {roleLabel}
            </Text>
          </View>
        </View>
        <Avatar name={user?.name ?? 'A'} imageUrl={user?.avatarUrl} size={48} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview */}
        {stats && (
          <View style={styles.section}>
            <SectionHeader title="System Overview" />
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.secondaryLight }]}>
                  <Ionicons name="people" size={20} color={colors.secondary} />
                </View>
                <Text style={[styles.statValue, { color: colors.text, fontSize: fontSize.xl }]}>
                  {stats.totalUsers}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                  Total Users
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <Text style={[styles.statValue, { color: colors.text, fontSize: fontSize.xl }]}>
                  {stats.activeUsers}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                  Active
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
                  <Ionicons name="log-in" size={20} color={colors.warning} />
                </View>
                <Text style={[styles.statValue, { color: colors.text, fontSize: fontSize.xl }]}>
                  {stats.recentLogins24h}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                  Logins (24h)
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.errorLight }]}>
                  <Ionicons name="alert-circle" size={20} color={colors.error} />
                </View>
                <Text style={[styles.statValue, { color: colors.text, fontSize: fontSize.xl }]}>
                  {stats.failedLogins24h}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                  Failed (24h)
                </Text>
              </View>
            </View>

            {/* Attention needed row */}
            {(stats.lockedUsers > 0 || stats.suspendedUsers > 0) && (
              <Card style={styles.attentionCard}>
                <View style={styles.attentionRow}>
                  <Ionicons name="warning-outline" size={18} color={colors.warning} />
                  <Text style={[styles.attentionText, { color: colors.text, fontSize: fontSize.sm }]}>
                    Attention needed
                  </Text>
                </View>
                {stats.lockedUsers > 0 && (
                  <Text style={[styles.attentionDetail, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                    {stats.lockedUsers} locked account{stats.lockedUsers !== 1 ? 's' : ''}
                  </Text>
                )}
                {stats.suspendedUsers > 0 && (
                  <Text style={[styles.attentionDetail, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                    {stats.suspendedUsers} suspended account{stats.suspendedUsers !== 1 ? 's' : ''}
                  </Text>
                )}
              </Card>
            )}
          </View>
        )}

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Quick Actions" />
            <View style={styles.actionsRow}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={[styles.actionCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
                  onPress={action.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                    <Ionicons name={action.icon} size={22} color={action.color} />
                  </View>
                  <Text style={[styles.actionLabel, { color: colors.text, fontSize: fontSize.xs }]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        {canViewActivity && recentActivity.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Recent Activity"
              actionLabel="View All"
              onAction={() => router.push('/(main)/admin')}
            />
            <Card>
              {recentActivity.map((event, index) => (
                <View
                  key={event.id}
                  style={[
                    styles.activityRow,
                    index < recentActivity.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                  ]}
                >
                  <Ionicons
                    name={
                      event.type === 'login_success' ? 'log-in-outline' :
                      event.type === 'login_failure' ? 'alert-circle-outline' :
                      event.type === 'account_locked' ? 'lock-closed-outline' :
                      event.type === 'password_reset' ? 'key-outline' :
                      'ellipse-outline'
                    }
                    size={16}
                    color={
                      event.type === 'login_success' ? colors.success :
                      event.type === 'login_failure' ? colors.error :
                      colors.textSecondary
                    }
                  />
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityEmail, { color: colors.text, fontSize: fontSize.xs }]} numberOfLines={1}>
                      {event.email}
                    </Text>
                    <Text style={[styles.activityType, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                      {event.type.replace(/_/g, ' ')}
                    </Text>
                  </View>
                  <Text style={[styles.activityTime, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                    {formatDateTime(event.timestamp)}
                  </Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Recent Admin Actions */}
        {recentLogs.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Recent Admin Actions"
              actionLabel="View All"
              onAction={() => router.push('/(main)/admin')}
            />
            <Card>
              {recentLogs.map((log, index) => (
                <View
                  key={log.id}
                  style={[
                    styles.activityRow,
                    index < recentLogs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                  ]}
                >
                  <Ionicons name="shield-outline" size={16} color={colors.primary} />
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityEmail, { color: colors.text, fontSize: fontSize.xs }]} numberOfLines={1}>
                      {formatAuditAction(log.action)}
                    </Text>
                    <Text style={[styles.activityType, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                      {log.actorEmail}{log.targetEmail ? ` → ${log.targetEmail}` : ''}
                    </Text>
                  </View>
                  <Text style={[styles.activityTime, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                    {formatDateTime(log.timestamp)}
                  </Text>
                </View>
              ))}
            </Card>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    ...SHADOWS.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  roleBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextBlock: {
    flexShrink: 1,
  },
  greeting: {
    fontFamily: FONTS.regular,
  },
  userName: {
    fontFamily: FONTS.bold,
  },
  roleLabel: {
    fontFamily: FONTS.semiBold,
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  section: {
    marginBottom: 28,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontFamily: FONTS.bold,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    marginTop: 2,
    textAlign: 'center',
  },
  attentionCard: {
    marginTop: SPACING.sm,
  },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  attentionText: {
    fontFamily: FONTS.semiBold,
  },
  attentionDetail: {
    fontFamily: FONTS.regular,
    paddingLeft: 26,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionLabel: {
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityEmail: {
    fontFamily: FONTS.semiBold,
  },
  activityType: {
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
  activityTime: {
    fontFamily: FONTS.regular,
  },
});
