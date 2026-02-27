import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import type { FinanceSummary } from '@/types/finance';

interface PaymentNotificationBannerProps {
  summary: FinanceSummary;
  onPress?: () => void;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PaymentNotificationBanner({ summary, onPress }: PaymentNotificationBannerProps) {
  const { colors, fontSize } = useTheme();

  // Show overdue banner if there are overdue installments
  if (summary.overdueCount > 0) {
    return (
      <TouchableOpacity
        style={[styles.banner, { backgroundColor: colors.errorLight, borderColor: colors.errorBorder }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.error }]}>
          <Ionicons name="alert-circle" size={20} color={colors.textLight} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.error, fontSize: fontSize.sm }]}>
            Overdue Payment
          </Text>
          <Text style={[styles.message, { color: colors.text, fontSize: fontSize.xs }]}>
            {summary.overdueCount} installment{summary.overdueCount > 1 ? 's' : ''} overdue ({formatCurrency(summary.overdueAmount, summary.currency)})
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.error} />
      </TouchableOpacity>
    );
  }

  // Show upcoming payment reminder if there's a next due date
  if (summary.nextDueDate && summary.nextDueAmount) {
    return (
      <TouchableOpacity
        style={[styles.banner, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.warning }]}>
          <Ionicons name="time" size={20} color={colors.textLight} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.warning, fontSize: fontSize.sm }]}>
            Upcoming Payment
          </Text>
          <Text style={[styles.message, { color: colors.text, fontSize: fontSize.xs }]}>
            {formatCurrency(summary.nextDueAmount, summary.currency)} due {formatDate(summary.nextDueDate)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.warning} />
      </TouchableOpacity>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
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
  message: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
});
