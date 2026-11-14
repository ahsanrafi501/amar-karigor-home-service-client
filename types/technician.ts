export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  rating: number;
  reviewsCount: number;
  availability: Availability[];
  profilePictureUrl?: string;
}

export interface Availability {
  date: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}