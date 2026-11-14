'use client';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="site-container py-24 text-center"><p className="eyebrow">A small bump in the road</p><h1 className="mt-4 text-3xl font-semibold tracking-tight">Let’s try that again.</h1><p className="mt-4 text-sm text-muted-foreground">We couldn’t load this page. Please try again in a moment.</p><Button className="mt-7" onClick={reset}>Try again</Button></main>; }
