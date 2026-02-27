import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/Badge';
import { SPACING, FONTS, BORDER_RADIUS } from '@/constants/theme';
import type { Installment, InstallmentStatus } from '@/types/finance';

interface InstallmentRowProps {
  installment: Installment;
  onPay?: (installment: Installment) => void;
  isLast?: boolean;
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
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_BADGE: Record<InstallmentStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  paid: { label: 'Paid', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  overdue: { label: 'Overdue', variant: 'error' },
  upcoming: { label: 'Upcoming', variant: 'info' },
};

const STATUS_ICON: Record<InstallmentStatus, { name: keyof typeof Ionicons.glyphMap; colorKey: 'success' | 'warning' | 'error' | 'info' }> = {
  paid: { name: 'checkmark-circle', colorKey: 'success' },
  pending: { name: 'time-outline', colorKey: 'warning' },
  overdue: { name: 'alert-circle', colorKey: 'error' },
  upcoming: { name: 'calendar-outline', colorKey: 'info' },
};

export function InstallmentRow({ installment, onPay, isLast }: InstallmentRowProps) {
  const { colors, fontSize } = useTheme();
  const badge = STATUS_BADGE[installment.status];
  const icon = STATUS_ICON[installment.status];
  const canPay = installment.status === 'pending' || installment.status === 'overdue';

  return (
    <View style={[styles.container, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
      <View style={styles.row}>
        {/* Status icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors[`${icon.colorKey}Light`] }]}>
          <Ionicons name={icon.name} size={20} color={colors[icon.colorKey]} />
        </View>

        {/* Details */}
        <View style={styles.details}>
          <Text style={[styles.description, { color: colors.text, fontSize: fontSize.sm }]}>
            {installment.description}
          </Text>
          <Text style={[styles.dueDate, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
            Due: {formatDate(installment.dueDate)}
            {installment.paidDate && ` · Paid: ${formatDate(installment.paidDate)}`}
          </Text>
          {installment.referenceNumber && (
            <Text style={[styles.reference, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              Ref: {installment.referenceNumber}
            </Text>
          )}
        </View>

        {/* Amount + badge */}
        <View style={styles.rightCol}>
          <Text style={[styles.amount, { color: colors.text, fontSize: fontSize.sm }]}>
            {formatCurrency(installment.amount, installment.currency)}
          </Text>
          <Badge label={badge.label} variant={badge.variant} />
        </View>
      </View>

      {/* Pay button */}
      {canPay && onPay && (
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: colors.primary }]}
          onPress={() => onPay(installment)}
          activeOpacity={0.7}
        >
          <Ionicons name="card-outline" size={16} color={colors.textLight} />
          <Text style={[styles.payButtonText, { color: colors.textLight, fontSize: fontSize.xs }]}>
            Pay Now
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  details: {
    flex: 1,
  },
  description: {
    fontFamily: FONTS.semiBold,
  },
  dueDate: {
    fontFamily: FONTS.regular,
    marginTop: 3,
  },
  reference: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  amount: {
    fontFamily: FONTS.bold,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.pill,
  },
  payButtonText: {
    fontFamily: FONTS.semiBold,
  },
});
