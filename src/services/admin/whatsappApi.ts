import { adminApiClient as api } from './httpClient';
import type { ApiResponse } from '@/types/api';
import type { WhatsAppSettingsData } from '@/types/whatsapp';

export const whatsappSettingsApi = {
  getSettings: async (): Promise<ApiResponse<WhatsAppSettingsData>> => {
    const response = await api.get('/whatsapp/settings');
    return response.data;
  },

  updateSettings: async (
    data: Partial<WhatsAppSettingsData>,
  ): Promise<ApiResponse<WhatsAppSettingsData>> => {
    const response = await api.put('/whatsapp/settings', data);
    return response.data;
  },

  testMessage: async (recipient: string, message?: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/whatsapp/test', { recipient, message });
    return response.data;
  },
};
