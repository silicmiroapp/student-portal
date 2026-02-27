import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { DashboardStats } from '@/types/dashboard';
import { SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants/theme';

interface QuickStatsRowProps {
  stats: DashboardStats;
}

interface StatItem {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

export function QuickStatsRow({ stats }: QuickStatsRowProps) {
  const { colors, fontSize } = useTheme();

  const items: StatItem[] = [
    { label: 'Active', value: String(stats.activeCourses), icon: 'book-outline', color: colors.secondary, bg: colors.secondaryLight },
    { label: 'Completed', value: String(stats.completedCourses), icon: 'checkmark-circle-outline', color: colors.success, bg: colors.successLight },
    { label: 'GPA', value: stats.currentGPA.toFixed(2), icon: 'trophy-outline', color: colors.warning, bg: colors.warningLight },
    { label: 'Deadlines', value: String(stats.upcomingDeadlines), icon: 'alarm-outline', color: colors.error, bg: colors.errorLight },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
        >
          <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
            <Ionicons name={item.icon} size={20} color={item.color} />
          </View>
          <Text style={[styles.value, { color: colors.text, fontSize: fontSize.xl }]}>
            {item.value}
          </Text>
          <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
            {item.label}
          </Text>
        </View>
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
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
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
  },
});
