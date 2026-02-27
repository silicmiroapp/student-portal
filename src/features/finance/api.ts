import api from '@/services/api';
import { ENV } from '@/config/env';
import { ENDPOINTS } from '@/constants/api';
import type {
  FinancialPlan,
  FinanceSummary,
  PaymentRequest,
  PaymentResponse,
  Installment,
} from '@/types/finance';
import { MOCK_FINANCIAL_PLAN, getMockFinanceSummary } from '@/mocks/finance';

const MOCK_DELAY = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Keep a mutable copy of mock data so payments persist within the session
let mockPlan = structuredClone(MOCK_FINANCIAL_PLAN);

function recalcMockPlan() {
  mockPlan.paidAmount = mockPlan.installments
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
  mockPlan.remainingAmount = mockPlan.totalAmount - mockPlan.paidAmount;
}

function getMockSummaryFromPlan(): FinanceSummary {
  const overdue = mockPlan.installments.filter((i) => i.status === 'overdue');
  const pending = mockPlan.installments.filter((i) => i.status === 'pending');
  const nextDue = overdue[0] ?? pending[0];

  return {
    totalDue: mockPlan.totalAmount,
    totalPaid: mockPlan.paidAmount,
    totalRemaining: mockPlan.remainingAmount,
    currency: mockPlan.currency,
    nextDueDate: nextDue?.dueDate,
    nextDueAmount: nextDue?.amount,
    overdueCount: overdue.length,
    overdueAmount: overdue.reduce((sum, i) => sum + i.amount, 0),
  };
}

const mockApi = {
  async getFinancialPlan(): Promise<FinancialPlan> {
    await delay(MOCK_DELAY);
    return structuredClone(mockPlan);
  },

  async getFinanceSummary(): Promise<FinanceSummary> {
    await delay(MOCK_DELAY);
    return getMockSummaryFromPlan();
  },

  async payInstallment(req: PaymentRequest): Promise<PaymentResponse> {
    await delay(1000);
    const installment = mockPlan.installments.find((i) => i.id === req.installmentId);
    if (!installment) {
      throw new Error('Installment not found');
    }
    if (installment.status === 'paid') {
      throw new Error('Installment already paid');
    }

    installment.status = 'paid';
    installment.paidDate = new Date().toISOString().split('T')[0];
    installment.paymentMethod = req.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Online Payment';
    installment.referenceNumber = `TXN-${Date.now()}`;
    recalcMockPlan();

    return {
      success: true,
      transactionId: installment.referenceNumber,
      message: 'Payment processed successfully',
      updatedInstallment: structuredClone(installment),
    };
  },
};

const realApi = {
  async getFinancialPlan(): Promise<FinancialPlan> {
    const { data } = await api.get<FinancialPlan>(ENDPOINTS.FINANCE.PLAN);
    return data;
  },

  async getFinanceSummary(): Promise<FinanceSummary> {
    const { data } = await api.get<FinanceSummary>(ENDPOINTS.FINANCE.SUMMARY);
    return data;
  },

  async payInstallment(req: PaymentRequest): Promise<PaymentResponse> {
    const { data } = await api.post<PaymentResponse>(
      ENDPOINTS.FINANCE.PAY(req.installmentId),
      { amount: req.amount, paymentMethod: req.paymentMethod }
    );
    return data;
  },
};

export const financeApi = ENV.USE_MOCK_API ? mockApi : realApi;
