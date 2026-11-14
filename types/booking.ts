export interface Booking {
  id: string;
  customerId?: string;
  technicianId?: string;
  serviceId?: string;
  status: BookingStatus | string;
  date: string;
  time: string;
  serviceName?: string;
  technicianName?: string;
  customerName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}