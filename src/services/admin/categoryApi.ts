import { adminApiClient as api } from './httpClient';
import type { ApiResponse } from '@/types/api';
import type { Category } from '@/types/category';

export const categoryApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/dashboard/category');
    return response.data;
  },

  create: async (formData: FormData): Promise<ApiResponse<Category>> => {
    const response = await api.post('/dashboard/category', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: string, formData: FormData): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/dashboard/category/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/dashboard/category/${id}`);
    return response.data;
  },
};
