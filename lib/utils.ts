import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { isValid, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatMoney(value: number) { return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value); }
export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  const date = parseISO(value);
  return isValid(date) ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', day: 'numeric', month: 'short', year: 'numeric', ...options }).format(date) : 'Date unavailable';
}
export function averageRating(reviews: { rating: number }[] = []) { return reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null; }
export function safeReturnPath(value: string | null, fallback = '/customer/dashboard') {
  if (!value || !value.startsWith('/') || /[\u0000-\u0020\u007f\\]/.test(value)) return fallback;
  try {
    if (/[\u0000-\u001f\u007f\\]/.test(decodeURIComponent(value))) return fallback;
    const url = new URL(value, 'https://amar-karigor.invalid');
    return url.origin === 'https://amar-karigor.invalid' ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch { return fallback; }
}
export function dashboardPath(role?: string) { return role === 'ADMIN' ? '/admin' : role === 'TECHNICIAN' ? '/technician/dashboard' : '/customer/dashboard'; }
