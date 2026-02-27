import { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { FinanceSummaryCard } from '@/components/finance/FinanceSummaryCard';
import { InstallmentRow } from '@/components/finance/InstallmentRow';
import { PaymentModal } from '@/components/finance/PaymentModal';
import { useFinanceStore } from '@/features/finance/store';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { useTheme } from '@/hooks/useTheme';
import {
  SPACING,
  BORDER_RADIUS,
  FONTS,
} from '@/constants/theme';
import type { Installment, PaymentMethod } from '@/types/finance';

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const { colors, fontSize } = useTheme();
  const {
    plan,
    summary,
    isLoading,
    isPaymentLoading,
    error,
    paymentError,
    lastPaymentResult,
    fetchFinancePlan,
    payInstallment,
    clearError,
    clearPaymentResult,
  } = useFinanceStore();

  const [payingInstallment, setPayingInstallment] = useState<Installment | null>(null);

  useEffect(() => {
    fetchFinancePlan(true);
  }, [fetchFinancePlan]);

  useRefreshOnFocus(() => fetchFinancePlan(true));

  const onRefresh = useCallback(() => {
    fetchFinancePlan(true);
  }, [fetchFinancePlan]);

  const handlePay = useCallback((installment: Installment) => {
    setPayingInstallment(installment);
  }, []);

  const handleConfirmPayment = useCallback(async (installmentId: string, method: PaymentMethod) => {
    const installment = plan?.installments.find((i) => i.id === installmentId);
    if (!installment) return;

    const success = await payInstallment({
      installmentId,
      amount: installment.amount,
      paymentMethod: method,
    });

    if (success) {
      setPayingInstallment(null);
      Alert.alert('Payment Successful', 'Your payment has been processed successfully.');
    }
  }, [plan, payInstallment]);

  const handleCloseModal = useCallback(() => {
    if (!isPaymentLoading) {
      setPayingInstallment(null);
      clearPaymentResult();
    }
  }, [isPaymentLoading, clearPaymentResult]);

  // Show payment error
  useEffect(() => {
    if (paymentError) {
      Alert.alert('Payment Failed', paymentError, [
        { text: 'OK', onPress: clearError },
      ]);
    }
  }, [paymentError, clearError]);

  if (isLoading && !plan) {
    return <LoadingScreen />;
  }

  if (error && !plan) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSize.xl }]}>
            Finance
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <View style={[styles.errorIconContainer, { backgroundColor: colors.errorLight }]}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.error} />
          </View>
          <Text style={[styles.errorTitle, { color: colors.text, fontSize: fontSize.lg }]}>
            Unable to Load Finance Data
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
            {error}
          </Text>
          <View style={styles.retryContainer}>
            <Card onPress={onRefresh} style={styles.retryCard}>
              <View style={styles.retryRow}>
                <Ionicons name="refresh-outline" size={20} color={colors.primary} />
                <Text style={[styles.retryText, { color: colors.primary, fontSize: fontSize.sm }]}>
                  Tap to Retry
                </Text>
              </View>
            </Card>
          </View>
        </View>
      </View>
    );
  }

  if (!plan || !summary) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSize.xl }]}>
            Finance
          </Text>
        </View>
        <EmptyState
          icon="wallet-outline"
          title="No Financial Data"
          message="Your financial plan hasn't been set up yet. Please contact the finance office."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSize.xl }]}>
            Finance
          </Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
            {plan.academicYear} · {plan.program}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <View style={styles.section}>
          <SectionHeader title="Payment Summary" />
          <FinanceSummaryCard summary={summary} />
        </View>

        {/* Installments */}
        <View style={styles.section}>
          <SectionHeader title="Installments" />
          <Card>
            {plan.installments.map((installment, index) => (
              <InstallmentRow
                key={installment.id}
                installment={installment}
                onPay={handlePay}
                isLast={index === plan.installments.length - 1}
              />
            ))}
          </Card>
        </View>

        {/* Academic year info */}
        <View style={styles.section}>
          <View style={[styles.infoBox, { backgroundColor: colors.infoLight, borderColor: colors.info }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <Text style={[styles.infoText, { color: colors.text, fontSize: fontSize.xs }]}>
              For questions about your financial plan, contact the Student Finance Office or visit the SIS portal.
            </Text>
          </View>
        </View>

        <View style={{ height: insets.bottom + SPACING.lg }} />
      </ScrollView>

      {/* Payment modal */}
      <PaymentModal
        visible={payingInstallment !== null}
        installment={payingInstallment}
        isLoading={isPaymentLoading}
        onConfirm={handleConfirmPayment}
        onClose={handleCloseModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
  },
  headerSub: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  section: {
    marginBottom: 28,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  infoText: {
    fontFamily: FONTS.regular,
    flex: 1,
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  errorTitle: {
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
  },
  errorMessage: {
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  retryContainer: {
    marginTop: SPACING.lg,
    width: '100%',
    maxWidth: 200,
  },
  retryCard: {
    alignItems: 'center',
  },
  retryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  retryText: {
    fontFamily: FONTS.semiBold,
  },
});
