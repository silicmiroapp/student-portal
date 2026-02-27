import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { SPACING, FONTS, BORDER_RADIUS } from '@/constants/theme';
import type { AdminStats } from '@/types/admin';

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
    { label: 'Logins (24h)', value: stats.recentLogins24h, icon: 'log-in', colorKey: 'info' },
    { label: 'Failed (24h)', value: stats.failedLogins24h, icon: 'alert-circle', colorKey: 'warning' },
    { label: 'Admin Actions (7d)', value: stats.adminActions7d, icon: 'shield-checkmark', colorKey: 'primary' },
  ];

  return (
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
});
