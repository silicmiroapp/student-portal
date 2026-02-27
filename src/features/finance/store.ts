import { create } from 'zustand';
import type {
  FinancialPlan,
  FinanceSummary,
  PaymentRequest,
  PaymentResponse,
} from '@/types/finance';
import { financeApi } from './api';

// Cache duration: 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;

interface FinanceState {
  plan: FinancialPlan | null;
  summary: FinanceSummary | null;
  isLoading: boolean;
  isPaymentLoading: boolean;
  error: string | null;
  paymentError: string | null;
  lastPaymentResult: PaymentResponse | null;
  lastFetchedAt: number | null;

  fetchFinancePlan: (force?: boolean) => Promise<void>;
  fetchSummary: () => Promise<void>;
  payInstallment: (req: PaymentRequest) => Promise<boolean>;
  clearError: () => void;
  clearPaymentResult: () => void;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  plan: null,
  summary: null,
  isLoading: false,
  isPaymentLoading: false,
  error: null,
  paymentError: null,
  lastPaymentResult: null,
  lastFetchedAt: null,

  fetchFinancePlan: async (force = false) => {
    const { lastFetchedAt } = get();
    if (!force && lastFetchedAt && Date.now() - lastFetchedAt < CACHE_TTL_MS) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const [plan, summary] = await Promise.all([
        financeApi.getFinancialPlan(),
        financeApi.getFinanceSummary(),
      ]);
      set({ plan, summary, isLoading: false, lastFetchedAt: Date.now() });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to load financial data. The SIS may be temporarily unavailable.'),
        isLoading: false,
      });
    }
  },

  fetchSummary: async () => {
    try {
      const summary = await financeApi.getFinanceSummary();
      set({ summary });
    } catch {
      // Non-critical — summary fetch failure on dashboard shouldn't block UI
    }
  },

  payInstallment: async (req: PaymentRequest) => {
    set({ isPaymentLoading: true, paymentError: null, lastPaymentResult: null });
    try {
      const result = await financeApi.payInstallment(req);
      // Refresh the full plan after successful payment
      const [plan, summary] = await Promise.all([
        financeApi.getFinancialPlan(),
        financeApi.getFinanceSummary(),
      ]);
      set({
        lastPaymentResult: result,
        plan,
        summary,
        isPaymentLoading: false,
        lastFetchedAt: Date.now(),
      });
      return true;
    } catch (err) {
      set({
        paymentError: getErrorMessage(err, 'Payment failed. Please try again.'),
        isPaymentLoading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null, paymentError: null }),
  clearPaymentResult: () => set({ lastPaymentResult: null }),
}));
