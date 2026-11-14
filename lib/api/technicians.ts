import { api } from '@/lib/api';
import type { TechnicianProfile, ResultResponse } from '@/types';
export async function fetchTechnicians(): Promise<TechnicianProfile[]> { return (await api.get<ResultResponse<TechnicianProfile[]>>('/technician/profiles')).data.result; }
export async function getTechnicianById(id: string): Promise<TechnicianProfile> { return (await api.get<ResultResponse<TechnicianProfile>>(`/technician/profiles/${encodeURIComponent(id)}`)).data.result; }
