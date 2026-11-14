'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, CreditCard, MapPin, Star, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { type BookingRecord, type OfferRecord, type ResultData, dateTime, money, workspaceKeys } from './contracts';
import { PaymentReceipt } from './payment-receipt';
import { actionClass, FieldError, Notice, panelClass, StatCard, StatusBadge, WorkspaceShell, WorkspaceState } from './workspace-shell';

const useCustomerBookings = () => {
  const { user, loading } = useAuth();
  const enabled = !loading && !!user?.id;
  const query = useQuery({ queryKey: workspaceKeys.bookings(user?.id || ''), enabled,
    refetchOnMount: 'always', refetchOnWindowFocus: 'always', staleTime: 0,
    queryFn: async () => (await api.get<{ data: ResultData<BookingRecord[]> }>('/booking/my-bookings')).data.result,
  });
  useBookingPageReturn(enabled, query.refetch);
  return query;
};

export function CustomerDashboard() {
  const { user } = useAuth();
  const query = useCustomerBookings();
  const bookings = query.data || [];
  const active = bookings.filter((booking) => !['CANCELLED', 'COMPLETED'].includes(booking.status));
  const next = [...active].sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))[0];
  return <WorkspaceShell title={`Good to see you${user?.name ? `, ${user.name.split(' ')[0]}` : ''}.`} description="A well-cared-for home starts here. Keep an eye on your appointments and find your next helping hand." action={<Link href="/services" className={actionClass}>Book a service <ArrowRight size={16} /></Link>}>
    {query.isLoading ? <WorkspaceState loading /> : query.isError ? <WorkspaceState error={query.error} retry={() => void query.refetch()} /> : <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Total bookings" value={bookings.length} hint="Your appointments so far" /><StatCard label="Active appointments" value={active.length} hint="Pending, confirmed or in progress" /><StatCard label="Jobs completed" value={bookings.filter((booking) => booking.status === 'COMPLETED').length} hint="A little more peace of mind" /></div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]"><section className="rounded-2xl bg-[#123c2d] p-7 text-white sm:p-8"><div className="mb-6 flex items-center gap-2 text-xs font-medium text-[#d9f568]"><CalendarDays size={16} /> UP NEXT</div><h2 className="text-2xl font-semibold">{next ? next.TechnicianService?.service?.name || 'Your next home service' : 'Your next project starts here.'}</h2><p className="mt-3 text-sm leading-7 text-white/65">{next ? `${dateTime(next.startTime)} · ${next.technicianProfile?.serviceArea || 'Location to be confirmed'}` : 'From a small repair to a fresh start, find a professional who knows just what your home needs.'}</p><Link href={next ? `/bookings/${next.id}` : '/services'} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#d9f568] px-5 py-3 text-sm font-semibold text-[#123c2d]">{next ? 'View appointment' : 'Find your professional'}<ArrowRight size={16} /></Link></section><section className={panelClass}><div className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-[#f3f5ee] text-[#123c2d]"><Wrench size={22} /></div><h2 className="text-lg font-semibold text-[#123c2d]">Good with your hands?</h2><p className="mt-3 text-sm leading-7 text-stone-500">Bring your skills to the neighbourhood. Apply to join our community of home service professionals.</p><Link href="/become-a-technician" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#123c2d]">Become a professional <ArrowRight size={16} /></Link></section></div>
      <div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-[#123c2d]">Recent appointments</h2><Link href="/bookings" className="text-sm font-medium text-[#123c2d]">View all →</Link></div>
      {bookings.length ? <div className="space-y-3">{[...bookings].sort((a, b) => Date.parse(b.createdAt || b.startTime) - Date.parse(a.createdAt || a.startTime)).slice(0, 3).map((booking) => <BookingRow key={booking.id} booking={booking} />)}</div> : <WorkspaceState title="Make yourself at home" description="Your appointments will appear here once you book a service."><Link href="/services" className={actionClass}>Explore services <ArrowRight size={16} /></Link></WorkspaceState>}
    </div>}
  </WorkspaceShell>;
}

