import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { CourseDeadline } from '@/types/courses';
import { SPACING, BORDER_RADIUS, FONTS } from '@/constants/theme';

interface UpcomingDeadlineCardProps {
  deadline: CourseDeadline;
}

const TYPE_ICONS: Record<CourseDeadline['type'], keyof typeof Ionicons.glyphMap> = {
  assignment: 'create-outline',
  quiz: 'help-circle-outline',
  exam: 'school-outline',
};

export function UpcomingDeadlineCard({ deadline }: UpcomingDeadlineCardProps) {
  const { colors, fontSize } = useTheme();

  const now = new Date();
  const dueDate = new Date(deadline.dueDate);
  const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const isUrgent = daysLeft >= 0 && daysLeft <= 2;

  const dueLabel = isOverdue
    ? `${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} overdue`
    : daysLeft === 0
      ? 'Due today'
      : daysLeft === 1
        ? 'Due tomorrow'
        : `${daysLeft} days left`;

  const dueColor = isOverdue ? colors.error : isUrgent ? colors.warning : colors.textSecondary;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isOverdue ? colors.errorLight : colors.secondaryLight },
        ]}
      >
        <Ionicons
          name={TYPE_ICONS[deadline.type]}
          size={18}
          color={isOverdue ? colors.error : colors.secondary}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSize.sm }]} numberOfLines={1}>
          {deadline.title}
        </Text>
        <Text style={[styles.course, { color: colors.textSecondary, fontSize: fontSize.xs }]} numberOfLines={1}>
          {deadline.courseName}
        </Text>
      </View>
      <View style={styles.dueInfo}>
        <Text style={[styles.dueText, { color: dueColor, fontSize: fontSize.xs }]}>{dueLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.semiBold,
  },
  course: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  dueInfo: {
    alignItems: 'flex-end',
  },
  dueText: {
    fontFamily: FONTS.semiBold,
  },
});
