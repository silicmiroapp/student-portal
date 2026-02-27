import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CourseDeadline } from '@/types/courses';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONTS } from '@/constants/theme';

interface UpcomingDeadlineCardProps {
  deadline: CourseDeadline;
}

const TYPE_ICONS: Record<CourseDeadline['type'], keyof typeof Ionicons.glyphMap> = {
  assignment: 'create-outline',
  quiz: 'help-circle-outline',
  exam: 'school-outline',
};

export function UpcomingDeadlineCard({ deadline }: UpcomingDeadlineCardProps) {
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

  const dueColor = isOverdue ? COLORS.error : isUrgent ? COLORS.warning : COLORS.textSecondary;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, isOverdue && styles.overdueIcon]}>
        <Ionicons
          name={TYPE_ICONS[deadline.type]}
          size={18}
          color={isOverdue ? COLORS.error : COLORS.secondary}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{deadline.title}</Text>
        <Text style={styles.course} numberOfLines={1}>{deadline.courseName}</Text>
      </View>
      <View style={styles.dueInfo}>
        <Text style={[styles.dueText, { color: dueColor }]}>{dueLabel}</Text>
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
    backgroundColor: COLORS.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overdueIcon: {
    backgroundColor: COLORS.errorLight,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  course: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dueInfo: {
    alignItems: 'flex-end',
  },
  dueText: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semiBold,
  },
});
