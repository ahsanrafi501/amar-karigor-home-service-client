'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Check, CircleAlert, Clock3, RefreshCw, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { type BookingRecord, type ResultData, workspaceKeys } from './contracts';
import { PaymentReceipt } from './payment-receipt';
import { derivePaymentReturnState, parsePaymentReturnStatus, PAYMENT_CONFIRMATION_CHECKS, PAYMENT_CONFIRMATION_INTERVAL_MS, validPaymentBookingId, type PaymentReturnState } from './payment-state';
import { actionClass, Notice, panelClass, WorkspaceShell, WorkspaceState } from './workspace-shell';

const stateCopy: Record<PaymentReturnState, { title: string; description: string }> = {
  paid: { title: 'Payment complete. All taken care of.', description: 'Your payment has been received and saved to this appointment. Keep the receipt below for your records.' },
  confirming: { title: 'Checking your payment…', description: 'We’re checking the latest payment record for your appointment. Please keep this page open for a moment.' },
  unconfirmed: { title: 'Your payment is not confirmed yet', description: 'We haven’t found a saved payment for this appointment yet. If money was deducted, don’t pay again. Check the status again or contact our team with your payment reference.' },
  failed: { title: 'The payment was not completed', description: 'The payment provider reported that this attempt failed, and no payment is recorded for this appointment. If money was deducted, contact our team before trying again.' },
  cancelled: { title: 'You left checkout', description: 'This checkout attempt was cancelled. No payment is recorded for this appointment. Your booking is still available below.' },
  error: { title: 'We couldn’t confirm that payment', description: 'Something interrupted payment confirmation. No payment is recorded for this appointment yet. If money was deducted, please don’t pay again; check the status or contact our team.' },
};

export function PaymentResult({ bookingId, status }: { bookingId: string; status?: string }) {
  const { user, loading } = useAuth();
  const client = useQueryClient();
  const [checks, setChecks] = useState(0);
  const hint = parsePaymentReturnStatus(status);
  const validId = validPaymentBookingId(bookingId);
  const enabled = !loading && !!user?.id && validId;
  const query = useQuery({
    queryKey: workspaceKeys.booking(user?.id || '', bookingId),
    enabled,
    staleTime: 0,
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchInterval: (current) => hint === 'success' && !current.state.data?.payment && current.state.status !== 'error' && checks < PAYMENT_CONFIRMATION_CHECKS ? PAYMENT_CONFIRMATION_INTERVAL_MS : false,
    queryFn: async () => {
      const result = await api.get<{ data: ResultData<BookingRecord> }>(`/booking/my-bookings/${encodeURIComponent(bookingId)}`);
      setChecks((completed) => completed + 1);
      return result.data.result;
    },
  });
  const { refetch } = query;
  const payment = query.data?.payment;

  useEffect(() => {
    if (!enabled || !user?.id) return;
    void client.invalidateQueries({ queryKey: workspaceKeys.bookings(user.id) });
    void client.invalidateQueries({ queryKey: workspaceKeys.booking(user.id, bookingId), exact: true, refetchType: 'none' });
  }, [client, enabled, user?.id, bookingId, payment?.id]);

  useEffect(() => {
    if (!enabled) return;
    const refreshOnReturn = (event: PageTransitionEvent) => { if (event.persisted) void refetch(); };
    window.addEventListener('pageshow', refreshOnReturn);
    return () => window.removeEventListener('pageshow', refreshOnReturn);
  }, [enabled, refetch]);

  const returnQuery = new URLSearchParams({ bookingId, ...(status ? { status } : {}) });
  const returnTo = `/bookings/payment-result?${returnQuery.toString()}`;
  const state = derivePaymentReturnState(hint, !!payment, checks);
  const copy = stateCopy[state];
  const retry = () => { setChecks(0); void query.refetch(); };

  return <WorkspaceShell returnTo={returnTo} title="Payment status" description="Check your payment and keep your appointment details close at hand.">
    {!validId ? <WorkspaceState title="We couldn’t find that appointment reference" description="Open your appointment from My bookings to check its payment status."><Link href="/bookings" className={actionClass}>Go to my bookings <ArrowRight size={16} /></Link></WorkspaceState> : query.isPending ? <WorkspaceState loading /> : query.isError && !payment ? <WorkspaceState error={query.error} retry={retry} /> : !query.data ? <WorkspaceState title="Appointment not found" description="This appointment may not belong to your account."><Link href="/bookings" className={actionClass}>My bookings</Link></WorkspaceState> : <div className="grid items-start gap-6 xl:grid-cols-[1.15fr_1fr]">
      <section className={`${panelClass} space-y-6`} role="status" aria-live="polite" aria-busy={state === 'confirming'}>
        <div className={`flex size-16 items-center justify-center rounded-2xl ${state === 'paid' ? 'bg-emerald-50 text-emerald-800' : state === 'confirming' ? 'bg-sky-50 text-sky-800' : 'bg-amber-50 text-amber-800'}`}>{state === 'paid' ? <Check size={30} /> : state === 'confirming' ? <Clock3 size={30} /> : state === 'cancelled' ? <X size={30} /> : <CircleAlert size={30} />}</div>
        <div><h2 className="text-2xl font-semibold tracking-tight text-[#123c2d]">{copy.title}</h2><p className="mt-4 text-sm leading-7 text-stone-500">{copy.description}</p></div>
        {state === 'confirming' ? <div className="flex items-center gap-2 text-sm text-stone-500"><RefreshCw size={16} className="animate-spin" /><span>Checking payment record {Math.min(checks + 1, PAYMENT_CONFIRMATION_CHECKS)} of {PAYMENT_CONFIRMATION_CHECKS}</span></div> : null}
        {query.isError && payment ? <Notice>We couldn’t refresh this receipt just now. Your saved payment details are shown here.</Notice> : null}
        <div className="flex flex-wrap gap-3"><Link href={`/bookings/${bookingId}`} className={actionClass}>View appointment <ArrowRight size={16} /></Link>{state !== 'paid' ? <Button type="button" variant="outline" disabled={query.isFetching} onClick={retry}><RefreshCw size={16} />{query.isFetching ? 'Checking…' : 'Check status again'}</Button> : <Link href="/bookings" className="inline-flex items-center px-3 text-sm font-semibold text-[#123c2d]">All bookings →</Link>}</div>
        {state !== 'paid' && state !== 'confirming' ? <p className="text-sm leading-6 text-stone-500">Need a hand? <Link href="/contact" className="font-semibold text-[#123c2d] underline underline-offset-4">Contact our team</Link>.</p> : null}
        <p className="break-all border-t border-stone-100 pt-5 text-xs text-stone-400">Booking reference: {bookingId}</p>
      </section>
      {payment ? <PaymentReceipt payment={payment} /> : <Notice>Your receipt will appear here after the payment is confirmed. Please use the saved payment record to check whether you need to pay.</Notice>}
    </div>}
  </WorkspaceShell>;
}
