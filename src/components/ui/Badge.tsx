import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONTS } from '@/constants/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: COLORS.successLight, text: COLORS.success },
  warning: { bg: COLORS.warningLight, text: COLORS.warning },
  error: { bg: COLORS.errorLight, text: COLORS.error },
  info: { bg: COLORS.infoLight, text: COLORS.info },
  neutral: { bg: COLORS.surface, text: COLORS.textSecondary },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const colors = VARIANT_COLORS[variant];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
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
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.semiBold,
  },
});
