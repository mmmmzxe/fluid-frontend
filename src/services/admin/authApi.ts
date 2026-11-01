import { adminApiClient as api } from './httpClient';
import type { ApiResponse } from '@/types/api';
import type { AuthResponse } from '@/types/auth';

export const authApi = {
  signup: async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    address: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/signup', data);
    return response.data;
  },

  signin: async (data: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/signin', data);
    return response.data;
  },

  resendOtp: async (data: { email: string }): Promise<ApiResponse> => {
    const response = await api.post('/resend-otp', data);
    return response.data;
  },

  forgotPassword: async (data: { email: string }): Promise<ApiResponse> => {
    const response = await api.post('/forget-password', data);
    return response.data;
  },

  resetPassword: async (data: {
    email: string;
    otp: string;
    password: string;
  }): Promise<ApiResponse> => {
    const response = await api.post('/reset-password', data);
    return response.data;
  },
};
