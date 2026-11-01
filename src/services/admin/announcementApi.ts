import { adminApiClient as api } from './httpClient';
import type { ApiResponse } from '@/types/api';
import type { Announcement } from '@/types/announcement';

export const announcementApi = {
  getAll: async (): Promise<ApiResponse<Announcement[]>> => {
    const response = await api.get('/announcement');
    const raw = response.data as any;
    const list: Announcement[] = Array.isArray(raw?.announcements)
      ? raw.announcements
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
          ? raw
          : [];
    return { message: raw?.message || 'Done', data: list };
  },

  getActive: async (): Promise<ApiResponse<Announcement[]>> => {
    const response = await api.get('/announcement/active');
    const raw = response.data as any;
    const list: Announcement[] = Array.isArray(raw?.announcements)
      ? raw.announcements
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
          ? raw
          : [];
    return { message: raw?.message || 'Done', data: list };
  },

  create: async (data: {
    textEn: string;
    textAr: string;
    isActive?: boolean;
  }): Promise<ApiResponse<Announcement>> => {
    const response = await api.post('/announcement', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<{ textEn: string; textAr: string; isActive: boolean }>,
  ): Promise<ApiResponse<Announcement>> => {
    const response = await api.patch(`/announcement/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/announcement/${id}`);
    return response.data;
  },
};
