const DEFAULT_CLOUD_API_BASE = "https://extrachic.cloud/api";
const DEFAULT_LOCAL_API_BASE = "http://localhost:3000/api";

export function getApiBaseUrl() {
  const mode = import.meta.env.VITE_API_MODE;

  if (mode === "local") {
    return import.meta.env.VITE_API_BASE_URL_LOCAL || DEFAULT_LOCAL_API_BASE;
  }

  return import.meta.env.VITE_API_BASE_URL_CLOUD || DEFAULT_CLOUD_API_BASE;
}
