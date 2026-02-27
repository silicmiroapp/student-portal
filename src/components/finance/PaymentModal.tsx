import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import type { Installment, PaymentMethod } from '@/types/finance';
import { useState } from 'react';

interface PaymentModalProps {
  visible: boolean;
  installment: Installment | null;
  isLoading: boolean;
  onConfirm: (installmentId: string, method: PaymentMethod) => void;
  onClose: () => void;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'bank_transfer', label: 'Bank Transfer', icon: 'business-outline' },
  { key: 'online_payment', label: 'Online Payment', icon: 'card-outline' },
];

export function PaymentModal({ visible, installment, isLoading, onConfirm, onClose }: PaymentModalProps) {
  const { colors, fontSize } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('online_payment');

  if (!installment) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: fontSize.lg }]}>
              Confirm Payment
            </Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <View style={[styles.amountBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text style={[styles.amountLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              Amount to Pay
            </Text>
            <Text style={[styles.amountValue, { color: colors.primary, fontSize: fontSize.xl }]}>
              {formatCurrency(installment.amount, installment.currency)}
            </Text>
            <Text style={[styles.amountDesc, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
              {installment.description}
            </Text>
          </View>

          {/* Payment method selector */}
          <Text style={[styles.sectionLabel, { color: colors.text, fontSize: fontSize.sm }]}>
            Payment Method
          </Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.key}
              style={[
                styles.methodOption,
                {
                  borderColor: selectedMethod === method.key ? colors.primary : colors.borderLight,
                  backgroundColor: selectedMethod === method.key ? colors.primaryLight : colors.background,
                },
              ]}
              onPress={() => setSelectedMethod(method.key)}
              disabled={isLoading}
            >
              <Ionicons
                name={method.icon}
                size={22}
                color={selectedMethod === method.key ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.methodLabel,
                  {
                    color: selectedMethod === method.key ? colors.primary : colors.text,
                    fontSize: fontSize.sm,
                  },
                ]}
              >
                {method.label}
              </Text>
              {selectedMethod === method.key && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}

          {/* Confirm button */}
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: colors.primary }, isLoading && styles.disabled]}
            onPress={() => onConfirm(installment.id, selectedMethod)}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.textLight} />
                <Text style={[styles.confirmText, { color: colors.textLight, fontSize: fontSize.md }]}>
                  Pay {formatCurrency(installment.amount, installment.currency)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
  },
  amountBox: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  amountLabel: {
    fontFamily: FONTS.regular,
    marginBottom: SPACING.xs,
  },
  amountValue: {
    fontFamily: FONTS.bold,
  },
  amountDesc: {
    fontFamily: FONTS.regular,
    marginTop: SPACING.xs,
  },
  sectionLabel: {
    fontFamily: FONTS.semiBold,
    marginBottom: SPACING.sm,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  methodLabel: {
    fontFamily: FONTS.semiBold,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BORDER_RADIUS.pill,
    gap: SPACING.sm,
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  confirmText: {
    fontFamily: FONTS.semiBold,
  },
});
