import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks/useTheme';
import type { Grade } from '@/types/grades';
import { SPACING, BORDER_RADIUS, FONTS } from '@/constants/theme';

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
  const { colors, fontSize } = useTheme();
  const config = STATUS_CONFIG[grade.status];

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.gradeCircle, { backgroundColor: colors.surface, borderColor: colors.secondary }]}>
          <Text style={[styles.gradeLetter, { color: colors.secondary, fontSize: fontSize.md }]}>
            {grade.letterGrade}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text, fontSize: fontSize.sm }]} numberOfLines={1}>
            {grade.subject.name}
          </Text>
          <Text style={[styles.code, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
            {grade.subject.code} · {grade.subject.credits} credits
          </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  gradeLetter: {
    fontFamily: FONTS.bold,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.semiBold,
  },
  code: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
});
