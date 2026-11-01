import { adminApiClient as api } from './httpClient';
import type { ApiResponse } from '@/types/api';
import type { Product } from '@/types/product';

export interface ProductQueryParams {
  name?: string;
  maxPrice?: number;
  minPrice?: number;
  category?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

export const productApi = {
  getAll: async (params?: ProductQueryParams): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/product', { params });
    return response.data;
  },

  /** Fetch all products, bypassing cache */
  getAllNoCache: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/product/all', {
      headers: { 'Cache-Control': 'no-store' },
    });
    const raw = response.data as any;
    const list: Product[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.products)
        ? raw.products
        : Array.isArray(raw)
          ? raw
          : [];
    return { message: raw?.message || 'Done', data: list };
  },

  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/product/${id}`);
    return response.data;
  },

  create: async (formData: FormData): Promise<ApiResponse<Product>> => {
    const response = await api.post('/product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: string, formData: FormData): Promise<ApiResponse<Product>> => {
    const response = await api.patch(`/product/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  },

  addVariant: async (id: string, data: any): Promise<ApiResponse<Product>> => {
    const response = await api.post(`/product/${id}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  editVariant: async (id: string, data: any): Promise<ApiResponse<Product>> => {
    const response = await api.patch(`/product/${id}/editVariant`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  /** DELETE /product/{productId}/deleteVariant/{variantId} */
  deleteVariant: async (productId: string, variantId: string): Promise<ApiResponse<Product>> => {
    const response = await api.delete(`/product/${productId}/deleteVariant/${variantId}`);
    return response.data;
  },

  /** POST /product/deleteSizeOfVariant/{productId}/{variantId}/{sizeId} */
  deleteSizeOfVariant: async (
    productId: string,
    variantId: string,
    sizeId: string,
  ): Promise<ApiResponse<Product>> => {
    const response = await api.post(
      `/product/deleteSizeOfVariant/${productId}/${variantId}/${sizeId}`,
    );
    return response.data;
  },

  /** POST /product/addSizeToVariant/{productId}/{variantId} */
  addSizeToVariant: async (
    productId: string,
    variantId: string,
    data: { size: Array<{ size: string; stock: string }> },
  ): Promise<ApiResponse<Product>> => {
    const response = await api.post(
      `/product/addSizeToVariant/${productId}/${variantId}`,
      data,
      { headers: { 'Content-Type': 'application/json' } },
    );
    return response.data;
  },

  bestSelling: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/product/best-selling');
    return response.data;
  },
};
