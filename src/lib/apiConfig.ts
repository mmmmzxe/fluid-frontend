const DEFAULT_CLOUD_API_BASE = "https://extrachic.com/api";

export function getApiBaseUrl() {

  return import.meta.env.VITE_API_BASE_URL_CLOUD || DEFAULT_CLOUD_API_BASE;
}
