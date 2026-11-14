import { api } from '@/lib/api';
import type { Booking, ResultResponse } from '@/types';
export async function getBookings(): Promise<Booking[]> { return (await api.get<ResultResponse<Booking[]>>('/booking/my-bookings')).data.result; }
export async function getBookingDetails(id: string): Promise<Booking> { return (await api.get<ResultResponse<Booking>>(`/booking/my-bookings/${encodeURIComponent(id)}`)).data.result; }