export function BookingList() {
  const query = useCustomerBookings();
  const [filter, setFilter] = useState('ALL');
  const bookings = [...(query.data || [])].sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime));
  const visible = bookings.filter((booking) => filter === 'ALL' || (filter === 'ACTIVE' ? !['CANCELLED', 'COMPLETED'].includes(booking.status) : booking.status === filter));
  return <WorkspaceShell title="My bookings" description="Every appointment, neatly in one place. View the details and follow your service from start to finish." action={<Link href="/services" className={actionClass}>Find a service <ArrowRight size={16} /></Link>}>
    <div className="mb-6 flex flex-wrap gap-2" aria-label="Filter bookings">{[['ALL', 'All appointments'], ['ACTIVE', 'Active'], ['COMPLETED', 'Completed'], ['CANCELLED', 'Cancelled']].map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`rounded-full border px-4 py-2.5 text-sm transition ${filter === value ? 'border-[#123c2d] bg-[#123c2d] text-white' : 'border-stone-200 bg-white text-stone-500 hover:border-stone-400'}`}>{label}</button>)}</div>
    {query.isLoading ? <WorkspaceState loading /> : query.isError ? <WorkspaceState error={query.error} retry={() => void query.refetch()} /> : visible.length ? <div className="space-y-4">{visible.map((booking) => <BookingRow key={booking.id} booking={booking} />)}</div> : <WorkspaceState title={bookings.length ? 'Nothing in this view yet' : 'Your first helping hand is waiting'} description={bookings.length ? 'Try another filter to see your other appointments.' : 'Find a home service and choose a time that works for you.'}><Link href="/services" className={actionClass}>Browse services</Link></WorkspaceState>}
  </WorkspaceShell>;
}

export function BookingRow({ booking, detail = true }: { booking: BookingRecord; detail?: boolean }) {
  const content = <><div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#edf1e9] text-[#123c2d]"><Wrench size={22} /></div><div className="min-w-0 flex-1"><h3 className="font-semibold text-[#123c2d]">{booking.TechnicianService?.service?.name || 'Home service appointment'}</h3><p className="mt-1 text-xs leading-6 text-stone-500">{dateTime(booking.startTime)}{booking.technicianProfile?.serviceArea ? ` · ${booking.technicianProfile.serviceArea}` : ''}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-stone-400">Reference {booking.id.slice(0, 8)}</p></div><div className="flex shrink-0 flex-col items-end gap-3"><StatusBadge status={booking.status} />{booking.payment ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800"><Check size={13} />Paid · {money(booking.payment.amount)}</span> : booking.TechnicianService?.price != null ? <span className="text-sm font-semibold text-[#123c2d]">{money(booking.TechnicianService.price)}</span> : null}</div>{detail ? <ArrowRight size={17} className="hidden shrink-0 text-stone-400 sm:block" /> : null}</>;
  return detail ? <Link href={`/bookings/${booking.id}`} className={`${panelClass} flex items-center gap-4 transition hover:border-[#123c2d]/30 hover:shadow-sm`}>{content}</Link> : <div className={`${panelClass} flex items-center gap-4`}>{content}</div>;
}

const reviewSchema = z.object({ rating: z.string().refine((value) => /^[1-5]$/.test(value), 'Choose a rating from 1 to 5.'), title: z.string().max(100, 'Keep the title within 100 characters.'), description: z.string().max(255, 'Keep your review within 255 characters.') });
type ReviewFields = z.infer<typeof reviewSchema>;

