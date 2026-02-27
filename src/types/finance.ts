import type { DateString } from './common';

export type InstallmentStatus = 'paid' | 'pending' | 'overdue' | 'upcoming';
export type PaymentMethod = 'bank_transfer' | 'online_payment';

export interface Installment {
  id: string;
  number: number;
  description: string;
  amount: number;
  currency: string;
  dueDate: DateString;
  paidDate?: DateString;
  status: InstallmentStatus;
  paymentMethod?: string;
  referenceNumber?: string;
}

export interface FinancialPlan {
  id: string;
  studentId: string;
  academicYear: string;
  program: string;
  totalAmount: number;
  currency: string;
  paidAmount: number;
  remainingAmount: number;
  installments: Installment[];
}

export interface FinanceSummary {
  totalDue: number;
  totalPaid: number;
  totalRemaining: number;
  currency: string;
  nextDueDate?: DateString;
  nextDueAmount?: number;
  overdueCount: number;
  overdueAmount: number;
}

export interface PaymentRequest {
  installmentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message: string;
  updatedInstallment: Installment;
}
