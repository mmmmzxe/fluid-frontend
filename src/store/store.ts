import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import favoritesReducer from './slices/favoritesSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    favorites: favoritesReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;