'use client';
import { AlertCircle, LoaderCircle, SearchX } from 'lucide-react';
import { Button } from './button';
export function PageState({ title, description, kind = 'empty', onRetry }: { title: string; description?: string; kind?: 'loading' | 'error' | 'empty'; onRetry?: () => void }) {
  const Icon = kind === 'loading' ? LoaderCircle : kind === 'error' ? AlertCircle : SearchX;
  return <div role={kind === 'error' ? 'alert' : 'status'} className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center"><Icon aria-hidden className={`mx-auto mb-4 size-8 text-muted-foreground ${kind === 'loading' ? 'animate-spin' : ''}`} /><h3 className="text-lg font-semibold">{title}</h3>{description && <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>}{onRetry && <Button variant="outline" className="mt-5" onClick={onRetry}>Try again</Button>}</div>;
}