function ReviewForm({ bookingId }: { bookingId: string }) {
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const client = useQueryClient();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReviewFields>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: '', title: '', description: '' } });
  const mutation = useMutation({ mutationFn: (values: ReviewFields) => api.post(`/review/${bookingId}`, { ...values, rating: Number(values.rating) }), onSuccess: () => { setSubmitted(true); toast.success('Thank you for sharing your experience.'); void client.invalidateQueries({ queryKey: workspaceKeys.bookings(user?.id || '') }); }, onError: (error) => toast.error(error.message) });
  const rating = Number(watch('rating'));
  if (submitted) return <div className={`${panelClass} text-center`} role="status"><Check className="mx-auto mb-3 text-emerald-700" /><h2 className="text-lg font-semibold text-[#123c2d]">Your review is in. Thank you!</h2><p className="mt-2 text-sm text-stone-500">You’re helping your neighbours find great professionals.</p></div>;
  return <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className={`${panelClass} space-y-5`}><div><h2 className="text-lg font-semibold text-[#123c2d]">How did it go?</h2><p className="mt-2 text-sm leading-6 text-stone-500">Share a little about your experience. You can leave one review for this appointment.</p></div><fieldset><legend className="mb-2 text-sm font-medium">Your rating</legend><div className="flex gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-label={`${value} star${value > 1 ? 's' : ''}`} aria-pressed={rating === value} onClick={() => setValue('rating', String(value), { shouldValidate: true })} className="rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-[#123c2d]"><Star size={25} className={value <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'} /></button>)}</div><FieldError message={errors.rating?.message} /></fieldset><div><Label htmlFor="review-title">A few words (optional)</Label><Input id="review-title" className="mt-2" placeholder="A job well done" maxLength={100} {...register('title')} /><FieldError message={errors.title?.message} /></div><div><Label htmlFor="review-description">Your experience (optional)</Label><Textarea id="review-description" className="mt-2" placeholder="What would you like your neighbours to know?" maxLength={255} {...register('description')} /><FieldError message={errors.description?.message} /></div>{mutation.isError ? <p role="alert" className="text-sm text-rose-700">{mutation.error.message}</p> : null}<Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Sharing…' : 'Share my review'}</Button><p className="text-xs leading-5 text-stone-400">If you have already left a review, it cannot be submitted again.</p></form>;
}

function useBookingPageReturn(enabled: boolean, refetch: () => unknown) {
  useEffect(() => {
    if (!enabled) return;
    const refreshOnReturn = (event: PageTransitionEvent) => { if (event.persisted) void refetch(); };
    window.addEventListener('pageshow', refreshOnReturn);
    return () => window.removeEventListener('pageshow', refreshOnReturn);
  }, [enabled, refetch]);
}

