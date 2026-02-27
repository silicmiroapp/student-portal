import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CourseBlock } from '@/types/courses';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

interface CourseContentItemProps {
  block: CourseBlock;
}

const TYPE_ICONS: Record<CourseBlock['type'], keyof typeof Ionicons.glyphMap> = {
  video: 'play-circle-outline',
  reading: 'document-text-outline',
  quiz: 'help-circle-outline',
  assignment: 'create-outline',
  discussion: 'chatbubbles-outline',
};

export function CourseContentItem({ block }: CourseContentItemProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name={TYPE_ICONS[block.type]}
        size={20}
        color={block.completed ? COLORS.success : COLORS.textSecondary}
      />
      <View style={styles.content}>
        <Text
          style={[styles.title, block.completed && styles.completedTitle]}
          numberOfLines={1}
        >
          {block.title}
        </Text>
        {block.duration && (
          <Text style={styles.meta}>{block.duration}</Text>
        )}
      </View>
      {block.completed && (
        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  completedTitle: {
    color: COLORS.textSecondary,
  },
  meta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
