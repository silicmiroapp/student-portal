import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, BORDER_RADIUS, FONTS } from '@/constants/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { colors, fontSize } = useTheme();

  const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: colors.successLight, text: colors.success },
    warning: { bg: colors.warningLight, text: colors.warning },
    error: { bg: colors.errorLight, text: colors.error },
    info: { bg: colors.infoLight, text: colors.info },
    neutral: { bg: colors.surface, text: colors.textSecondary },
  };

  const c = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.label, { color: c.text, fontSize: fontSize.xs }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: FONTS.semiBold,
  },
});
