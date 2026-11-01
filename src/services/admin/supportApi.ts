import { adminApiClient as api } from './httpClient';
import type { ApiResponse } from '@/types/api';
import type { SupportTicket } from '@/types/support';

export const supportApi = {
  getAll: async (): Promise<ApiResponse<SupportTicket[]>> => {
    const response = await api.get('/support');
    const raw = response.data as any;
    const list: SupportTicket[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.support)
        ? raw.support
        : Array.isArray(raw)
          ? raw
          : [];
    return { message: raw?.message || 'Done', data: list };
  },

  create: async (data: any): Promise<ApiResponse<SupportTicket>> => {
    const response = await api.post('/support', data);
    return response.data;
  },
};
