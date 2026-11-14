import type { BookingStatus, Review, Category, TechnicianOffer, TechnicianProfile, Booking } from '@/types';
import { formatDate, formatMoney } from '@/lib/utils';

export type BookingState = BookingStatus;
export type ReviewRecord = Review;
export type CategoryRecord = Category;
export type OfferRecord = TechnicianOffer;
export type ProfileRecord = TechnicianProfile;
export type BookingRecord = Booking;
export interface ResultData<T> { result: T }
export const workspaceKeys = {
  bookings: (id: string) => ['workspace', id, 'bookings'] as const,
  booking: (id: string, bookingId: string) => ['workspace', id, 'booking', bookingId] as const,
  jobs: (id: string) => ['workspace', id, 'jobs'] as const,
  categories: (id: string) => ['workspace', id, 'categories'] as const,
  adminBookings: (id: string) => ['workspace', id, 'admin-bookings'] as const,
};
export const money = formatMoney;
export const dateTime = (value: string) => `${formatDate(value, { hour: '2-digit', minute: '2-digit' })} (Dhaka)`;
export const readable = (value: string) => value.toLowerCase().replaceAll('_', ' ');
