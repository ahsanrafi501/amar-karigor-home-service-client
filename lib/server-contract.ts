import { z } from 'zod';
import type { Role } from '@/types';

export function routePolicy(method: string, path: string): 'public' | Role[] | null {
  if (method === 'GET' && /^(services(?:\/categories)?|technician\/profiles(?:\/[^/]+)?)$/.test(path)) return 'public';
  if (method === 'POST' && /^(auth\/login|user\/register|auth\/logout)$/.test(path)) return 'public';
  if (method === 'GET' && /^(auth\/refresh-token|user\/my-profile|technician\/me|booking\/my-bookings(?:\/[^/]+)?)$/.test(path)) return ['USER', 'TECHNICIAN', 'ADMIN'];
  if (method === 'GET' && path === 'admin/technicians') return ['ADMIN'];
  if ((method === 'POST' && path === 'technician/apply') || (method === 'PUT' && /^(technician\/update|technician\/availability)$/.test(path)) || (method === 'POST' && /^booking\/create\/[^/]+$/.test(path)) || (method === 'POST' && path === 'payment/initiate-payment')) return ['USER', 'TECHNICIAN', 'ADMIN'];
  if ((method === 'GET' && path === 'technician/bookings') || (method === 'PATCH' && /^technician\/bookings\/[^/]+$/.test(path)) || (method === 'POST' && /^technician\/offered-services\/[^/]+$/.test(path))) return ['TECHNICIAN'];
  if (method === 'POST' && /^review\/[^/]+$/.test(path)) return ['USER', 'ADMIN'];
  if ((method === 'GET' && /^(admin\/bookings|admin\/categories)$/.test(path)) || (method === 'POST' && /^(admin\/create-service|admin\/create-categories)$/.test(path)) || (method === 'PATCH' && /^admin\/(users\/[^/]+|technicians\/[^/]+\/verification)$/.test(path))) return ['ADMIN'];
  return null;
}

const text = z.string().trim().min(1).max(255);
const profile = z.object({ bio: z.string().max(2000).optional(), experience: z.number().int().min(0).max(80).optional(), availability: text, nidNumber: text, serviceArea: text, presentAddress: text, certification: z.string().max(255).optional(), permanentAddress: z.string().max(255).optional() }).strict();
export const bookingInput = z.object({ startTime: z.string().datetime({ offset: true }), endTime: z.string().datetime({ offset: true }) }).strict().refine(value => Date.parse(value.startTime) > Date.now(), 'Choose a future start time.').refine(value => Date.parse(value.endTime) > Date.parse(value.startTime), 'End time must be after start time.');
export function validateBody(path: string, body: unknown) {
  if (path === 'auth/login') return z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(8).max(255) }).strict().parse(body);
  if (path === 'user/register') return z.object({ name: text, email: z.string().trim().toLowerCase().email(), password: z.string().min(8).max(255) }).strict().parse(body);
  if (path === 'technician/apply') return profile.parse(body);
  if (path === 'technician/update') return profile.partial().parse(body);
  if (path === 'technician/availability') return z.object({ availability: text }).strict().parse(body);
  if (path.startsWith('booking/create/')) return bookingInput.parse(body);
  if (path.startsWith('review/')) return z.object({ rating: z.coerce.number().int().min(1).max(5), title: z.string().max(100).optional(), description: z.string().max(255).optional() }).strict().parse(body);
  if (path.startsWith('technician/offered-services/')) return z.object({ price: z.coerce.number().finite().positive() }).strict().parse(body);
  if (path.startsWith('technician/bookings/')) return z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']), cancellationReason: z.string().max(500).optional() }).strict().parse(body);
  if (path === 'payment/initiate-payment') return z.object({ bookingId: text }).strict().parse(body);
  if (path === 'admin/create-categories') return z.array(z.object({ name: text, description: z.string().max(255).optional() }).strict()).min(1).parse(body);
  if (path === 'admin/create-service') return z.array(z.object({ name: text, categoryId: text, description: z.string().max(255).optional() }).strict()).min(1).parse(body);
  if (/^admin\/users\//.test(path)) return z.object({ status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']) }).strict().parse(body);
  if (/^admin\/technicians\//.test(path)) return z.object({ verificationStatus: z.enum(['VERIFIED', 'REJECTED']) }).strict().parse(body);
  return body;
}

export function sanitizeResponse(value: unknown, publicView = false): unknown {
  if (Array.isArray(value)) return value.map(item => sanitizeResponse(item, publicView));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => !['password', 'error', 'stack', 'accessToken', 'refreshToken'].includes(key) && !(publicView && ['nidNumber', 'presentAddress', 'permanentAddress', 'certification', 'email'].includes(key))).map(([key, item]) => [key, sanitizeResponse(item, publicView)]));
  return value;
}

export const nextBookingStates: Record<string, string[]> = { PENDING: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['IN_PROGRESS', 'CANCELLED'], IN_PROGRESS: ['COMPLETED'], COMPLETED: [], CANCELLED: [] };
