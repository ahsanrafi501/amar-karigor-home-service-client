import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PaymentReceipt } from '@/components/workspace/payment-receipt';
import { derivePaymentReturnState, parsePaymentReturnStatus, PAYMENT_CONFIRMATION_CHECKS, validPaymentBookingId } from '@/components/workspace/payment-state';

describe('persisted payment presentation', () => {
  it.each(['success', 'failed', 'cancelled', 'error', 'unknown'] as const)('shows a persisted payment as paid even when the return hint is %s', status => {
    expect(derivePaymentReturnState(status, true, 0)).toBe('paid');
  });
  it('does not mark a booking paid from a success query parameter alone', () => {
    expect(derivePaymentReturnState('success', false, 0)).toBe('confirming');
    expect(derivePaymentReturnState('success', false, PAYMENT_CONFIRMATION_CHECKS)).toBe('unconfirmed');
  });
  it.each(['failed', 'cancelled', 'error'] as const)('keeps an unpaid %s return distinct', status => {
    expect(derivePaymentReturnState(status, false, 0)).toBe(status);
  });
  it('rejects missing or malformed booking references before requesting private details', () => {
    expect(validPaymentBookingId('')).toBe(false); expect(validPaymentBookingId('//untrusted.example')).toBe(false);
    expect(validPaymentBookingId('123e4567-e89b-42d3-a456-426614174000')).toBe(true);
    expect(parsePaymentReturnStatus('paid')).toBe('unknown');
  });
  it('renders a disabled Paid button and the stored amount/transaction as a receipt', () => {
    const markup = renderToStaticMarkup(createElement(PaymentReceipt, { payment: { id: 'receipt-id', amount: 125.75, paidAt: '2026-11-14T08:00:00Z', paymentMethod: 'VISA', sslcommerceTranId: 'TXN_CONFIRMED' } }));
    expect(markup).toContain('125.75'); expect(markup).toContain('TXN_CONFIRMED'); expect(markup).toContain('VISA');
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*?Paid<\/button>/);
    expect(markup).not.toContain('Continue to secure payment');
  });
});
