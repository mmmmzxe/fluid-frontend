import { adminApiClient as api } from './httpClient';
import type { ApiResponse } from '@/types/api';
import type { Shipping } from '@/types/shipping';

export const shippingApi = {
  getAll: async (): Promise<ApiResponse<Shipping[]>> => {
    const response = await api.get('/shipping');
    const raw = response.data as any;
    const list: Shipping[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.shipping)
        ? raw.shipping
        : Array.isArray(raw)
          ? raw
          : [];
    return { message: raw?.message || 'Done', data: list };
  },

  create: async (data: any): Promise<ApiResponse<Shipping>> => {
    const response = await api.post('/shipping', data);
    return response.data;
  },

  /** Government-based shipping shorthand */
  createGov: async (data: { government: string; price: number }): Promise<ApiResponse<Shipping>> => {
    const response = await api.post('/shipping', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<ApiResponse<Shipping>> => {
    const response = await api.patch(`/shipping/${id}`, data);
    return response.data;
  },

  updateGov: async (
    id: string,
    data: { government?: string; price?: number },
  ): Promise<ApiResponse<Shipping>> => {
    const response = await api.patch(`/shipping/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/shipping/${id}`);
    return response.data;
  },
};
