import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { getApiBaseUrl } from '@/lib/apiConfig';

// Types for API responses
export interface ApiResponse<T = any> {
  message: string;
  data: T;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'superAdmin' | 'admin';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Category {
  _id: string;
  nameEnglish?: string;
  nameArabic?: string;
  name?: string; // Some categories might only have 'name' field
  image?: {
    secure_url: string;
    public_id: string;
    _id: string;
  };
  slugEnglish?: string;
  slugArabic?: string;
  slug?: string; // Some categories might only have 'slug' field
  subCategories?: SubCategory[];
  createdAt: string;
  updatedAt: string;
  createdBy?: any;
  folderId?: string;
}

export interface SubCategory {
  _id: string;
  nameEnglish?: string;
  nameArabic?: string;
  categoryId: string | {
    _id: string;
    name: string;
    image?: {
      secure_url: string;
      public_id: string;
      _id: string;
    };
    createdBy?: string;
    folderId?: string;
    slug?: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
    subCategories?: string[];
  };
  slugEnglish?: string;
  slugArabic?: string;
  image?: {
    secure_url: string;
    public_id: string;
    _id?: string;
  };
  createdBy?: any;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ProductVariant {
  color: string;
  size: Array<{
    size?: string;
    stock: number;
    _id: string;
  }>;
  stock: number;
  _id: string;
}

export interface Product {
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
  variants?: ProductVariant[];
  slugEnglish: string;
  slugArabic: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  status: 'pending' | 'placed' | 'on_way' | 'delivered' | 'cancelled';
  products: Array<{
    name?: string;
    productId: string;
    unitPrice?: number;
    quantity: number;
    variantId?: string;
    sizeId?: string;
    finalPrice?: number;
    _id?: string;
  }>;
  subTotal: number;
  finalPrice: number;
  createdAt: string;
  updatedAt: string;
  note?: string;
  paymentWay: 'card' | 'cash';
  address: string;
  phone: string;

  // Fields for registered users
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };

  // Fields for guest users
  firstName?: string;
  lastName?: string;
  paidAt?: string;
  email?: string;
  deposit?: number;
  depositReceipt?: { secure_url: string; public_id: string };
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: {
    color: string;
    size: string;
  };
}

export interface SupportTicket {
  _id: string;
  // New simple support fields from backend response
  name?: string;
  phone?: string;
  message: string;
  // Legacy fields kept optional for compatibility with other UIs
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  subject?: string;
  status?: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Shipping {
  _id: string;
  government?: string;
  name?: string;
  description?: string;
  price?: number;
  estimatedDays?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create axios instance
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Backend expects "Barrer" not "Bearer"
        const header = `${token}`;
        config.headers.Authorization = header;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || '';
      const isJwtExpired =
        error.response?.status === 401 ||
        msg === 'jwt expired' ||
        (typeof msg === 'string' && msg.toLowerCase().includes('jwt expired'));

      if (isJwtExpired) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
        }
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (msg) {
        toast.error(msg);
      } else {
        toast.error('An error occurred. Please try again.');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createApiInstance();

// Authentication API
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

  resetPassword: async (data: { email: string; otp: string; password: string }): Promise<ApiResponse> => {
    const response = await api.post('/reset-password', data);
    return response.data;
  },
};

// Category API
export const categoryApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/dashboard/category');
    return response.data;
  },

