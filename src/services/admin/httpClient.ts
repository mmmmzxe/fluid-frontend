import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { getApiBaseUrl } from '@/lib/apiConfig';
import { clearStoredSession, isInvalidSessionError } from '@/lib/adminSession';

function getErrorDetails(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return { message: error instanceof Error ? error.message : '', status: undefined };
  }
  const responseData = error.response?.data as { message?: unknown; error?: unknown } | undefined;
  const message = responseData?.message || responseData?.error || error.message || '';
  return { message: String(message), status: error.response?.status };
}

function isExpiredSession(error: unknown) {
  return isInvalidSessionError(new Error(getErrorDetails(error).message));
}

function createAdminApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = token;
    return config;
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      const { message, status } = getErrorDetails(error);
      if (isExpiredSession(error)) {
        clearStoredSession();
        if (window.location.pathname !== '/login') {
          toast.error('Session expired. Please log in again.');
          window.location.assign('/login');
        }
      } else if (status && status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(message || 'An error occurred. Please try again.');
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export const adminApiClient = createAdminApiClient();
