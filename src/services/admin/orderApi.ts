import { adminApiClient as api } from './httpClient';
import type { ApiResponse } from '@/types/api';
import type { Order } from '@/types/order';

export const orderApi = {
  getAll: async (): Promise<ApiResponse<Order[]>> => {
    const response = await api.get('/order/all-orders');
    const raw = response.data as any;
    const list: Order[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.orders)
        ? raw.orders
        : Array.isArray(raw)
          ? raw
          : [];
    return { message: raw?.message || 'Done', data: list };
  },

  getByUser: async (): Promise<ApiResponse<Order[]>> => {
    const response = await api.get('/order/get-orders-by-user');
    return response.data;
  },

  create: async (data: any): Promise<ApiResponse<Order>> => {
    const response = await api.post('/order', data);
    return response.data;
  },

  createWithoutLogin: async (data: any): Promise<ApiResponse<Order>> => {
    const response = await api.post('/order/without-login', data);
    return response.data;
  },

  uploadReceipt: async (
    formData: FormData,
  ): Promise<ApiResponse<{ receipt: { secure_url: string; public_id: string } }>> => {
    const response = await api.post('/order/upload-receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getPaymobUrlForUser: async (orderId: string) => {
    const response = await api.post(`/order/${orderId}/paymob`);
    return response;
  },

  getPaymobUrlForGuest: async (orderId: string) => {
    const response = await api.post(`/order/${orderId}/paymobWithoutLogin`);
    return response;
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse<Order>> => {
    const response = await api.patch(`/order/${id}/status`, { status });
    return response.data;
  },

  updateDeposit: async (id: string, deposit: number): Promise<ApiResponse<Order>> => {
    const response = await api.patch(`/order/${id}/deposit`, { deposit });
    return response.data;
  },

  cancel: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.patch(`/order/${id}/cancel`);
    return response.data;
  },

  cancelWithoutLogin: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.patch(`/order/${id}/cancelWithoutLogin`);
    return response.data;
  },

  retryFlextock: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.post(`/order/${id}/retry-flextock`);
    return response.data;
  },

  syncFlextock: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.post(`/order/${id}/sync-flextock`);
    return response.data;
  },

  bulkSubmitFlextock: async (
    orderIds: string[],
  ): Promise<ApiResponse<{ id: string; status: string; error?: string }[]>> => {
    const response = await api.post('/order/bulk-submit-flextock', { orderIds });
    return response.data;
  },
};
