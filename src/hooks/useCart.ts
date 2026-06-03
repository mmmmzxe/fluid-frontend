import { useCallback, useState } from "react";
import { http } from "@/services/http";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setCart, addToCart, updateCartItem, removeFromCart, clearCart } from "@/store/slices/userSlice";
import { cartApi, CartItem } from "@/services/adminApi";

const API_BASE = ""; // not used directly when using http

export function useCart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { cart, token, isAuthenticated } = useAppSelector((state) => state.user);

  // Guest cart (localStorage) helpers
  const readGuestCart = () => {
    try {
      const raw = localStorage.getItem('guestCart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const writeGuestCart = (items: any[]) => {
    localStorage.setItem('guestCart', JSON.stringify(items));
  };

  const getAuthHeaders = () => {
    if (!token) throw new Error("No authentication token");
    return { } as Record<string, string>; // headers handled by http client
  };

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      // Load guest cart for unauthenticated users
      const guestItems = readGuestCart();
      dispatch(setCart(guestItems as any[]));
      return guestItems;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await cartApi.get();
      const cartItems = (data as any).cart?.products || (data as any).data || [];
      dispatch(setCart(cartItems as any[]));
      return cartItems;
    } catch (e: any) {
      setError(e?.message || "Failed to fetch cart");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, dispatch]);

  // Add item to cart
  const addItemToCart = useCallback(async (payload: {
    productId: string;
    variantId: string;
    sizeId: string;
    quantity: number;
    variant: {
      size: string;
      color: string;
    };
  }) => {
    if (!isAuthenticated || !token) {
      // Add to guest cart in localStorage
      const items = readGuestCart();
      items.push(payload);
      writeGuestCart(items);
      dispatch(setCart(items));
      return { message: 'Added to guest cart', data: items } as any;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await cartApi.add(payload);
      
      // Update local cart state with the new item
      if (data.data) {
        dispatch(setCart(data.data));
      }
      
      return data;
    } catch (e: any) {
      setError(e?.message || "Failed to add item to cart");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, dispatch]);

  // Update cart item quantity
  const updateItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!isAuthenticated || !token) {
      throw new Error("Please log in to update cart");
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await cartApi.update({ _id: itemId, quantity });
      
      // Update local cart state
      dispatch(updateCartItem({ _id: itemId, quantity }));
      
      return true;
    } catch (e: any) {
      setError(e?.message || "Failed to update cart item");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, dispatch]);

  // Remove item from cart
  const removeItemFromCart = useCallback(async (itemId: string) => {
    if (!isAuthenticated || !token) {
      throw new Error("Please log in to remove cart items");
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await cartApi.update({ _id: itemId, quantity: 0 });
      
      // Update local cart state
      dispatch(removeFromCart(itemId));
      
      return true;
    } catch (e: any) {
      setError(e?.message || "Failed to remove cart item");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, dispatch]);

  // Clear entire cart
  const clearUserCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      throw new Error("Please log in to clear cart");
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await cartApi.clear();
      
      // Update local cart state
      dispatch(clearCart());
      
      return true;
    } catch (e: any) {
      setError(e?.message || "Failed to clear cart");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, dispatch]);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearUserCart,
    // Guest checkout: caller supplies details per backend contract
    checkoutWithoutLogin: async (details: any) => {
      const items = readGuestCart();
      const products = items.map((it: any) => ({
        productId: typeof it.productId === 'string' ? it.productId : it.productId._id,
        variantId: it.variantId,
        sizeId: it.sizeId,
        variant: it.variant,
        quantity: it.quantity || 1,
      }));
      const payload = { ...details, products };
      const res = await (await import('@/services/adminApi')).orderApi.createWithoutLogin(payload);
      // clear guest cart on success
      writeGuestCart([]);
      dispatch(clearCart());
      return res;
    }
  };
}
