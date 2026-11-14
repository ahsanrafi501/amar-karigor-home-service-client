import { PaymentResult } from '@/components/workspace/payment-result';

export default async function Page({ searchParams }: { searchParams: Promise<{ bookingId?: string | string[]; status?: string | string[] }> }) {
  const params = await searchParams;
  const bookingId = typeof params.bookingId === 'string' ? params.bookingId : '';
  const status = typeof params.status === 'string' ? params.status : undefined;
  return <PaymentResult key={`${bookingId}:${status || ''}`} bookingId={bookingId} status={status} />;
}
