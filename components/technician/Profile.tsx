import type { Technician } from '@/types/technician';

export default function TechnicianProfile({ technician }: { technician: Technician }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-blue-600">Technician</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{technician.name}</h1>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            {technician.rating.toFixed(1)} / 5
          </span>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
            <p className="mt-3 text-slate-600">Email: {technician.email}</p>
            <p className="mt-2 text-slate-600">Phone: {technician.phone}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Services</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {technician.services.map((service) => (
                <span key={service} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
