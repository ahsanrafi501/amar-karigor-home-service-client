import { describe, expect, it } from 'vitest';
import { routePolicy, sanitizeResponse, validateBody, nextBookingStates } from '@/lib/server-contract';
import { safeReturnPath, averageRating, formatMoney } from '@/lib/utils';
import { establishSession, SessionOrder } from '@/lib/session-order';
describe('API contract boundaries', () => {
  it('protects all admin aliases and limits technician job mutations', () => {
    expect(routePolicy('GET', 'admin/technicians')).toEqual(['ADMIN']);
    expect(routePolicy('PATCH', 'technician/bookings/booking-id')).toEqual(['TECHNICIAN']);
    expect(routePolicy('GET', 'technician/me')).toEqual(['USER', 'TECHNICIAN', 'ADMIN']);
    expect(routePolicy('GET', 'technician/profiles/profile-id')).toBe('public');
  });
  it('does not proxy arbitrary URLs or unsupported backend routes', () => {
    expect(routePolicy('GET', 'https://example.com')).toBeNull();
    expect(routePolicy('DELETE', 'booking/my-bookings/id')).toBeNull();
    expect(routePolicy('POST', 'payment/success')).toBeNull();
    expect(routePolicy('GET', 'admin/users')).toBeNull();
  });
  it('blocks self-verification and account reassignment at runtime', () => {
    expect(() => validateBody('technician/update', { verificationStatus: 'VERIFIED' })).toThrow();
    expect(() => validateBody('technician/update', { userId: 'someone-else' })).toThrow();
    expect(validateBody('technician/update', { bio: 'Careful plumbing work.' })).toEqual({ bio: 'Careful plumbing work.' });
  });
  it('rejects invalid and past booking ranges and preserves offset timestamps', () => {
    const startTime = new Date(Date.now() + 86400000).toISOString();
    const endTime = new Date(Date.now() + 90000000).toISOString();
    expect(validateBody('booking/create/offer-id', { startTime, endTime })).toEqual({ startTime, endTime });
    expect(() => validateBody('booking/create/offer-id', { startTime: 'not-a-date', endTime })).toThrow();
    expect(() => validateBody('booking/create/offer-id', { startTime: '2020-01-01T12:00:00Z', endTime })).toThrow();
    expect(() => validateBody('booking/create/offer-id', { startTime: endTime, endTime: startTime })).toThrow();
  });
  it('aligns reviews to the persisted length and integer rating constraints', () => {
    expect(validateBody('review/booking-id', { rating: '5', description: 'a'.repeat(255) })).toMatchObject({ rating: 5 });
    expect(() => validateBody('review/booking-id', { rating: 2.5 })).toThrow();
    expect(() => validateBody('review/booking-id', { rating: '5bad' })).toThrow();
    expect(() => validateBody('review/booking-id', { rating: 5, description: 'a'.repeat(256) })).toThrow();
  });
  it('keeps terminal booking states closed', () => {
    expect(nextBookingStates.PENDING).toEqual(['CONFIRMED', 'CANCELLED']);
    expect(nextBookingStates.COMPLETED).toEqual([]); expect(nextBookingStates.CANCELLED).toEqual([]);
  });
  it('redacts secrets recursively and keeps private profile fields out of public output', () => {
    const value = { data: { result: [{ nidNumber: 'private-id', presentAddress: 'private-address', certification: 'private-doc', user: { name: 'Test professional', email: 'private-email', password: 'hash' }, technicianService: [{ reviews: [{ rating: 5 }] }] }] }, error: 'stack', accessToken: 'token' };
    const publicResult = JSON.stringify(sanitizeResponse(value, true));
    expect(publicResult).toContain('Test professional'); expect(publicResult).toContain('rating');
    for (const secret of ['private-id', 'private-address', 'private-doc', 'private-email', 'hash', 'token', 'stack']) expect(publicResult).not.toContain(secret);
    expect(JSON.stringify(sanitizeResponse(value))).toContain('private-id'); expect(JSON.stringify(sanitizeResponse(value))).not.toContain('password');
  });
});
describe('navigation and display contracts', () => {
  it.each(['https://example.com', '//example.com', '/\\example.com', '/\t/evil.example', '/\n/evil.example', '/%09/evil.example', '/%5Cevil.example'])('rejects unsafe post-login redirect %s', value => { expect(safeReturnPath(value)).toBe('/customer/dashboard'); });
  it('retains the selected offer through a local sign-in redirect', () => { expect(safeReturnPath('/bookings/new?offer=offer-id')).toBe('/bookings/new?offer=offer-id'); });
  it('does not invent a zero-star rating for a new professional', () => { expect(averageRating([])).toBeNull(); expect(averageRating([{ rating: 4 }, { rating: 5 }])).toBe(4.5); });
  it('preserves fractional service prices', () => { expect(formatMoney(125.75)).toContain('125.75'); });
});
describe('session request ordering', () => {
  it('clears the previous account if cookies switch but the new profile fails to load', async () => {
    let identity: string | null = 'account-a';
    await expect(establishSession(async () => undefined, async () => { throw new Error('Profile unavailable'); }, () => { identity = null; })).rejects.toThrow('Profile unavailable');
    expect(identity).toBeNull();
  });
  it('preserves the previous account when a new login is rejected before cookies switch', async () => {
    let identity: string | null = 'account-a';
    await expect(establishSession(async () => { throw new Error('Invalid credentials'); }, async () => 'account-b', () => { identity = null; })).rejects.toThrow('Invalid credentials');
    expect(identity).toBe('account-a');
  });
  it('prevents a delayed anonymous bootstrap from overwriting a successful login', async () => {
    const order = new SessionOrder(); let identity: string | null = null; let resolveBootstrap!: () => void;
    const bootstrapCurrent = order.begin();
    const bootstrap = new Promise<void>(resolve => { resolveBootstrap = resolve; }).then(() => { if (bootstrapCurrent()) identity = null; });
    const loginCurrent = order.begin(); if (loginCurrent()) identity = 'signed-in-user';
    resolveBootstrap(); await bootstrap; expect(identity).toBe('signed-in-user');
  });
  it('prevents a delayed old profile from restoring identity after logout', async () => {
    const order = new SessionOrder(); let identity: string | null = 'previous-user'; let resolveProfile!: () => void;
    const profileCurrent = order.begin();
    const profile = new Promise<void>(resolve => { resolveProfile = resolve; }).then(() => { if (profileCurrent()) identity = 'previous-user'; });
    const logoutCurrent = order.begin(); if (logoutCurrent()) identity = null;
    resolveProfile(); await profile; expect(identity).toBeNull();
  });
});
