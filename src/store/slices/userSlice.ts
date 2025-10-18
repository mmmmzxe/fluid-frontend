import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Order {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: Array<{
    product: {
      _id: string;
      titleEnglish: string;
      mainImage?: {
        secure_url: string;
      };
    };
    variant: {
      color: string;
      size: string;
    };
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role?: 'superAdmin' | 'admin' | 'user';
}

interface CartItem {
  _id: string;
  productId: {
    _id: string;
    titleEnglish: string;
    titleArabic: string;
    descriptionEnglish: string;
    descriptionArabic: string;
    price: number;
    finalPrice: number;
    discount?: number;
    discountType?: string;
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
        [key: string]: string | number;
        stock: number;
        _id: string;
      }>;
      _id: string;
    }>;
  };
  variantId: string;
  sizeId: string;
  variant: {
    color: string;
    size: Array<{
      [key: string]: string | number;
      stock: number;
      _id: string;
    }>;
  };
  quantity: number;
}

interface UserState {
  user: User | null;
  orders: Order[];
  cart: CartItem[];
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  orders: [],
  cart: [],
  token: null,
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.orders = [];
      state.cart = [];
      state.token = null;
      state.isAuthenticated = false;
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.cart = action.payload;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.cart.find(
        item => 
          item.productId._id === action.payload.productId._id &&
          item.variantId === action.payload.variantId &&
          item.sizeId === action.payload.sizeId
      );
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    updateCartItem: (state, action: PayloadAction<{ _id: string; quantity: number }>) => {
      const item = state.cart.find(item => item._id === action.payload._id);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.cart = state.cart.filter(item => item._id !== action.payload._id);
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter(item => item._id !== action.payload);
    },
    clearCart: (state) => {
      state.cart = [];
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };

      }
      
    },
  },
});

export const { 
  login, 
  logout, 
  setOrders, 
  setCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart, 
  updateUser 
} = userSlice.actions;
export default userSlice.reducer;