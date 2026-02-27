import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONTS } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { colors, fontSize } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text, fontSize: fontSize.lg }]}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.action, { color: colors.secondary, fontSize: fontSize.sm }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONTS.bold,
  },
  action: {
    fontFamily: FONTS.semiBold,
  },
});
