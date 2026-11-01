import { adminApiClient as api } from './httpClient';
import type { ApiResponse } from '@/types/api';
import type { CartItem } from '@/types/cart';

export const cartApi = {
  get: async (): Promise<ApiResponse<CartItem[]>> => {
    const response = await api.get('/user/cart');
    return response.data;
  },

  add: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/user/cart', data);
    return response.data;
  },

  update: async (data: any): Promise<ApiResponse> => {
    const response = await api.patch('/user/cart', data);
    return response.data;
  },

  /** Remove specific items from cart using productIds array */
  remove: async (productIds: string[]): Promise<ApiResponse> => {
    const response = await api.patch('/user/cart', { productIds });
    return response.data;
  },

  clear: async (): Promise<ApiResponse> => {
    const response = await api.delete('/user/cart');
    return response.data;
  },
};
