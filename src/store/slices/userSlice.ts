import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface UserState {
  user: User | null;
  orders: Order[];
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  orders: [],
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.orders = [];
      state.isAuthenticated = false;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { login, logout, addOrder, updateUser } = userSlice.actions;
export default userSlice.reducer;