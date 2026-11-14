'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ArrowRight, CalendarDays, ClipboardList, Grid2X2, Layers, ShieldCheck, UserRound, Wrench } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { readable } from './contracts';

const customerLinks = [
  { href: '/customer/dashboard', label: 'Overview', icon: Grid2X2 },
  { href: '/bookings', label: 'My bookings', icon: CalendarDays },
  { href: '/become-a-technician', label: 'Become a professional', icon: Wrench },
];
const technicianLinks = [
  { href: '/technician/dashboard', label: 'Overview', icon: Grid2X2 },
  { href: '/technician/bookings', label: 'Assigned jobs', icon: ClipboardList },
  { href: '/technician/services', label: 'My services', icon: Wrench },
  { href: '/technician/profile', label: 'Professional profile', icon: UserRound },
  { href: '/bookings', label: 'Personal bookings', icon: CalendarDays },
];
const adminLinks = [
  { href: '/admin', label: 'Overview', icon: Grid2X2 },
  { href: '/admin/technicians', label: 'Applications', icon: ShieldCheck },
  { href: '/admin/bookings', label: 'All bookings', icon: CalendarDays },
  { href: '/admin/categories', label: 'Service catalogue', icon: Layers },
  { href: '/admin/users', label: 'Account management', icon: UserRound },
];

export function WorkspaceShell({ children, title, description, area = 'customer', action, returnTo }: {
  children: ReactNode; title: string; description: string; area?: 'customer' | 'technician' | 'admin'; action?: ReactNode; returnTo?: string;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  if (loading) return <div className="mx-auto max-w-7xl px-6 py-20"><WorkspaceState loading /></div>;
  if (!user) return <div className="mx-auto max-w-2xl px-6 py-20"><WorkspaceState title="Your home, all in one place" description="Sign in to manage your appointments and professional profile."><Link href={`/login?redirect=${encodeURIComponent(returnTo || pathname)}`} className={actionClass}>Sign in <ArrowRight size={16} /></Link></WorkspaceState></div>;
  if (area === 'admin' && user.role !== 'ADMIN') return <div className="mx-auto max-w-2xl px-6 py-20"><WorkspaceState title="This workspace is for administrators" description="Your account does not have access to this page."><Link href="/customer/dashboard" className={actionClass}>Go to my dashboard</Link></WorkspaceState></div>;
  const links = area === 'admin' ? adminLinks : area === 'technician' ? technicianLinks : customerLinks;
  return <div className="bg-[#f7f8f5]">
    <div className="mx-auto grid min-h-[75vh] max-w-[1440px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[230px_1fr] lg:gap-10 lg:px-10 lg:py-12">
      <aside aria-label="Workspace navigation" className="space-y-6">
        <div className="flex items-center gap-3 px-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-[#123c2d] text-lg font-semibold text-white">{user.name?.slice(0, 1).toUpperCase() || 'K'}</div><div className="min-w-0"><p className="truncate font-semibold text-[#123c2d]">{user.name || 'My account'}</p><p className="text-xs capitalize text-stone-500">{area === 'technician' ? 'Professional' : readable(user.role || 'USER')} workspace</p></div></div>
        <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${pathname === href ? 'bg-[#e5eddf] text-[#123c2d]' : 'text-stone-600 hover:bg-white hover:text-[#123c2d]'}`}><Icon size={18} />{label}</Link>)}</nav>
        <div className="hidden rounded-2xl bg-[#123c2d] p-5 text-white lg:block"><Wrench className="mb-5 text-[#d9f568]" size={25} /><p className="font-semibold">A little help goes a long way.</p><p className="mt-2 text-sm leading-6 text-white/65">Find the right hands for your next home project.</p><Link href="/services" className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#d9f568]">Explore services <ArrowRight size={15} /></Link></div>
      </aside>
      <main className="min-w-0"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Your Amar Karigor</p><h1 className="text-3xl font-semibold tracking-tight text-[#123c2d] sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">{description}</p></div>{action}</div>{children}</main>
    </div>
  </div>;
}

export const actionClass = 'inline-flex items-center justify-center gap-2 rounded-full bg-[#123c2d] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#20513e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#123c2d]';
export const inputClass = 'flex h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-[#123c2d] focus:ring-2 focus:ring-[#123c2d]/10 disabled:opacity-60';
export const panelClass = 'rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6';

export function WorkspaceState({ loading, error, title = 'A fresh start', description, children, retry }: { loading?: boolean; error?: unknown; title?: string; description?: string; children?: ReactNode; retry?: () => void }) {
  if (loading) return <div role="status" aria-label="Loading workspace" className="space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-stone-200/60" />)}<span className="sr-only">Loading…</span></div>;
  return <div role={error ? 'alert' : 'status'} className={`${panelClass} py-12 text-center`}><div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[#edf1e9] text-[#123c2d]"><ClipboardList size={22} /></div><h2 className="text-xl font-semibold text-[#123c2d]">{error ? 'We couldn’t load this just yet' : title}</h2><p className="mx-auto mb-6 mt-3 max-w-md text-sm leading-6 text-stone-500">{error instanceof Error ? error.message : error ? 'Please try again in a moment.' : description}</p>{retry ? <Button variant="outline" onClick={retry}>Try again</Button> : children}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  const color = status === 'COMPLETED' || status === 'VERIFIED' || status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800' : status === 'CANCELLED' || status === 'REJECTED' || status === 'SUSPENDED' ? 'bg-rose-50 text-rose-700' : status === 'IN_PROGRESS' || status === 'CONFIRMED' ? 'bg-sky-50 text-sky-800' : 'bg-amber-50 text-amber-800';
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${color}`}><span className="size-1.5 rounded-full bg-current" />{readable(status)}</span>;
}

export function FieldError({ message }: { message?: string }) { return message ? <p role="alert" className="mt-1.5 text-xs text-rose-700">{message}</p> : null; }
export function Notice({ children }: { children: ReactNode }) { return <p className="rounded-xl border border-[#e4e9dd] bg-[#f4f6ee] p-4 text-sm leading-6 text-stone-600">{children}</p>; }
export function StatCard({ label, value, hint }: { label: string; value: number | string; hint: string }) { return <div className={panelClass}><p className="text-sm text-stone-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-[#123c2d]">{value}</p><p className="mt-2 text-xs text-stone-400">{hint}</p></div>; }
