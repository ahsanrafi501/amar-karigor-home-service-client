import Link from 'next/link';
import { ArrowLeft, House } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function NotFound() { return <main className="site-container py-24 text-center"><House className="mx-auto mb-6 size-12 text-primary" /><p className="eyebrow">404 · A little off the beaten path</p><h1 className="mt-4 text-4xl font-semibold tracking-tight">Let’s get you back home.</h1><p className="mt-4 text-sm text-muted-foreground">We couldn’t find the page you’re looking for.</p><Button asChild className="mt-8"><Link href="/"><ArrowLeft /> Back to home</Link></Button></main>; }
