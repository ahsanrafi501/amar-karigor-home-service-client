import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PATCH } from '@/app/api/backend/[...path]/route';
const account = { id: 'customer-id', name: 'Test Customer', email: 'test@example.com', role: 'USER', status: 'ACTIVE' };
function response(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }); }
function request(path: string, method = 'GET', body?: unknown, cookie = 'ak_access=access') { return new NextRequest(`http://localhost:3000/api/backend/${path}`, { method, headers: { Cookie: cookie, Origin: 'http://localhost:3000', 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }); }
const context = (path: string) => ({ params: Promise.resolve({ path: path.split('/') }) });
afterEach(() => vi.unstubAllGlobals());
describe('same-origin backend proxy', () => {
  it('denies anonymous protected requests without contacting the backend', async () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    const result = await GET(request('booking/my-bookings', 'GET', undefined, ''), context('booking/my-bookings'));
    expect(result.status).toBe(401); expect(fetcher).not.toHaveBeenCalled();
  });
  it('checks the current database role before allowing admin operations', async () => {
    const fetcher = vi.fn().mockResolvedValue(response({ success: true, data: { userProfile: account } })); vi.stubGlobal('fetch', fetcher);
    const result = await POST(request('admin/create-categories', 'POST', [{ name: 'Plumbing' }]), context('admin/create-categories'));
    expect(result.status).toBe(403); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('isolates private own profiles using the authenticated user identity', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response({ success: true, data: { userProfile: account } })).mockResolvedValueOnce(response({ success: true, data: { result: [{ id: 'other-profile', userId: 'other-user', nidNumber: 'other-secret' }, { id: 'own-profile', userId: 'customer-id', nidNumber: 'own-secret', user: { password: 'hash' } }] } })); vi.stubGlobal('fetch', fetcher);
    const result = await GET(request('technician/me'), context('technician/me')); const body = await result.json();
    expect(body.data.result.id).toBe('own-profile'); expect(body.data.result.nidNumber).toBe('own-secret'); expect(JSON.stringify(body)).not.toContain('other-secret'); expect(JSON.stringify(body)).not.toContain('password');
  });
  it('strips identity/address fields from public profile responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ success: true, data: { result: [{ id: 'profile', nidNumber: 'secret-nid', presentAddress: 'private-street', user: { name: 'Visible Name', email: 'private-email' } }] } })));
    const result = await GET(request('technician/profiles', 'GET', undefined, ''), context('technician/profiles')); const body = JSON.stringify(await result.json());
    expect(body).toContain('Visible Name'); expect(body).not.toContain('secret-nid'); expect(body).not.toContain('private-street'); expect(body).not.toContain('private-email');
  });
  it('sets HttpOnly session cookies without returning tokens to JavaScript', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ success: true, data: { accessToken: 'secret-access', refreshToken: 'secret-refresh' } })));
    const result = await POST(request('auth/login', 'POST', { email: 'test@example.com', password: 'password123' }, ''), context('auth/login'));
    expect(result.headers.get('set-cookie')).toContain('HttpOnly'); expect(result.headers.get('set-cookie')).toContain('SameSite=lax'); expect(JSON.stringify(await result.json())).not.toContain('secret-access');
  });
  it('does not disclose a professional’s identity documents in a customer’s booking response', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response({ success: true, data: { userProfile: account } })).mockResolvedValueOnce(response({ success: true, data: { result: [{ id: 'booking', technicianProfile: { id: 'professional', serviceArea: 'Dhaka', nidNumber: 'private-nid', presentAddress: 'private-address', permanentAddress: 'private-home', certification: 'private-document' } }] } })); vi.stubGlobal('fetch', fetcher);
    const result = await GET(request('booking/my-bookings'), context('booking/my-bookings')); const body = JSON.stringify(await result.json());
    expect(body).toContain('Dhaka'); for (const secret of ['private-nid', 'private-address', 'private-home', 'private-document']) expect(body).not.toContain(secret);
  });
  it('rejects cross-origin state-changing requests before fetching', async () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    const req = new NextRequest('http://localhost:3000/api/backend/auth/login', { method: 'POST', headers: { Origin: 'https://untrusted.example' }, body: '{}' });
    const result = await POST(req, context('auth/login')); expect(result.status).toBe(403); expect(fetcher).not.toHaveBeenCalled();
  });
  it('blocks paying another customer’s booking', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response({ success: true, data: { userProfile: account } })).mockResolvedValueOnce(response({ success: false }, 500)); vi.stubGlobal('fetch', fetcher);
    const result = await POST(request('payment/initiate-payment', 'POST', { bookingId: 'someone-elses-booking' }), context('payment/initiate-payment'));
    expect(result.status).toBe(403); expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('does not initiate payment before completion', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response({ success: true, data: { userProfile: account } })).mockResolvedValueOnce(response({ success: true, data: { result: { id: 'booking', customerId: account.id, status: 'PENDING' } } })); vi.stubGlobal('fetch', fetcher);
    const result = await POST(request('payment/initiate-payment', 'POST', { bookingId: 'booking' }), context('payment/initiate-payment'));
    expect(result.status).toBe(400); expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('does not open another checkout for an already paid booking', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response({ success: true, data: { userProfile: account } })).mockResolvedValueOnce(response({ success: true, data: { result: { id: 'booking', customerId: account.id, status: 'COMPLETED', payment: { id: 'receipt-id', amount: 125 } } } })); vi.stubGlobal('fetch', fetcher);
    const result = await POST(request('payment/initiate-payment', 'POST', { bookingId: 'booking' }), context('payment/initiate-payment'));
    expect(result.status).toBe(409); expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('preserves persisted payment metadata while redacting private booking profile fields', async () => {
    const payment = { id: 'receipt-id', amount: 125.75, paidAt: '2026-11-14T08:00:00Z', paymentMethod: 'VISA', sslcommerceTranId: 'TXN_TEST' };
    const fetcher = vi.fn().mockResolvedValueOnce(response({ success: true, data: { userProfile: account } })).mockResolvedValueOnce(response({ success: true, data: { result: { id: 'booking', payment, technicianProfile: { nidNumber: 'private-nid' } } } })); vi.stubGlobal('fetch', fetcher);
    const result = await GET(request('booking/my-bookings/booking'), context('booking/my-bookings/booking')); const body = await result.json();
    expect(body.data.result.payment).toEqual(payment); expect(JSON.stringify(body)).not.toContain('private-nid');
  });
  it('blocks reopening completed jobs even if the backend accepts it', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response({ success: true, data: { userProfile: { ...account, role: 'TECHNICIAN' } } })).mockResolvedValueOnce(response({ success: true, data: { result: [{ id: 'booking-id', status: 'COMPLETED' }] } })); vi.stubGlobal('fetch', fetcher);
    const result = await PATCH(request('technician/bookings/booking-id', 'PATCH', { status: 'PENDING' }), context('technician/bookings/booking-id'));
    expect(result.status).toBe(400); expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('refreshes an expired access token and propagates the new cookie', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response({ success: false }, 500)).mockResolvedValueOnce(response({ success: true, data: { accessToken: 'renewed-secret' } })).mockResolvedValueOnce(response({ success: true, data: { userProfile: account } })); vi.stubGlobal('fetch', fetcher);
    const result = await GET(request('user/my-profile', 'GET', undefined, 'ak_access=expired; ak_refresh=refresh'), context('user/my-profile'));
    expect(result.status).toBe(200); expect(result.headers.get('set-cookie')).toContain('renewed-secret'); expect((await result.json()).data.userProfile.id).toBe(account.id);
  });
  it('maps malformed JSON to 400 and network failures to 503', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    const malformed = new NextRequest('http://localhost:3000/api/backend/auth/login', { method: 'POST', body: '{bad' });
    expect((await POST(malformed, context('auth/login'))).status).toBe(400);
    expect((await GET(request('services'), context('services'))).status).toBe(503);
  });
});
