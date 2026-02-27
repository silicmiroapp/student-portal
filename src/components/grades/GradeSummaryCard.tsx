import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import type { GradeSummary, AcademicStatus } from '@/types/grades';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

interface GradeSummaryCardProps {
  summary: GradeSummary;
}

const STANDING_CONFIG: Record<AcademicStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  good_standing: { label: 'Good Standing', variant: 'success' },
  deans_list: { label: "Dean's List", variant: 'info' },
  probation: { label: 'Probation', variant: 'error' },
  warning: { label: 'Warning', variant: 'warning' },
};

export function GradeSummaryCard({ summary }: GradeSummaryCardProps) {
  const standing = STANDING_CONFIG[summary.academicStanding];
  const creditProgress = summary.totalCredits > 0
    ? (summary.completedCredits / summary.totalCredits) * 100
    : 0;

  return (
    <Card style={styles.card}>
      <View style={styles.gpaRow}>
        <View style={styles.gpaBlock}>
          <Text style={styles.gpaLabel}>Cumulative GPA</Text>
          <Text style={styles.gpaValue}>{summary.cumulativeGPA.toFixed(2)}</Text>
        </View>
        <View style={styles.gpaBlock}>
          <Text style={styles.gpaLabel}>Semester GPA</Text>
          <Text style={styles.gpaValue}>{summary.semesterGPA.toFixed(2)}</Text>
        </View>
        <View style={styles.gpaBlock}>
          <Badge label={standing.label} variant={standing.variant} />
        </View>
      </View>

      <View style={styles.creditsSection}>
        <View style={styles.creditsHeader}>
          <Text style={styles.creditsLabel}>Credits Progress</Text>
          <Text style={styles.creditsValue}>
            {summary.completedCredits} / {summary.totalCredits}
          </Text>
        </View>
        <ProgressBar progress={creditProgress} color={COLORS.success} />
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statText}>
          {summary.passedSubjects} of {summary.totalSubjects} subjects passed
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  gpaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  gpaBlock: {
    alignItems: 'center',
  },
  gpaLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  gpaValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  creditsSection: {
    marginBottom: SPACING.md,
  },
  creditsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  creditsLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  creditsValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  statsRow: {
    alignItems: 'center',
  },
  statText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
