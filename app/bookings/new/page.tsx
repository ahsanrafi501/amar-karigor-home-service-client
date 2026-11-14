import { NewBooking } from '@/components/workspace/customer-workspace';
export default async function Page({ searchParams }: { searchParams: Promise<{ offer?: string }> }) { const { offer } = await searchParams; return <NewBooking offerId={offer || ''} />; }