  create: async (formData: FormData): Promise<ApiResponse<Category>> => {
    const response = await api.post('/dashboard/category', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, formData: FormData): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/dashboard/category/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/dashboard/category/${id}`);
    return response.data;
  },
};

// Product API
export const productApi = {
  getAll: async (params?: {
    name?: string;
    maxPrice?: number;
    minPrice?: number;
    category?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
  }): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/product', { params });
    return response.data;
  },

  // Get all products without caching
  getAllNoCache: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/product/all', {
      headers: { 'Cache-Control': 'no-store' },
    });
    const raw = response.data as any;
    const list: Product[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.products)
        ? raw.products
        : Array.isArray(raw)
          ? raw
          : [];
    return { message: raw?.message || 'Done', data: list } as ApiResponse<Product[]>;
  },

  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/product/${id}`);
    return response.data;
  },

  create: async (formData: FormData): Promise<ApiResponse<Product>> => {
    const response = await api.post('/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, formData: FormData): Promise<ApiResponse<Product>> => {
    const response = await api.patch(`/product/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  },

  addVariant: async (id: string, data: any): Promise<ApiResponse<Product>> => {
    const response = await api.post(`/product/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  editVariant: async (id: string, data: any): Promise<ApiResponse<Product>> => {
    const response = await api.patch(`/product/${id}/editVariant`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Delete a variant from a product: DELETE /product/{productId}/deleteVariant/{variantId}
  deleteVariant: async (productId: string, variantId: string): Promise<ApiResponse<Product>> => {
    const response = await api.delete(`/product/${productId}/deleteVariant/${variantId}`);
    return response.data;
  },

  // Delete a size from a variant: POST /product/deleteSizeOfVariant/{productId}/{variantId}/{sizeId}
  deleteSizeOfVariant: async (productId: string, variantId: string, sizeId: string): Promise<ApiResponse<Product>> => {
    const response = await api.post(`/product/deleteSizeOfVariant/${productId}/${variantId}/${sizeId}`);
    return response.data;
  },

  // Add size(s) to a variant: POST /product/addSizeToVariant/{productId}/{variantId}
  addSizeToVariant: async (productId: string, variantId: string, data: { size: Array<{ size: string; stock: string }> }): Promise<ApiResponse<Product>> => {
    const response = await api.post(`/product/addSizeToVariant/${productId}/${variantId}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  bestSelling: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/product/best-selling');
    return response.data;
  },
};

// Order API
export const orderApi = {
  getAll: async (): Promise<ApiResponse<Order[]>> => {
    const response = await api.get('/order/all-orders');
    const raw = response.data as any;
    const list: Order[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.orders)
        ? raw.orders
        : Array.isArray(raw)
          ? raw
          : [];
    return { message: raw?.message || 'Done', data: list } as ApiResponse<Order[]>;
  },


  getByUser: async (): Promise<ApiResponse<Order[]>> => {
    const response = await api.get('/order/get-orders-by-user');
    return response.data;
  },

  create: async (data: any): Promise<ApiResponse<Order>> => {
    const response = await api.post('/order', data);
    return response.data;
  },
  uploadReceipt: async (formData: FormData): Promise<ApiResponse<{ receipt: { secure_url: string; public_id: string } }>> => {
    const response = await api.post('/order/upload-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  // داخل كائن orderApi
  getPaymobUrlForUser: async (orderId: string) => {
    const response = await api.post(`/order/${orderId}/paymob`);
    // The API is expected to return an object like { url: '...' }
    return response;
  },
  getPaymobUrlForGuest: async (orderId: string) => {
    const response = await api.post(`/order/${orderId}/paymobWithoutLogin`);
    // The API is expected to return an object like { url: '...' }
    return response;
  },
  createWithoutLogin: async (data: any): Promise<ApiResponse<Order>> => {
    const response = await api.post('/order/without-login', data);
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse<Order>> => {
    const response = await api.patch(`/order/${id}/status`, { status });
    return response.data;
  },

  updateDeposit: async (id: string, deposit: number): Promise<ApiResponse<Order>> => {
    const response = await api.patch(`/order/${id}/deposit`, { deposit });
    return response.data;
  },

  cancel: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.patch(`/order/${id}/cancel`);
    return response.data;
  },

  cancelWithoutLogin: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.patch(`/order/${id}/cancelWithoutLogin`);
    return response.data;
  },
};

// Cart API
export const cartApi = {
  get: async (): Promise<ApiResponse<CartItem[]>> => {
    const response = await api.get('/user/cart');
    return response.data;
  },

  add: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/user/cart', data);
    return response.data;
  },

  update: async (data: any): Promise<ApiResponse> => {
    const response = await api.patch('/user/cart', data);
    return response.data;
  },

  // Remove specific items from cart using productIds array
  remove: async (productIds: string[]): Promise<ApiResponse> => {
    const response = await api.patch('/user/cart', { productIds });
    return response.data;
  },

  clear: async (): Promise<ApiResponse> => {
    const response = await api.delete('/user/cart');
    return response.data;
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/user/all-user');
    const raw = response.data as any;
    const list: User[] = Array.isArray(raw?.user)
      ? raw.user
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.users)
          ? raw.users
          : Array.isArray(raw)
            ? raw
            : [];
    return { message: raw?.message || 'Done', data: list } as ApiResponse<User[]>;
  },

  getById: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/user/user-by-id/${userId}`);
    const raw = response.data as any;
    // API returns { message: "Done", user: {...} }
    return { 
      message: raw?.message || 'Done', 
      data: raw?.user || raw?.data || raw 
    } as ApiResponse<User>;
  },

  addToFavorites: async (productId: string): Promise<ApiResponse> => {
    const response = await api.patch(`/user/add-to-favorite/${productId}`);
    return response.data;
  },

  removeFromFavorites: async (productId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/user/remove-from-favorite/${productId}`);
    return response.data;
  },

  getFavorites: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/user/get-favorite');
    return response.data;
  },
};

// SubCategory API
export const subCategoryApi = {
  getAll: async (): Promise<ApiResponse<SubCategory[]>> => {
    const response = await api.get('/dashboard/subCategory');
    const raw = response.data as any;
    const list: SubCategory[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.subCategories)
        ? raw.subCategories
        : Array.isArray(raw)
          ? raw
          : [];
    return { message: raw?.message || 'Done', data: list } as ApiResponse<SubCategory[]>;
  },

  // Create subcategory using categoryId in path and multipart form data
  create: async (categoryId: string, form: FormData): Promise<ApiResponse<SubCategory>> => {
    const response = await api.post(`/dashboard/subCategory/${categoryId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update subcategory by id using multipart form data
  update: async (id: string, form: FormData): Promise<ApiResponse<SubCategory>> => {
    const response = await api.patch(`/dashboard/subCategory/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/dashboard/subCategory/${id}`);
    return response.data;
  },
};

// Support API
export const supportApi = {
  getAll: async (): Promise<ApiResponse<SupportTicket[]>> => {
    const response = await api.get('/support');
    const raw = response.data as any;
    const list: SupportTicket[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.support)
        ? raw.support
        : Array.isArray(raw)
          ? raw
          : [];
    return { message: raw?.message || 'Done', data: list } as ApiResponse<SupportTicket[]>;
  },

  create: async (data: any): Promise<ApiResponse<SupportTicket>> => {
    const response = await api.post('/support', data);
    return response.data;
  },
};

// Shipping API
export const shippingApi = {
  getAll: async (): Promise<ApiResponse<Shipping[]>> => {
    const response = await api.get('/shipping');
    const raw = response.data as any;
    const list: Shipping[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.shipping)
        ? raw.shipping
        : Array.isArray(raw)
          ? raw
          : [];
    return { message: raw?.message || 'Done', data: list } as ApiResponse<Shipping[]>;
  },

  create: async (data: any): Promise<ApiResponse<Shipping>> => {
    const response = await api.post('/shipping', data);
    return response.data;
  },

  // Government-based shipping helpers
  createGov: async (data: { government: string; price: number }): Promise<ApiResponse<Shipping>> => {
    const response = await api.post('/shipping', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<ApiResponse<Shipping>> => {
    const response = await api.patch(`/shipping/${id}`, data);
    return response.data;
  },

  updateGov: async (id: string, data: { government?: string; price?: number }): Promise<ApiResponse<Shipping>> => {
    const response = await api.patch(`/shipping/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/shipping/${id}`);
    return response.data;
  },
};

// Announcement Ticker API
export interface Announcement {
  _id: string;
  textEn: string;
  textAr: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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
    return { message: raw?.message || 'Done', data: list } as ApiResponse<Announcement[]>;
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
    return { message: raw?.message || 'Done', data: list } as ApiResponse<Announcement[]>;
  },

  create: async (data: { textEn: string; textAr: string; isActive?: boolean }): Promise<ApiResponse<Announcement>> => {
    const response = await api.post('/announcement', data);
    return response.data;
  },

  update: async (id: string, data: Partial<{ textEn: string; textAr: string; isActive: boolean }>): Promise<ApiResponse<Announcement>> => {
    const response = await api.patch(`/announcement/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/announcement/${id}`);
    return response.data;
  },
};

// ─── Social Media Orders ──────────────────────────────────────────────────────

export interface EditHistoryItem {
  editedBy: string;
  editedByUserId?: string | { _id: string; name: string };
  editedAt: string;
  summary: string;
  previousState?: Record<string, any>;
}

export interface SocialOrder {
  _id: string;
  createdBy: 'Fatma' | 'Mariam' | 'Zeinab' | 'Sara';
  createdByUserId: string | { _id: string; name: string; email: string };
  status: 'pending' | 'confirmed' | 'cancelled';
  editHistory?: EditHistoryItem[];
  productName: string;
  productImage?: { secure_url: string; public_id: string };
  price: number;
  color?: string;
  size?: string;
  quantity: number;
  productNotes?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  city: string;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerStat {
  seller: string;
  count: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
}

export const socialOrderApi = {
  /** Create a social order — accepts multipart/form-data for image upload */
  create: async (formData: FormData): Promise<ApiResponse<SocialOrder>> => {
    const response = await api.post('/social-orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** Edit an order details — accepts multipart/form-data */
  update: async (id: string, formData: FormData): Promise<ApiResponse<SocialOrder>> => {
    const response = await api.patch(`/social-orders/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** SuperAdmin: get all orders from all sellers */
  getAll: async (): Promise<ApiResponse<SocialOrder[]>> => {
    const response = await api.get('/social-orders');
    const raw = response.data as any;
    const list: SocialOrder[] = Array.isArray(raw?.data) ? raw.data : [];
    return { message: raw?.message || 'Done', data: list };
  },

  /** Admin seller: get only their own orders */
  getMyOrders: async (): Promise<ApiResponse<SocialOrder[]>> => {
    const response = await api.get('/social-orders/my-orders');
    const raw = response.data as any;
    const list: SocialOrder[] = Array.isArray(raw?.data) ? raw.data : [];
    return { message: raw?.message || 'Done', data: list };
  },

  /** SuperAdmin: get per-seller order counts */
  getStats: async (): Promise<ApiResponse<SellerStat[]>> => {
    const response = await api.get('/social-orders/stats');
    const raw = response.data as any;
    const list: SellerStat[] = Array.isArray(raw?.data) ? raw.data : [];
    return { message: raw?.message || 'Done', data: list };
  },

  /** Get a single order by ID (admins restricted to their own) */
  getById: async (id: string): Promise<ApiResponse<SocialOrder>> => {
    const response = await api.get(`/social-orders/${id}`);
    const raw = response.data as any;
    return { message: raw?.message || 'Done', data: raw?.data ?? raw };
  },

  /** SuperAdmin: update order status to confirmed or cancelled */
  updateStatus: async (id: string, status: 'confirmed' | 'cancelled'): Promise<ApiResponse<SocialOrder>> => {
    const response = await api.patch(`/social-orders/${id}/status`, { status });
    return response.data;
  },
};


export default api;
