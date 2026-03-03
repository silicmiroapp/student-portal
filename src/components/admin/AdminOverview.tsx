import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { SPACING, FONTS, BORDER_RADIUS } from '@/constants/theme';
import type { AdminStats } from '@/types/admin';
import { ROLE_DEFINITIONS } from '@/types/rbac';

interface AdminOverviewProps {
  stats: AdminStats;
}

interface StatCardData {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  colorKey: 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'primary';
}

export function AdminOverview({ stats }: AdminOverviewProps) {
  const { colors, fontSize } = useTheme();

  const cards: StatCardData[] = [
    { label: 'Total Users', value: stats.totalUsers, icon: 'people', colorKey: 'secondary' },
    { label: 'Active Users', value: stats.activeUsers, icon: 'checkmark-circle', colorKey: 'success' },
    { label: 'Disabled', value: stats.disabledUsers, icon: 'close-circle', colorKey: 'error' },
    { label: 'Locked', value: stats.lockedUsers, icon: 'lock-closed', colorKey: 'warning' },
    { label: 'Suspended', value: stats.suspendedUsers, icon: 'ban', colorKey: 'error' },
    { label: 'Logins (24h)', value: stats.recentLogins24h, icon: 'log-in', colorKey: 'info' },
    { label: 'Failed (24h)', value: stats.failedLogins24h, icon: 'alert-circle', colorKey: 'warning' },
    { label: 'Admin Actions (7d)', value: stats.adminActions7d, icon: 'shield-checkmark', colorKey: 'primary' },
  ];

  return (
    <View>
      <View style={styles.grid}>
        {cards.map((card) => (
          <Card key={card.label} style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: colors[`${card.colorKey}Light`] }]}>
              <Ionicons name={card.icon} size={22} color={colors[card.colorKey]} />
            </View>
            <Text style={[styles.value, { color: colors.text, fontSize: fontSize.xl }]}>
              {card.value}
            </Text>
            <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              {card.label}
            </Text>
          </Card>
        ))}
      </View>

      {/* Role Distribution */}
      {stats.roleDistribution && (
        <View style={styles.roleSection}>
          <Text style={[styles.roleSectionTitle, { color: colors.text, fontSize: fontSize.md }]}>
            Role Distribution
          </Text>
          <Card>
            {Object.entries(stats.roleDistribution).map(([role, count], index, arr) => {
              const def = ROLE_DEFINITIONS[role as keyof typeof ROLE_DEFINITIONS];
              return (
                <View
                  key={role}
                  style={[
                    styles.roleRow,
                    index < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                  ]}
                >
                  <View style={styles.roleInfo}>
                    <Text style={[styles.roleName, { color: colors.text, fontSize: fontSize.sm }]}>
                      {def?.label ?? role}
                    </Text>
                    <Text style={[styles.roleDesc, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                      Level {def?.level ?? 0}
                    </Text>
                  </View>
                  <Text style={[styles.roleCount, { color: colors.primary, fontSize: fontSize.md }]}>
                    {count}
                  </Text>
                </View>
              );
            })}
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  card: {
    width: '48%',
    flexGrow: 1,
    minWidth: 140,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  value: {
    fontFamily: FONTS.bold,
  },
  label: {
    fontFamily: FONTS.regular,
    marginTop: 2,
    textAlign: 'center',
  },
  roleSection: {
    marginTop: SPACING.lg,
  },
  roleSectionTitle: {
    fontFamily: FONTS.semiBold,
    marginBottom: SPACING.sm,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontFamily: FONTS.semiBold,
  },
  roleDesc: {
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
  roleCount: {
    fontFamily: FONTS.bold,
    minWidth: 32,
    textAlign: 'right',
  },
});
