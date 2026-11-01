import { adminApiClient as api } from './httpClient';
import type { ApiResponse } from '@/types/api';
import type { SubCategory } from '@/types/category';

export const subCategoryApi = {
  getAll: async (): Promise<ApiResponse<SubCategory[]>> => {
    const response = await api.get('/dashboard/subCategory');
    const raw = response.data as any;
    const list: SubCategory[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.subCategories)
        ? raw.subCategories
        : Array.isArray(raw)
          ? raw
          : [];
    return { message: raw?.message || 'Done', data: list };
  },

  /** Create subcategory — categoryId goes in the path, data as multipart */
  create: async (categoryId: string, form: FormData): Promise<ApiResponse<SubCategory>> => {
    const response = await api.post(`/dashboard/subCategory/${categoryId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: string, form: FormData): Promise<ApiResponse<SubCategory>> => {
    const response = await api.patch(`/dashboard/subCategory/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/dashboard/subCategory/${id}`);
    return response.data;
  },
};
