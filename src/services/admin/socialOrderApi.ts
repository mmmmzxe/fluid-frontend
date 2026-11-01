import { adminApiClient as api } from './httpClient';
import type { ApiResponse } from '@/types/api';
import type { SocialOrder, SellerStat } from '@/types/social-order';

export const socialOrderApi = {
  /** Create a social order — accepts multipart/form-data for image upload */
  create: async (formData: FormData): Promise<ApiResponse<SocialOrder>> => {
    const response = await api.post('/social-orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** Edit order details — accepts multipart/form-data */
  update: async (id: string, formData: FormData): Promise<ApiResponse<SocialOrder>> => {
    const response = await api.patch(`/social-orders/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** SuperAdmin: get all orders from all sellers */
  getAll: async (): Promise<ApiResponse<SocialOrder[]>> => {
    const response = await api.get('/social-orders', {
      headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' },
      params: { _: Date.now() },
    });
    const raw = response.data as any;
    const list: SocialOrder[] = Array.isArray(raw?.data) ? raw.data : [];
    return { message: raw?.message || 'Done', data: list };
  },

  /** Admin seller: get only their own orders */
  getMyOrders: async (): Promise<ApiResponse<SocialOrder[]>> => {
    const response = await api.get('/social-orders/my-orders', {
      headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' },
      params: { _: Date.now() },
    });
    const raw = response.data as any;
    const list: SocialOrder[] = Array.isArray(raw?.data) ? raw.data : [];
    return { message: raw?.message || 'Done', data: list };
  },

  /** SuperAdmin: per-seller order counts */
  getStats: async (): Promise<ApiResponse<SellerStat[]>> => {
    const response = await api.get('/social-orders/stats');
    const raw = response.data as any;
    const list: SellerStat[] = Array.isArray(raw?.data) ? raw.data : [];
    return { message: raw?.message || 'Done', data: list };
  },

  /** Get a single order by ID (admins restricted to their own) */
  getById: async (id: string): Promise<ApiResponse<SocialOrder>> => {
    const response = await api.get(`/social-orders/${id}`);
    const raw = response.data as any;
    return { message: raw?.message || 'Done', data: raw?.data ?? raw };
  },

  /** SuperAdmin: update order status */
  updateStatus: async (
    id: string,
    status: 'confirmed' | 'cancelled',
  ): Promise<ApiResponse<SocialOrder>> => {
    const response = await api.patch(`/social-orders/${id}/status`, { status });
    return response.data;
  },

  /** SuperAdmin: retry submitting an order to Flextock */
  retryFlextock: async (id: string): Promise<ApiResponse<SocialOrder>> => {
    const response = await api.post(`/social-orders/${id}/retry-flextock`);
    return response.data;
  },

  /** SuperAdmin: sync order tracking from Flextock */
  syncFlextock: async (id: string): Promise<ApiResponse<SocialOrder>> => {
    const response = await api.post(`/social-orders/${id}/sync-flextock`);
    return response.data;
  },

  /** SuperAdmin: bulk submit selected social orders to Flextock */
  bulkSubmitFlextock: async (
    orderIds: string[],
  ): Promise<ApiResponse<{ id: string; status: string; error?: string }[]>> => {
    const response = await api.post('/social-orders/bulk-submit-flextock', { orderIds });
    return response.data;
  },
};
