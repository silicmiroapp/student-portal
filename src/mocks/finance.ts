import type { FinancialPlan, FinanceSummary } from '@/types/finance';

export const MOCK_FINANCIAL_PLAN: FinancialPlan = {
  id: 'fp-001',
  studentId: 'BUS-2025-0142',
  academicYear: '2025/2026',
  program: 'Bachelor of Business Administration',
  totalAmount: 6000,
  currency: 'EUR',
  paidAmount: 2000,
  remainingAmount: 4000,
  installments: [
    {
      id: 'inst-001',
      number: 1,
      description: 'Tuition Fee - Installment 1',
      amount: 2000,
      currency: 'EUR',
      dueDate: '2025-09-15',
      paidDate: '2025-09-10',
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'TXN-2025-00412',
    },
    {
      id: 'inst-002',
      number: 2,
      description: 'Tuition Fee - Installment 2',
      amount: 1500,
      currency: 'EUR',
      dueDate: '2025-12-15',
      status: 'overdue',
    },
    {
      id: 'inst-003',
      number: 3,
      description: 'Tuition Fee - Installment 3',
      amount: 1500,
      currency: 'EUR',
      dueDate: '2026-03-15',
      status: 'pending',
    },
    {
      id: 'inst-004',
      number: 4,
      description: 'Tuition Fee - Installment 4',
      amount: 1000,
      currency: 'EUR',
      dueDate: '2026-06-15',
      status: 'upcoming',
    },
  ],
};

export function getMockFinanceSummary(): FinanceSummary {
  const plan = MOCK_FINANCIAL_PLAN;
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
