export type Role = 'USER' | 'TECHNICIAN' | 'ADMIN';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export interface User { id: string; name: string; email: string; role: Role; status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; }
export interface Category { id: string; name: string; description?: string | null; }
export interface Service { id: string; name: string; description?: string | null; categoryId: string; category?: Category; }
export interface Review { id: string; rating: number; title?: string | null; description?: string | null; customerId: string; bookingId: string; createdAt: string; }
export interface TechnicianProfile { id: string; userId: string; bio?: string | null; experience?: number | null; availability: string; serviceArea: string; verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'; user?: Pick<User, 'id' | 'name' | 'email' | 'role'>; technicianService?: TechnicianOffer[]; nidNumber?: string; certification?: string | null; presentAddress?: string; permanentAddress?: string | null; }
export interface TechnicianOffer { id: string; price: number; technicianId: string; serviceId: string; service?: Service; technicianProfile?: TechnicianProfile; reviews?: Review[]; }
export interface Payment { id: string; amount: number; paidAt: string; paymentMethod?: string; sslcommerceTranId?: string; }
export interface Booking { id: string; customerId: string; technicianProfileId: string; technicianServiceId: string; status: BookingStatus; startTime: string; endTime: string; createdAt?: string; updatedAt?: string; cancellationReason?: string | null; cancelledAt?: string | null; cancelledBy?: string | null; TechnicianService?: TechnicianOffer; technicianProfile?: TechnicianProfile; payment?: Payment | null; review?: Review | null; }
export interface ApiResponse<T> { success: boolean; statusCode?: number; message: string; data: T; }
export type ResultResponse<T> = ApiResponse<{ result: T }>;
