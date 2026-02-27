import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { SPACING, FONTS, BORDER_RADIUS } from '@/constants/theme';
import type { FinanceSummary } from '@/types/finance';

interface FinanceSummaryCardProps {
  summary: FinanceSummary;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function FinanceSummaryCard({ summary }: FinanceSummaryCardProps) {
  const { colors, fontSize } = useTheme();
  const progressPercent = summary.totalDue > 0
    ? Math.round((summary.totalPaid / summary.totalDue) * 100)
    : 0;

  return (
    <Card>
      {/* Total overview */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
            Total Tuition
          </Text>
          <Text style={[styles.totalAmount, { color: colors.text, fontSize: fontSize.xl }]}>
            {formatCurrency(summary.totalDue, summary.currency)}
          </Text>
        </View>
        <View style={[styles.progressCircle, { borderColor: colors.secondary }]}>
          <Text style={[styles.progressText, { color: colors.secondary, fontSize: fontSize.sm }]}>
            {progressPercent}%
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: colors.secondary,
            },
          ]}
        />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              Paid
            </Text>
            <Text style={[styles.statValue, { color: colors.success, fontSize: fontSize.sm }]}>
              {formatCurrency(summary.totalPaid, summary.currency)}
            </Text>
          </View>
        </View>

        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
            <Ionicons name="time" size={16} color={colors.warning} />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              Remaining
            </Text>
            <Text style={[styles.statValue, { color: colors.warning, fontSize: fontSize.sm }]}>
              {formatCurrency(summary.totalRemaining, summary.currency)}
            </Text>
          </View>
        </View>
      </View>

      {/* Overdue warning */}
      {summary.overdueCount > 0 && (
        <View style={[styles.overdueBar, { backgroundColor: colors.errorLight, borderColor: colors.errorBorder }]}>
          <Ionicons name="alert-circle" size={18} color={colors.error} />
          <Text style={[styles.overdueText, { color: colors.error, fontSize: fontSize.xs }]}>
            {summary.overdueCount} overdue ({formatCurrency(summary.overdueAmount, summary.currency)})
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.regular,
    marginBottom: 4,
  },
  totalAmount: {
    fontFamily: FONTS.bold,
  },
  progressCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontFamily: FONTS.bold,
  },
  progressTrack: {
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  progressFill: {
    height: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: FONTS.regular,
  },
  statValue: {
    fontFamily: FONTS.semiBold,
    marginTop: 1,
  },
  overdueBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  overdueText: {
    fontFamily: FONTS.semiBold,
    flex: 1,
  },
});
