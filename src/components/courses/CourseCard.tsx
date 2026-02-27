import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks/useTheme';
import type { Enrollment } from '@/types/courses';
import { SPACING, BORDER_RADIUS, FONTS } from '@/constants/theme';

interface CourseCardProps {
  enrollment: Enrollment;
  onPress: () => void;
}

export function CourseCard({ enrollment, onPress }: CourseCardProps) {
  const { colors, fontSize } = useTheme();
  const { course, progress, grade } = enrollment;

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.codeContainer, { backgroundColor: colors.secondaryLight }]}>
          <Text style={[styles.code, { color: colors.secondary, fontSize: fontSize.xs }]}>
            {course.code}
          </Text>
        </View>
        {grade && <Badge label={grade} variant="success" />}
      </View>
      <Text style={[styles.name, { color: colors.text, fontSize: fontSize.md }]} numberOfLines={2}>
        {course.name}
      </Text>
      <Text style={[styles.instructor, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
        {course.instructor}
      </Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBarWrapper}>
          <ProgressBar progress={progress} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
          {progress}%
        </Text>
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
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  code: {
    fontFamily: FONTS.semiBold,
  },
  name: {
    fontFamily: FONTS.semiBold,
    marginBottom: SPACING.xs,
  },
  instructor: {
    fontFamily: FONTS.regular,
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
    fontFamily: FONTS.semiBold,
    width: 36,
    textAlign: 'right',
  },
});
