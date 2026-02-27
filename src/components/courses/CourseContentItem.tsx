import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { CourseBlock } from '@/types/courses';
import { SPACING, FONTS } from '@/constants/theme';

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
  const { colors, fontSize } = useTheme();

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
        color={block.completed ? colors.success : colors.textSecondary}
      />
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: colors.text, fontSize: fontSize.sm },
            block.completed && { color: colors.textSecondary },
            block.url && { color: colors.secondary, fontFamily: FONTS.semiBold },
          ]}
          numberOfLines={1}
        >
          {block.title}
        </Text>
        {block.duration && (
          <Text style={[styles.meta, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
            {block.duration}{block.url ? ' · YouTube' : ''}
          </Text>
        )}
      </View>
      {block.completed ? (
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
      ) : block.url ? (
        <Ionicons name="open-outline" size={18} color={colors.secondary} />
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
    fontFamily: FONTS.regular,
  },
  meta: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
});
