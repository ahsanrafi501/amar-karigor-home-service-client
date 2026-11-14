import { api } from '@/lib/api';
import type { ApiResponse, User } from '@/types';
export async function login(payload: { email: string; password: string }): Promise<User> {
  await api.post('/auth/login', payload);
  return (await api.get<ApiResponse<{ userProfile: User }>>('/user/my-profile')).data.userProfile;
}
export async function registerUser(payload: { name: string; email: string; password: string }) {
  return (await api.post<ApiResponse<{ user: User }>>('/user/register', payload)).data;
}
