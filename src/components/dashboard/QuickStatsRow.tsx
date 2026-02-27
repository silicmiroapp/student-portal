import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DashboardStats } from '@/types/dashboard';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/theme';

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
  const items: StatItem[] = [
    { label: 'Active', value: String(stats.activeCourses), icon: 'book-outline', color: COLORS.primary, bg: COLORS.infoLight },
    { label: 'Completed', value: String(stats.completedCourses), icon: 'checkmark-circle-outline', color: COLORS.success, bg: COLORS.successLight },
    { label: 'GPA', value: stats.currentGPA.toFixed(2), icon: 'trophy-outline', color: COLORS.warning, bg: COLORS.warningLight },
    { label: 'Deadlines', value: String(stats.upcomingDeadlines), icon: 'alarm-outline', color: COLORS.error, bg: COLORS.errorLight },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.statCard}>
          <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
            <Ionicons name={item.icon} size={20} color={item.color} />
          </View>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
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
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
