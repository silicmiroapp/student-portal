import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SPACING, FONTS, BORDER_RADIUS } from '@/constants/theme';
import type { UserRecord } from '@/types/admin';

interface UserManagementProps {
  users: UserRecord[];
  isToggling: string | null;
  onToggleUser: (userId: string) => void;
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

export function UserManagement({ users, isToggling, onToggleUser, onViewFinance }: UserManagementProps) {
  const { colors, fontSize } = useTheme();
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.studentId?.toLowerCase().includes(q) ?? false)
    );
  });

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
        {filtered.map((user, index) => (
          <View
            key={user.id}
            style={[
              styles.userRow,
              index < filtered.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
            ]}
          >
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <Text style={[styles.userName, { color: colors.text, fontSize: fontSize.sm }]}>
                  {user.name}
                </Text>
                <View style={styles.badges}>
                  {user.role === 'admin' && <Badge label="Admin" variant="info" />}
                  <Badge
                    label={user.isActive ? 'Active' : 'Disabled'}
                    variant={user.isActive ? 'success' : 'error'}
                  />
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
              </Text>
            </View>

            {/* Actions (non-admin users only) */}
            {user.role !== 'admin' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: user.isActive ? colors.errorLight : colors.successLight },
                  ]}
                  onPress={() => onToggleUser(user.id)}
                  disabled={isToggling === user.id}
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

                {user.studentId && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.infoLight }]}
                    onPress={() => onViewFinance(user)}
                  >
                    <Ionicons name="wallet-outline" size={18} color={colors.info} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}

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
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
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
  },
  userEmail: {
    fontFamily: FONTS.regular,
    marginTop: 3,
  },
  userMeta: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: 2,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyRow: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.regular,
  },
});
