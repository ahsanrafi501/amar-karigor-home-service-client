import Link from 'next/link';
import type { Technician } from '@/types/technician';

export default function TechnicianCard({ technician }: { technician: Technician }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">{technician.name}</p>
          <p className="text-sm text-slate-500">{technician.email}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {technician.rating.toFixed(1)} ★
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {technician.services.slice(0, 3).map((service) => (
          <span key={service} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
            {service}
          </span>
        ))}
      </div>

      <Link href={`/technicians/${technician.id}`} className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
        View profile
      </Link>
    </div>
  );
}
