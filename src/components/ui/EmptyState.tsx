import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONTS } from '@/constants/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}

export function EmptyState({ icon = 'folder-open-outline', title, message }: EmptyStateProps) {
  const { colors, fontSize } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={colors.border} />
      <Text style={[styles.title, { color: colors.text, fontSize: fontSize.lg }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  title: {
    fontFamily: FONTS.semiBold,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  message: {
    fontFamily: FONTS.regular,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
