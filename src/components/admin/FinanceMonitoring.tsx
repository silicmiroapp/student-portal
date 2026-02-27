import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FinanceSummaryCard } from '@/components/finance/FinanceSummaryCard';
import { InstallmentRow } from '@/components/finance/InstallmentRow';
import { SPACING, FONTS, BORDER_RADIUS } from '@/constants/theme';
import type { UserRecord } from '@/types/admin';
import type { FinancialPlan } from '@/types/finance';
import type { FinanceSummary } from '@/types/finance';

interface FinanceMonitoringProps {
  users: UserRecord[];
  studentFinance: FinancialPlan | null;
  isLoading: boolean;
  onSelectStudent: (user: UserRecord) => void;
}

function computeSummary(plan: FinancialPlan): FinanceSummary {
  const overdue = plan.installments.filter((i) => i.status === 'overdue');
  const pending = plan.installments.filter((i) => i.status === 'pending');
  const nextDue = overdue[0] ?? pending[0];
  return {
    totalDue: plan.totalAmount,
    totalPaid: plan.paidAmount,
    totalRemaining: plan.remainingAmount,
    currency: plan.currency,
    nextDueDate: nextDue?.dueDate,
    nextDueAmount: nextDue?.amount,
    overdueCount: overdue.length,
    overdueAmount: overdue.reduce((sum, i) => sum + i.amount, 0),
  };
}

export function FinanceMonitoring({
  users,
  studentFinance,
  isLoading,
  onSelectStudent,
}: FinanceMonitoringProps) {
  const { colors, fontSize } = useTheme();
  const students = users.filter((u) => u.role === 'user' && u.studentId);

  return (
    <View>
      {/* Student selector */}
      <Text style={[styles.label, { color: colors.text, fontSize: fontSize.sm }]}>
        Select a student to view their financial data:
      </Text>

      <Card style={styles.studentList}>
        {students.map((student, index) => (
          <TouchableOpacity
            key={student.id}
            style={[
              styles.studentRow,
              index < students.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
            ]}
            onPress={() => onSelectStudent(student)}
            activeOpacity={0.7}
          >
            <View style={styles.studentInfo}>
              <Text style={[styles.studentName, { color: colors.text, fontSize: fontSize.sm }]}>
                {student.name}
              </Text>
              <Text style={[styles.studentId, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                {student.studentId} · {student.email}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </Card>

      {/* Selected student finance */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {studentFinance && !isLoading && (
        <View style={styles.financeSection}>
          <View style={[styles.readOnlyBanner, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
            <Ionicons name="eye-outline" size={16} color={colors.warning} />
            <Text style={[styles.readOnlyText, { color: colors.warning, fontSize: fontSize.xs }]}>
              Read-only view — Admin cannot make payments
            </Text>
          </View>

          <View style={styles.planHeader}>
            <Text style={[styles.planTitle, { color: colors.text, fontSize: fontSize.md }]}>
              {studentFinance.program}
            </Text>
            <Badge label={studentFinance.academicYear} variant="info" />
          </View>

          <FinanceSummaryCard summary={computeSummary(studentFinance)} />

          <Card style={styles.installmentCard}>
            {studentFinance.installments.map((inst, index) => (
              <InstallmentRow
                key={inst.id}
                installment={inst}
                isLast={index === studentFinance.installments.length - 1}
              />
            ))}
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: FONTS.semiBold,
    marginBottom: SPACING.sm,
  },
  studentList: {
    marginBottom: SPACING.md,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontFamily: FONTS.semiBold,
  },
  studentId: {
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  loadingContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  financeSection: {
    gap: SPACING.md,
  },
  readOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  readOnlyText: {
    fontFamily: FONTS.semiBold,
    flex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontFamily: FONTS.semiBold,
    flex: 1,
  },
  installmentCard: {
    marginTop: SPACING.xs,
  },
});
