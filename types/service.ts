export interface Service {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  technicianId: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  categoryId: string;
  technicianId: string;
  price: number;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  technicianId?: string;
  price?: number;
}