import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Grade } from '@/types/grades';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONTS } from '@/constants/theme';

interface GradeCardProps {
  grade: Grade;
}

const STATUS_CONFIG: Record<Grade['status'], { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  passed: { label: 'Passed', variant: 'success' },
  failed: { label: 'Failed', variant: 'error' },
  in_progress: { label: 'In Progress', variant: 'info' },
  withdrawn: { label: 'Withdrawn', variant: 'warning' },
};

export function GradeCard({ grade }: GradeCardProps) {
  const config = STATUS_CONFIG[grade.status];

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.gradeCircle}>
          <Text style={styles.gradeLetter}>{grade.letterGrade}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{grade.subject.name}</Text>
          <Text style={styles.code}>{grade.subject.code} · {grade.subject.credits} credits</Text>
        </View>
        <Badge label={config.label} variant={config.variant} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  gradeCircle: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  gradeLetter: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  code: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
