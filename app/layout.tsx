import type { Metadata } from 'next';
import { Suspense } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Providers } from '@/components/providers';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Amar Karigor — Good hands. Happy homes.', template: '%s | Amar Karigor' }, description: 'Find local home-service professionals, compare their offers, and book the help your home needs.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><a href="#page-content" className="sr-only z-50 rounded bg-primary p-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a><Providers><Navbar /><div id="page-content" className="min-h-[65vh]"><Suspense fallback={<div className="site-container py-24" role="status">Loading your page…</div>}>{children}</Suspense></div><Footer /></Providers></body></html>;
}
