import { Check, CreditCard } from 'lucide-react';
import type { Payment } from '@/types';
import { Button } from '@/components/ui/button';
import { dateTime, money } from './contracts';
import { panelClass } from './workspace-shell';

export function PaymentReceipt({ payment }: { payment: Payment }) {
  return <section className={panelClass} aria-label="Payment receipt">
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-[#123c2d]"><CreditCard size={22} />Payment receipt</h2>
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Payment received</span>
    </div>
    <div className="mb-5 border-y border-stone-100 py-5">
      <p className="text-sm text-stone-500">Amount paid</p>
      <p className="mt-2 text-3xl font-semibold text-[#123c2d]">{money(payment.amount)}</p>
    </div>
    <dl className="space-y-4 text-sm">
      <div><dt className="text-xs text-stone-400">Paid on</dt><dd className="mt-1 text-stone-700">{dateTime(payment.paidAt)}</dd></div>
      <div><dt className="text-xs text-stone-400">Payment method</dt><dd className="mt-1 text-stone-700">{payment.paymentMethod || 'SSLCommerz'}</dd></div>
      <div><dt className="text-xs text-stone-400">{payment.sslcommerceTranId ? 'Transaction reference' : 'Receipt reference'}</dt><dd className="mt-1 break-all font-mono text-xs leading-6 text-stone-700">{payment.sslcommerceTranId || payment.id}</dd></div>
    </dl>
    <Button type="button" className="mt-6 w-full" disabled><Check size={17} />Paid</Button>
    <p className="mt-3 text-center text-xs leading-5 text-stone-500">Your payment is complete. No further payment is needed.</p>
  </section>;
}
