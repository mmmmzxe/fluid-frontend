// API service functions for backend integration

import { getApiBaseUrl } from '@/lib/apiConfig';

const API_BASE_URL = getApiBaseUrl();

export interface ApiCategory {
  _id: string;
  name?: string;
  nameEnglish?: string;
  nameArabic?: string;
  image?: {
    secure_url: string;
    public_id: string;
    _id: string;
  };
  slug?: string;
  slugEnglish?: string;
  slugArabic?: string;
  subCategories?: ApiSubCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiSubCategory {
  _id: string;
  nameEnglish: string;
  nameArabic: string;
  categoryId: string;
  slugEnglish: string;
  slugArabic: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiProduct {
  _id: string;
  titleEnglish: string;
  titleArabic: string;
  descriptionEnglish: string;
  descriptionArabic: string;
  price: number;
  finalPrice: number;
  discount?: number;
  discountType?: string;
  stock?: number;
  category: string;
  subCategory?: string;
  mainImage?: {
    secure_url: string;
    public_id: string;
    _id: string;
  };
  subImages?: Array<{
    secure_url: string;
    public_id: string;
    _id: string;
  }>;
  variants?: Array<{
    color: string;
    size: Array<{
      size?: string;
      stock: number;
      _id: string;
    }>;
    stock: number;
    _id: string;
  }>;
  slugEnglish: string;
  slugArabic: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiProductsResponse {
  message: string;
  data: ApiProduct[];
}

export interface ApiCategoriesResponse {
  message: string;
  data: ApiCategory[];
}

// Fetch categories from API
export const fetchCategories = async (): Promise<ApiCategoriesResponse> => {
  const response = await fetch(`${API_BASE_URL}/dashboard/category`, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch products from API
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
      'Cache-Control': 'no-cache'
    },
    // avoid returning 304 Not Modified cached responses
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  
  const data = await response.json();

  // Handle both response formats
  if (data.data && Array.isArray(data.data)) {
    return data; // New format: { message: "Done-Cached", data: [...] }
  } else if (data.data && data.data.document && Array.isArray(data.data.document)) {
    // Old format: { message: "Done", data: { document: [...] } }
    return {
      message: data.message,
      data: data.data.document
    };
  } else {
    throw new Error('Unexpected API response format');
  }
};
