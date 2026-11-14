import * as React from 'react';
import { cn } from '@/lib/utils';
export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) { return <textarea data-slot="textarea" className={cn('flex min-h-28 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15 disabled:opacity-50', className)} {...props} />; }
