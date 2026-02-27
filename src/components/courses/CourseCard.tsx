import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import type { Enrollment } from '@/types/courses';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONTS } from '@/constants/theme';

interface CourseCardProps {
  enrollment: Enrollment;
  onPress: () => void;
}

export function CourseCard({ enrollment, onPress }: CourseCardProps) {
  const { course, progress, grade } = enrollment;

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.codeContainer}>
          <Text style={styles.code}>{course.code}</Text>
        </View>
        {grade && <Badge label={grade} variant="success" />}
      </View>
      <Text style={styles.name} numberOfLines={2}>{course.name}</Text>
      <Text style={styles.instructor}>{course.instructor}</Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBarWrapper}>
          <ProgressBar progress={progress} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  codeContainer: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  code: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.secondary,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  instructor: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressBarWrapper: {
    flex: 1,
  },
  progressText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    width: 36,
    textAlign: 'right',
  },
});
