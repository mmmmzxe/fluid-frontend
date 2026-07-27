const DEFAULT_CLOUD_API_BASE = "http://localhost:5000/api";

export function getApiBaseUrl() {

  return import.meta.env.VITE_API_BASE_URL_CLOUD || DEFAULT_CLOUD_API_BASE;
}