export function BookingDetail({ id }: { id: string }) {
  const { user, loading } = useAuth();
  const client = useQueryClient();
  const enabled = !loading && !!user?.id && !!id;
  const query = useQuery({
    queryKey: workspaceKeys.booking(user?.id || '', id), enabled,
    refetchOnMount: 'always', refetchOnWindowFocus: 'always', staleTime: 0,
    queryFn: async () => (await api.get<{ data: ResultData<BookingRecord> }>(`/booking/my-bookings/${encodeURIComponent(id)}`)).data.result,
  });
  useBookingPageReturn(enabled, query.refetch);
  const payment = useMutation({
    mutationFn: () => {
      if (query.data?.payment) throw new Error('This appointment has already been paid.');
      return api.post<{ data: { paymentUrl: string } }>('/payment/initiate-payment', { bookingId: id });
    },
    onSuccess: (result) => {
      try {
        const url = new URL(result.data.paymentUrl);
        if (url.protocol !== 'https:' || !(url.hostname === 'sslcommerz.com' || url.hostname.endsWith('.sslcommerz.com'))) throw new Error('The payment link could not be verified.');
        window.location.assign(url.href);
      } catch { toast.error('We could not open a secure payment page. Please try again.'); }
    },
    onError: async (error) => {
      toast.error(error.message);
      await Promise.all([query.refetch(), client.invalidateQueries({ queryKey: workspaceKeys.bookings(user?.id || '') })]);
    },
  });
  const booking = query.data;
  return <WorkspaceShell title="Appointment details" description="Everything you need for your upcoming service, and a little peace of mind.">
    <Link href="/bookings" className="mb-6 inline-flex items-center gap-2 text-sm text-stone-500"><ArrowLeft size={16} />Back to my bookings</Link>
    {query.isLoading ? <WorkspaceState loading /> : query.isError && !booking ? <WorkspaceState error={query.error} retry={() => void query.refetch()} /> : !booking ? <WorkspaceState title="Appointment not found" description="This appointment may not belong to your account." /> : <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <section className={panelClass}>
          <div className="mb-6 flex items-start justify-between gap-3"><div><p className="mb-3 text-xs uppercase tracking-widest text-stone-400">HOME SERVICE</p><h2 className="text-2xl font-semibold text-[#123c2d]">{booking.TechnicianService?.service?.name || 'Your appointment'}</h2></div><StatusBadge status={booking.status} /></div>
          <dl className="space-y-5 border-t border-stone-100 pt-6"><DetailItem icon={CalendarDays} label="Starts" value={dateTime(booking.startTime)} /><DetailItem icon={Clock3} label="Ends" value={dateTime(booking.endTime)} /><DetailItem icon={MapPin} label="Service area" value={booking.technicianProfile?.serviceArea || 'To be confirmed'} /><DetailItem icon={Wrench} label="Professional" value={booking.technicianProfile?.user?.name || `Professional ${booking.technicianProfileId.slice(0, 8)}`} /></dl>
          {booking.cancellationReason ? <p className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Cancellation reason: {booking.cancellationReason}</p> : null}
          <p className="mt-6 break-all border-t border-stone-100 pt-5 text-xs text-stone-400">Booking reference: {booking.id}</p>
        </section>
        {query.isError ? <Notice>We couldn’t refresh this appointment just now. The latest saved details are shown here.</Notice> : null}
        <Notice>Your professional will confirm and update the appointment as work progresses. Contact our team if you need help with a change.</Notice>
      </div>
      <div className="space-y-6">
        {booking.payment ? <PaymentReceipt payment={booking.payment} /> : <section className={panelClass}>
          <CreditCard className="mb-4 text-[#123c2d]" size={24} /><h2 className="text-lg font-semibold text-[#123c2d]">Payment</h2>
          <div className="my-5 flex items-center justify-between border-y border-stone-100 py-5"><span className="text-sm text-stone-500">Listed service price</span><span className="text-2xl font-semibold text-[#123c2d]">{booking.TechnicianService ? money(booking.TechnicianService.price) : 'Not available'}</span></div>
          <p className="mb-5 text-sm leading-6 text-stone-500">No payment is recorded for this appointment yet. If you recently paid, check the latest status before trying again.</p>
          {booking.status !== 'CANCELLED' ? <Button type="button" className="w-full" onClick={() => payment.mutate()} disabled={payment.isPending || query.isFetching || query.isError || booking.status !== 'COMPLETED' || !booking.TechnicianService || booking.TechnicianService.price < 10}>{payment.isPending ? 'Opening secure checkout…' : query.isFetching ? 'Checking payment status…' : 'Continue to secure payment'}<ArrowRight size={16} /></Button> : <Notice>This appointment was cancelled.</Notice>}
          <Button type="button" variant="ghost" className="mt-2 w-full" disabled={query.isFetching} onClick={() => void query.refetch()}>{query.isFetching ? 'Checking…' : 'Refresh payment status'}</Button>
          {payment.isError ? <p role="alert" className="mt-3 text-sm text-rose-700">{payment.error.message}</p> : null}
          {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' ? <p className="mt-3 text-xs leading-5 text-stone-500">Payment opens once the service is completed.</p> : booking.TechnicianService && booking.TechnicianService.price < 10 ? <p className="mt-3 text-xs leading-5 text-stone-500">Online checkout requires a service price of at least ৳10.</p> : null}
          <p className="mt-4 text-center text-xs text-stone-400">Secure payment with SSLCommerz · BDT</p>
        </section>}
        {booking.status === 'COMPLETED' && user?.role !== 'TECHNICIAN' ? <ReviewForm bookingId={booking.id} /> : <Notice>{user?.role === 'TECHNICIAN' ? 'Reviews are available to customer accounts.' : 'You can share your experience after your appointment is completed.'}</Notice>}
      </div>
    </div>}
  </WorkspaceShell>;
}

function DetailItem({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <div className="flex gap-3"><Icon size={18} className="mt-1 shrink-0 text-stone-400" /><div><dt className="text-xs text-stone-400">{label}</dt><dd className="mt-1 text-sm font-medium text-stone-700">{value}</dd></div></div>; }

const bookingSchema = z.object({ startTime: z.string().min(1, 'Choose a start date and time.'), endTime: z.string().min(1, 'Choose an end date and time.') }).superRefine((values, context) => {
  const start = Date.parse(values.startTime), end = Date.parse(values.endTime);
  if (!Number.isFinite(start) || start <= Date.now()) context.addIssue({ code: 'custom', path: ['startTime'], message: 'Choose a future date and time.' });
  if (!Number.isFinite(end) || end <= start) context.addIssue({ code: 'custom', path: ['endTime'], message: 'The end time must be after the start time.' });
});
type BookingFields = z.infer<typeof bookingSchema>;

export function NewBooking({ offerId }: { offerId: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['workspace', user?.id, 'booking-offers'], enabled: !loading && !!user?.id && !!offerId, queryFn: async () => (await api.get<{ data: { services: OfferRecord[] } }>('/services')).data.services });
  const offer = query.data?.find((item) => item.id === offerId);
  const { register, handleSubmit, formState: { errors } } = useForm<BookingFields>({ resolver: zodResolver(bookingSchema) });
  const mutation = useMutation({ mutationFn: (values: BookingFields) => api.post<{ data: ResultData<BookingRecord> }>(`/booking/create/${encodeURIComponent(offerId)}`, { startTime: new Date(values.startTime).toISOString(), endTime: new Date(values.endTime).toISOString() }), onSuccess: (result) => { toast.success('Your appointment request is in.'); void client.invalidateQueries({ queryKey: workspaceKeys.bookings(user?.id || '') }); router.push(`/bookings/${result.data.result.id}`); }, onError: (error) => toast.error(error.message) });
  return <WorkspaceShell returnTo={`/bookings/new?offer=${encodeURIComponent(offerId)}`} title="A little care for your home" description="Choose when you need a helping hand. Your professional will confirm your appointment.">
    {query.isLoading ? <WorkspaceState loading /> : query.isError ? <WorkspaceState error={query.error} retry={() => void query.refetch()} /> : !offer ? <WorkspaceState title="Choose a service first" description="Find a professional and service before making your appointment."><Link href="/services" className={actionClass}>Explore services</Link></WorkspaceState> : offer.technicianProfile?.userId === user?.id ? <WorkspaceState title="This is your own service" description="Choose another professional when making a personal appointment." /> : offer.technicianProfile?.verificationStatus !== 'VERIFIED' ? <WorkspaceState title="This professional is not taking bookings yet" description="Please choose a verified professional for your appointment."><Link href="/services" className={actionClass}>Find a professional</Link></WorkspaceState> : <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]"><form onSubmit={handleSubmit((values) => mutation.mutate(values))} className={`${panelClass} space-y-6`}><h2 className="text-xl font-semibold text-[#123c2d]">Find a time that works</h2><div><Label htmlFor="booking-start">Start date and time</Label><Input className="mt-2" id="booking-start" type="datetime-local" {...register('startTime')} /><FieldError message={errors.startTime?.message} /></div><div><Label htmlFor="booking-end">End date and time</Label><Input className="mt-2" id="booking-end" type="datetime-local" {...register('endTime')} /><FieldError message={errors.endTime?.message} /></div><Notice>Times use your device’s local time zone. This is an appointment request; your professional will confirm availability.</Notice>{mutation.isError ? <p role="alert" className="text-sm text-rose-700">{mutation.error.message}</p> : null}<Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Requesting…' : 'Request appointment'}<ArrowRight size={16} /></Button></form><section className={`${panelClass} h-fit`}><span className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-[#edf1e9] text-[#123c2d]"><Wrench size={28} /></span><p className="mb-2 text-xs uppercase tracking-wider text-stone-400">YOUR SERVICE</p><h2 className="text-2xl font-semibold text-[#123c2d]">{offer.service?.name || 'Home service'}</h2><p className="mt-3 text-sm leading-7 text-stone-500">{offer.service?.description || 'A trusted helping hand for your home.'}</p><div className="mt-6 border-t border-stone-100 pt-5"><p className="text-sm text-stone-500">Listed service price</p><p className="mt-2 text-3xl font-semibold text-[#123c2d]">{money(offer.price)}</p></div><p className="mt-5 text-xs leading-6 text-stone-400">Payment opens after your service is completed.</p></section></div>}
  </WorkspaceShell>;
}
