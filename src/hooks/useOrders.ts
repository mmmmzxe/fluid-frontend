import { useCallback, useState } from "react";
import { http } from "@/services/http";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setOrders } from "@/store/slices/userSlice";

const API_BASE = ""; // not used directly when using http

export function useOrders() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { orders, token, isAuthenticated } = useAppSelector((state) => state.user);

  const getAuthHeaders = () => ({}) as Record<string, string>; // headers handled by http client

  // Fetch user orders
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await http.get<any>(`/order/get-orders-by-user`);
      const orders = Array.isArray(data) ? data : (data?.data || []);
      dispatch(setOrders(orders as any));
      return orders;
    } catch (e: any) {
      setError(e?.message || "Failed to fetch orders");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, dispatch]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
  };
}
