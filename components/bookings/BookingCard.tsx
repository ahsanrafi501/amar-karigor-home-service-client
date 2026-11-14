import Link from 'next/link';
import type { Booking } from '@/types/booking';

export default function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{booking.serviceName}</h2>
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
          {booking.status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p><span className="font-medium text-slate-800">Technician:</span> {booking.technicianName}</p>
        <p><span className="font-medium text-slate-800">Date:</span> {booking.date}</p>
        <p><span className="font-medium text-slate-800">Time:</span> {booking.time}</p>
      </div>

      <Link href={`/bookings/${booking.id}`} className="mt-4 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
        View details
      </Link>
    </div>
  );
}
