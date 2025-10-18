import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { login } from "@/store/slices/userSlice";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";

function getUserData() {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
}

function getToken() {
  return localStorage.getItem("accessToken");
}

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const { fetchCart } = useCart();
  const { fetchOrders } = useOrders();

  useEffect(() => {
    // Initialize user data from localStorage on app start
    const token = getToken();
    const userData = getUserData();
    
    if (token && userData) {
      // Map user data to match our interface
      const user = {
        _id: userData._id || userData.id || "",
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        role: userData.role || 'user',
      };
      
      dispatch(login({ user, token }));
    }
  }, [dispatch]);

  useEffect(() => {
    // Fetch cart and orders when user is authenticated
    if (isAuthenticated) {
      fetchCart().catch((err) => {
        console.error("Failed to fetch cart:", err);
      });
      
      fetchOrders().catch((err) => {
        console.error("Failed to fetch orders:", err);
      });
    }
  }, [isAuthenticated, fetchCart, fetchOrders]);

  return <>{children}</>;
}
