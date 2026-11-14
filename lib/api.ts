import axios from 'axios';
const client = axios.create({ baseURL: '/api/backend', timeout: 20000, withCredentials: true, headers: { 'Content-Type': 'application/json' } });
async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  try {
    const response = await client.request<T>({ method, url: path.startsWith('/') ? path : `/${path}`, data: body });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'The request took too long. Please try again.' : 'Unable to reach the service. Please try again.'));
    throw error;
  }
}
export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
};
