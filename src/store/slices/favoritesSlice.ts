import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/components/ProductCard';

interface FavoritesState {
  items: Product[];
}

// Helper to load from localStorage
const loadFromStorage = (): Product[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load favorites from storage:', error);
    return [];
  }
};

// Helper to save to localStorage
const saveToStorage = (items: Product[]) => {
  try {
    localStorage.setItem('favorites', JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save favorites to storage:', error);
  }
};

const initialState: FavoritesState = {
  items: loadFromStorage(),
};

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<Product>) => {
      const exists = state.items.find(item => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        saveToStorage(state.items);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      saveToStorage(state.items);
    },
    clearFavorites: (state) => {
      state.items = [];
      saveToStorage([]);
    },
    setFavorites: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      saveToStorage(state.items);
    }
  },
});

export const { addToFavorites, removeFromFavorites, clearFavorites, setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;