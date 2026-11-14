import { z } from 'zod';

export type PaymentReturnStatus = 'success' | 'failed' | 'cancelled' | 'error' | 'unknown';
export type PaymentReturnState = 'paid' | 'confirming' | 'unconfirmed' | 'failed' | 'cancelled' | 'error';
export const PAYMENT_CONFIRMATION_CHECKS = 6;
export const PAYMENT_CONFIRMATION_INTERVAL_MS = 2000;

export function parsePaymentReturnStatus(value: string | undefined): PaymentReturnStatus {
  return value === 'success' || value === 'failed' || value === 'cancelled' || value === 'error' ? value : 'unknown';
}

export function validPaymentBookingId(value: string): boolean {
  return z.uuid().safeParse(value).success;
}

export function derivePaymentReturnState(status: PaymentReturnStatus, hasPersistedPayment: boolean, completedChecks: number): PaymentReturnState {
  if (hasPersistedPayment) return 'paid';
  if (status === 'success') return completedChecks < PAYMENT_CONFIRMATION_CHECKS ? 'confirming' : 'unconfirmed';
  if (status === 'failed' || status === 'cancelled' || status === 'error') return status;
  return 'unconfirmed';
}
