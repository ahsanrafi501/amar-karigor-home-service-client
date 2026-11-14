// This file defines TypeScript types for API responses and requests.

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiError {
    success: false;
    message: string;
}

export interface Pagination<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface Technician {
    id: string;
    name: string;
    services: Service[];
    availability: Availability[];
    rating: number;
}

export interface Service {
    id: string;
    name: string;
    category: Category;
    description: string;
    price: number;
}

export interface Category {
    id: string;
    name: string;
}

export interface Booking {
    id: string;
    service: Service;
    technician: Technician;
    customer: User;
    date: string;
    time: string;
    status: string;
}

export interface Review {
    id: string;
    rating: number;
    comment: string;
    user: User;
    service: Service;
}

export interface Availability {
    date: string;
    slots: string[];
}