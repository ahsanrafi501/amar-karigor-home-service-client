import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routePolicy, sanitizeResponse, validateBody, nextBookingStates } from '@/lib/server-contract';
import type { User, Booking, TechnicianProfile } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const base = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
const accessCookie = 'ak_access';
const refreshCookie = 'ak_refresh';
type Upstream = { success?: boolean; statusCode?: number; message?: string; data?: Record<string, unknown> };
function fail(message: string, status: number) { return NextResponse.json({ success: false, message }, { status, headers: { 'Cache-Control': 'no-store' } }); }
function sessionCookies(response: NextResponse, access?: string, refresh?: string) {
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
  if (access) response.cookies.set(accessCookie, access, { ...options, maxAge: 86400 });
  if (refresh) response.cookies.set(refreshCookie, refresh, { ...options, maxAge: 604800 });
  return response;
}
async function upstream(path: string, method = 'GET', access?: string, body?: unknown, refresh?: string) {
  const response = await fetch(`${base}/${path}`, { method, headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}), ...(refresh ? { Cookie: `refreshToken=${encodeURIComponent(refresh)}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(15000), redirect: 'error' });
  const data: Upstream = await response.json();
  return { response, data };
}
async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;
  if (segments.some(segment => !/^[a-zA-Z0-9_-]+$/.test(segment))) return fail('Invalid request path.', 400);
  const path = segments.join('/');
  const policy = routePolicy(request.method, path);
  if (!policy) return fail('This action is not available.', 404);
  if (request.method !== 'GET') {
    const origin = request.headers.get('origin');
    if ((origin && origin !== request.nextUrl.origin) || request.headers.get('sec-fetch-site') === 'cross-site') return fail('Request origin is not allowed.', 403);
  }
  if (path === 'auth/logout') {
    const response = NextResponse.json({ success: true, data: null, message: 'Signed out on this device.' });
    response.cookies.set(accessCookie, '', { path: '/', maxAge: 0 }); response.cookies.set(refreshCookie, '', { path: '/', maxAge: 0 });
    return response;
  }
  let access = request.cookies.get(accessCookie)?.value;
  const refresh = request.cookies.get(refreshCookie)?.value;
  let renewedAccess: string | undefined;
  try {
    let user: User | null = null;
    if (policy !== 'public') {
      if (!access && !refresh) return fail('Please sign in to continue.', 401);
      let identity = access ? await upstream('user/my-profile', 'GET', access) : null;
      if (!identity?.response.ok || !identity.data.success || path === 'auth/refresh-token') {
        if (!refresh) return fail('Your session has expired. Please sign in again.', 401);
        const updated = await upstream('auth/refresh-token', 'GET', undefined, undefined, refresh);
        if (!updated.response.ok || typeof updated.data.data?.accessToken !== 'string') return fail('Your session has expired. Please sign in again.', 401);
        access = updated.data.data.accessToken; renewedAccess = access;
        identity = await upstream('user/my-profile', 'GET', access);
      }
      user = identity?.data.data?.userProfile as User | null;
      if (!identity?.response.ok || !user) return fail('Unable to verify your session. Please sign in again.', 401);
      if (user.status !== 'ACTIVE') return fail('Your account is not active. Please contact support.', 403);
      if (!policy.includes(user.role)) return fail('You do not have access to this workspace.', 403);
      if (path === 'user/my-profile' || path === 'auth/refresh-token') return sessionCookies(NextResponse.json({ success: true, data: { userProfile: user }, message: 'Session loaded.' }, { headers: { 'Cache-Control': 'no-store' } }), renewedAccess);
    }
    if (path === 'technician/me' || path === 'admin/technicians') {
      const profiles = await upstream('technician/profiles', 'GET', access);
      if (!profiles.response.ok || !profiles.data.success) return fail('Unable to load technician profiles.', 503);
      const list = profiles.data.data?.result as TechnicianProfile[];
      const result = path === 'technician/me' ? list.find(profile => profile.userId === user?.id) || null : list;
      return sessionCookies(NextResponse.json({ success: true, message: 'Profiles loaded.', data: { result: sanitizeResponse(result) } }, { headers: { 'Cache-Control': 'no-store' } }), renewedAccess);
    }
    const body = request.method === 'GET' ? undefined : validateBody(path, await request.json());
    if (path === 'payment/initiate-payment') {
      const owned = await upstream(`booking/my-bookings/${(body as { bookingId: string }).bookingId}`, 'GET', access);
      if (!owned.response.ok || !owned.data.data?.result) return fail('Only the booking owner can pay for this booking.', 403);
      const booking = owned.data.data.result as Booking;
      if (booking.customerId !== user?.id || booking.status !== 'COMPLETED') return fail('Payment is available for your own completed bookings.', 400);
      if (booking.payment) return fail('This booking is already paid.', 409);
    }
    if (request.method === 'PATCH' && path.startsWith('technician/bookings/')) {
      const jobs = await upstream('technician/bookings', 'GET', access);
      const booking = (jobs.data.data?.result as Booking[] | undefined)?.find(job => job.id === segments[2]);
      if (!booking) return fail('This booking is not assigned to you.', 403);
      if (!nextBookingStates[booking.status]?.includes((body as { status: string }).status)) return fail('This status change is not allowed.', 400);
      if ((body as { status: string; cancellationReason?: string }).status === 'CANCELLED' && !(body as { cancellationReason?: string }).cancellationReason?.trim()) return fail('Please add a cancellation reason.', 400);
    }
    const result = await upstream(`${path}${request.method === 'GET' ? request.nextUrl.search : ''}`, request.method, access, body);
    if (!result.response.ok || result.data.success === false) return fail(result.data.message || 'The service could not complete this request.', result.response.status >= 400 ? result.response.status : 400);
    const restrictProfileFields = (policy === 'public' && request.method === 'GET') || path.startsWith('booking/my-bookings');
    const response = NextResponse.json(sanitizeResponse(result.data, restrictProfileFields), { status: result.response.status, headers: { 'Cache-Control': 'no-store' } });
    if (path === 'auth/login') return sessionCookies(response, result.data.data?.accessToken as string, result.data.data?.refreshToken as string);
    return sessionCookies(response, renewedAccess);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(error.issues[0]?.message || 'Please check the form fields.', 400);
    if (error instanceof SyntaxError) return fail('The request must contain valid JSON.', 400);
    return fail('The backend is currently unavailable. Please try again shortly.', 503);
  }
}
export { handler as GET, handler as POST, handler as PUT, handler as PATCH };
