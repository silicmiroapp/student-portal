import { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/features/auth/store';
import { useHasPermission } from '@/hooks/usePermission';
import { canActOnUser } from '@/services/rbac';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SPACING, FONTS, BORDER_RADIUS } from '@/constants/theme';
import { Permission, ROLE_DEFINITIONS } from '@/types/rbac';
import type { UserRecord } from '@/types/admin';
import type { UserRole } from '@/types/rbac';

interface UserManagementProps {
  users: UserRecord[];
  isToggling: string | null;
  isActingOn: string | null;
  onToggleUser: (userId: string) => void;
  onLockUser: (userId: string) => void;
  onUnlockUser: (userId: string) => void;
  onSuspendUser: (userId: string, reason: string) => void;
  onUnsuspendUser: (userId: string) => void;
  onResetPassword: (userId: string) => void;
  onForceLogout: (userId: string) => void;
  onChangeRole: (userId: string, newRole: UserRole, reason: string) => void;
  onViewFinance: (user: UserRecord) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRoleBadgeVariant(role: UserRole): 'info' | 'warning' | 'success' | 'error' {
  switch (role) {
    case 'super_admin': return 'error';
    case 'admin': return 'warning';
    case 'support_admin': return 'info';
    default: return 'success';
  }
}

export function UserManagement({
  users,
  isToggling,
  isActingOn,
  onToggleUser,
  onLockUser,
  onUnlockUser,
  onSuspendUser,
  onUnsuspendUser,
  onResetPassword,
  onForceLogout,
  onChangeRole,
  onViewFinance,
}: UserManagementProps) {
  const { colors, fontSize } = useTheme();
  const currentUser = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Permission checks
  const canToggle = useHasPermission(Permission.USERS_DEACTIVATE);
  const canLock = useHasPermission(Permission.USERS_LOCK);
  const canUnlock = useHasPermission(Permission.USERS_UNLOCK);
  const canSuspend = useHasPermission(Permission.USERS_SUSPEND);
  const canResetPwd = useHasPermission(Permission.USERS_RESET_PASSWORD);
  const canForceLogout = useHasPermission(Permission.SECURITY_FORCE_LOGOUT);
  const canAssignRole = useHasPermission(Permission.USERS_ASSIGN_ROLE);
  const canViewFinance = useHasPermission(Permission.FINANCE_VIEW_STUDENT);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.studentId?.toLowerCase().includes(q) ?? false)
    );
  });

  const handleSuspend = useCallback((user: UserRecord) => {
    Alert.prompt
      ? Alert.prompt(
          'Suspend User',
          `Enter a reason for suspending ${user.name}:`,
          (reason) => {
            if (reason?.trim()) onSuspendUser(user.id, reason.trim());
          }
        )
      : // Fallback for platforms without prompt
        Alert.alert('Suspend User', `Suspend ${user.name}?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Suspend', style: 'destructive', onPress: () => onSuspendUser(user.id, 'Suspended by admin') },
        ]);
  }, [onSuspendUser]);

  const handleResetPassword = useCallback((user: UserRecord) => {
    Alert.alert(
      'Reset Password',
      `Reset password for ${user.name}? They will be required to change it on next login.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => onResetPassword(user.id) },
      ]
    );
  }, [onResetPassword]);

  const handleForceLogout = useCallback((user: UserRecord) => {
    Alert.alert(
      'Force Logout',
      `Force ${user.name} to log out from all devices?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => onForceLogout(user.id) },
      ]
    );
  }, [onForceLogout]);

  const handleChangeRole = useCallback((user: UserRecord) => {
    if (!currentUser) return;
    const assignable = Object.values(ROLE_DEFINITIONS)
      .filter((r) => r.level < (ROLE_DEFINITIONS[currentUser.role]?.level ?? 0))
      .filter((r) => r.name !== user.role);

    if (assignable.length === 0) {
      Alert.alert('Cannot Change Role', 'No roles available to assign.');
      return;
    }

    const buttons = assignable.map((r) => ({
      text: r.label,
      onPress: () => onChangeRole(user.id, r.name, `Role changed by ${currentUser.email}`),
    }));
    buttons.push({ text: 'Cancel', onPress: () => {} });

    Alert.alert('Change Role', `Select new role for ${user.name}:`, buttons);
  }, [currentUser, onChangeRole]);

  /** Can the current user act on this specific target? */
  const canAct = (target: UserRecord): boolean => {
    if (!currentUser) return false;
    if (currentUser.id === target.id) return false;
    return canActOnUser(currentUser, target.role);
  };

  return (
    <View>
      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text, fontSize: fontSize.sm }]}
          placeholder="Search users..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Count */}
      <Text style={[styles.countText, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
        {filtered.length} user{filtered.length !== 1 ? 's' : ''} found
      </Text>

      {/* User list */}
      <Card>
        {filtered.map((user, index) => {
          const isExpanded = expandedUser === user.id;
          const actable = canAct(user);
          const isBusy = isToggling === user.id || isActingOn === user.id;

          return (
            <View
              key={user.id}
              style={[
                styles.userRow,
                index < filtered.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
              ]}
            >
              <TouchableOpacity
                style={styles.userInfo}
                onPress={() => setExpandedUser(isExpanded ? null : user.id)}
                activeOpacity={0.7}
              >
                <View style={styles.userHeader}>
                  <Text style={[styles.userName, { color: colors.text, fontSize: fontSize.sm }]}>
                    {user.name}
                  </Text>
                  <View style={styles.badges}>
                    <Badge label={ROLE_DEFINITIONS[user.role]?.label ?? user.role} variant={getRoleBadgeVariant(user.role)} />
                    {user.isLocked && <Badge label="Locked" variant="warning" />}
                    {user.isSuspended && <Badge label="Suspended" variant="error" />}
                    {!user.isSuspended && !user.isLocked && (
                      <Badge
                        label={user.isActive ? 'Active' : 'Disabled'}
                        variant={user.isActive ? 'success' : 'error'}
                      />
                    )}
                  </View>
                </View>
                <Text style={[styles.userEmail, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                  {user.email}
                </Text>
                {user.studentId && (
                  <Text style={[styles.userMeta, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                    {user.studentId} · {user.program}
                  </Text>
                )}
                {user.lastLogin && (
                  <Text style={[styles.userMeta, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                    Last login: {formatDateTime(user.lastLogin)}
                  </Text>
                )}
                <Text style={[styles.userMeta, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                  Joined: {formatDate(user.createdAt)}
                  {user.twoFactorEnabled ? '  ·  2FA enabled' : ''}
                  {user.mustChangePassword ? '  ·  Must change password' : ''}
                </Text>
              </TouchableOpacity>

              {/* Inline quick actions (always visible for actable users) */}
              {actable && (
                <View style={styles.quickActions}>
                  {canToggle && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: user.isActive ? colors.errorLight : colors.successLight },
                      ]}
                      onPress={() => onToggleUser(user.id)}
                      disabled={isBusy}
                    >
                      {isToggling === user.id ? (
                        <ActivityIndicator size="small" color={colors.textSecondary} />
                      ) : (
                        <Ionicons
                          name={user.isActive ? 'close-circle-outline' : 'checkmark-circle-outline'}
                          size={18}
                          color={user.isActive ? colors.error : colors.success}
                        />
                      )}
                    </TouchableOpacity>
                  )}

                  {canViewFinance && user.studentId && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.infoLight }]}
                      onPress={() => onViewFinance(user)}
                    >
                      <Ionicons name="wallet-outline" size={18} color={colors.info} />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.surfaceAlt }]}
                    onPress={() => setExpandedUser(isExpanded ? null : user.id)}
                  >
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Expanded actions panel */}
              {isExpanded && actable && (
                <View style={[styles.expandedActions, { backgroundColor: colors.surfaceAlt, borderColor: colors.borderLight }]}>
                  {isBusy && (
                    <ActivityIndicator size="small" color={colors.primary} style={styles.busyIndicator} />
                  )}

                  {canResetPwd && (
                    <TouchableOpacity
                      style={[styles.expandedButton, { borderColor: colors.borderLight }]}
                      onPress={() => handleResetPassword(user)}
                      disabled={isBusy}
                    >
                      <Ionicons name="key-outline" size={16} color={colors.warning} />
                      <Text style={[styles.expandedButtonText, { color: colors.text, fontSize: fontSize.xs }]}>
                        Reset Password
                      </Text>
                    </TouchableOpacity>
                  )}

                  {canLock && !user.isLocked && (
                    <TouchableOpacity
                      style={[styles.expandedButton, { borderColor: colors.borderLight }]}
                      onPress={() => onLockUser(user.id)}
                      disabled={isBusy}
                    >
                      <Ionicons name="lock-closed-outline" size={16} color={colors.warning} />
                      <Text style={[styles.expandedButtonText, { color: colors.text, fontSize: fontSize.xs }]}>
                        Lock Account
                      </Text>
                    </TouchableOpacity>
                  )}

                  {canUnlock && user.isLocked && (
                    <TouchableOpacity
                      style={[styles.expandedButton, { borderColor: colors.borderLight }]}
                      onPress={() => onUnlockUser(user.id)}
                      disabled={isBusy}
                    >
                      <Ionicons name="lock-open-outline" size={16} color={colors.success} />
                      <Text style={[styles.expandedButtonText, { color: colors.text, fontSize: fontSize.xs }]}>
                        Unlock Account
                      </Text>
                    </TouchableOpacity>
                  )}

                  {canSuspend && !user.isSuspended && (
                    <TouchableOpacity
                      style={[styles.expandedButton, { borderColor: colors.borderLight }]}
                      onPress={() => handleSuspend(user)}
                      disabled={isBusy}
                    >
                      <Ionicons name="ban-outline" size={16} color={colors.error} />
                      <Text style={[styles.expandedButtonText, { color: colors.text, fontSize: fontSize.xs }]}>
                        Suspend
                      </Text>
                    </TouchableOpacity>
                  )}

                  {canSuspend && user.isSuspended && (
                    <TouchableOpacity
                      style={[styles.expandedButton, { borderColor: colors.borderLight }]}
                      onPress={() => onUnsuspendUser(user.id)}
                      disabled={isBusy}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                      <Text style={[styles.expandedButtonText, { color: colors.text, fontSize: fontSize.xs }]}>
                        Unsuspend
                      </Text>
                    </TouchableOpacity>
                  )}

                  {canForceLogout && (
                    <TouchableOpacity
                      style={[styles.expandedButton, { borderColor: colors.borderLight }]}
                      onPress={() => handleForceLogout(user)}
                      disabled={isBusy}
                    >
                      <Ionicons name="log-out-outline" size={16} color={colors.error} />
                      <Text style={[styles.expandedButtonText, { color: colors.text, fontSize: fontSize.xs }]}>
                        Force Logout
                      </Text>
                    </TouchableOpacity>
                  )}

                  {canAssignRole && (
                    <TouchableOpacity
                      style={[styles.expandedButton, { borderColor: colors.borderLight }]}
                      onPress={() => handleChangeRole(user)}
                      disabled={isBusy}
                    >
                      <Ionicons name="shield-outline" size={16} color={colors.primary} />
                      <Text style={[styles.expandedButtonText, { color: colors.text, fontSize: fontSize.xs }]}>
                        Change Role
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyRow}>
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
              No users match your search
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    padding: 0,
  },
  countText: {
    fontFamily: FONTS.regular,
    marginBottom: SPACING.sm,
  },
  userRow: {
    paddingVertical: SPACING.md,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  userName: {
    fontFamily: FONTS.semiBold,
  },
  badges: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  userEmail: {
    fontFamily: FONTS.regular,
    marginTop: 3,
  },
  userMeta: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedActions: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  expandedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  expandedButtonText: {
    fontFamily: FONTS.semiBold,
  },
  busyIndicator: {
    marginRight: SPACING.sm,
  },
  emptyRow: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.regular,
  },
});
