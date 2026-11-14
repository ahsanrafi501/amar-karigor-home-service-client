export interface Review {
  id: string;
  bookingId: string;
  technicianId: string;
  customerId: string;
  rating: number; // Assuming a rating scale of 1 to 5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewResponse {
  reviews: Review[];
  total: number; // Total number of reviews for pagination
}

export interface CreateReviewRequest {
  bookingId: string;
  technicianId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}