import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CourseBlock } from '@/types/courses';
import { COLORS, SPACING, FONT_SIZE, FONTS } from '@/constants/theme';

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
  const handlePress = () => {
    if (block.url) {
      Linking.openURL(block.url);
    }
  };

  const Wrapper = block.url ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.container} onPress={block.url ? handlePress : undefined}>
      <Ionicons
        name={TYPE_ICONS[block.type]}
        size={20}
        color={block.completed ? COLORS.success : COLORS.textSecondary}
      />
      <View style={styles.content}>
        <Text
          style={[styles.title, block.completed && styles.completedTitle, block.url && styles.linkTitle]}
          numberOfLines={1}
        >
          {block.title}
        </Text>
        {block.duration && (
          <Text style={styles.meta}>
            {block.duration}{block.url ? ' · YouTube' : ''}
          </Text>
        )}
      </View>
      {block.completed ? (
        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
      ) : block.url ? (
        <Ionicons name="open-outline" size={18} color={COLORS.secondary} />
      ) : null}
    </Wrapper>
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
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  completedTitle: {
    color: COLORS.textSecondary,
  },
  linkTitle: {
    color: COLORS.secondary,
    fontFamily: FONTS.semiBold,
  },
  meta: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
