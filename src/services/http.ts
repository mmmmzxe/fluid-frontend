const BASE_URL = "/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  auth?: boolean; // include Authorization header from localStorage
}

function buildHeaders(init?: Record<string, string>, includeAuth: boolean = true): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(init || {}),
  };

  if (includeAuth) {
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `${token}`;
  }

  return headers;
}

async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", headers, body, auth = true } = options;
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers: buildHeaders(headers, auth),
    body: body != null && typeof body !== "string" ? JSON.stringify(body) : body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText || "Request failed";
    throw new Error(message);
  }
  return data as T;
}

export const http = {
  get: <T = any>(path: string, opts?: Omit<RequestOptions, "method" | "body">) => request<T>(path, { ...opts, method: "GET" }),
  post: <T = any>(path: string, body?: any, opts?: Omit<RequestOptions, "method">) => request<T>(path, { ...opts, method: "POST", body }),
  put: <T = any>(path: string, body?: any, opts?: Omit<RequestOptions, "method">) => request<T>(path, { ...opts, method: "PUT", body }),
  patch: <T = any>(path: string, body?: any, opts?: Omit<RequestOptions, "method">) => request<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T = any>(path: string, opts?: Omit<RequestOptions, "method" | "body">) => request<T>(path, { ...opts, method: "DELETE" }),
};

export type { RequestOptions };




