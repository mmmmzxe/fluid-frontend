/**
 * services/api.ts
 *
 * Public-facing fetch helpers used by non-admin pages.
 * Types are imported from `@/types` — no more local duplicates.
 */

import { getApiBaseUrl } from '@/lib/apiConfig';
import type { Category, SubCategory } from '@/types/category';
import type { Product } from '@/types/product';

const API_BASE_URL = getApiBaseUrl();

// ── Response shapes (re-using the same Category/Product types) ─────────────────

export interface ApiProductsResponse {
  message: string;
  data: Product[];
}

export interface ApiCategoriesResponse {
  message: string;
  data: Category[];
}

// Keep these aliases so existing consumers of `ApiCategory` / `ApiSubCategory`
// / `ApiProduct` from `@/services/api` continue compiling.
export type { Category as ApiCategory } from '@/types/category';
export type { SubCategory as ApiSubCategory } from '@/types/category';
export type { Product as ApiProduct } from '@/types/product';

// ── Fetch helpers ──────────────────────────────────────────────────────────────

/** Fetch all categories from the API */
export const fetchCategories = async (): Promise<ApiCategoriesResponse> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/category`, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  return response.json();
};

/** Fetch products from the API with optional filters */
export const fetchProducts = async (params?: {
  name?: string;
  maxPrice?: number;
  minPrice?: number;
  category?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}): Promise<ApiProductsResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.name) searchParams.append('name', params.name);
  if (params?.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
  if (params?.minPrice) searchParams.append('minPrice', params.minPrice.toString());
  if (params?.category) searchParams.append('category', params.category);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/product${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.data && Array.isArray(data.data)) {
    return data; // { message: "Done-Cached", data: [...] }
  } else if (data.data?.document && Array.isArray(data.data.document)) {
    return { message: data.message, data: data.data.document };
  } else {
    throw new Error('Unexpected API response format');
  }
};
