import { adminApiClient as api } from './httpClient';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/auth';
import type { Product } from '@/types/product';

export const userApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/user/all-user');
    const raw = response.data as any;
    const list: User[] = Array.isArray(raw?.user)
      ? raw.user
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.users)
          ? raw.users
          : Array.isArray(raw)
            ? raw
            : [];
    return { message: raw?.message || 'Done', data: list };
  },

  getById: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/user/user-by-id/${userId}`);
    const raw = response.data as any;
    // API returns { message: "Done", user: {...} }
    return {
      message: raw?.message || 'Done',
      data: raw?.user || raw?.data || raw,
    };
  },

  addToFavorites: async (productId: string): Promise<ApiResponse> => {
    const response = await api.patch(`/user/add-to-favorite/${productId}`);
    return response.data;
  },

  removeFromFavorites: async (productId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/user/remove-from-favorite/${productId}`);
    return response.data;
  },

  getFavorites: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/user/get-favorite');
    return response.data;
  },
};
