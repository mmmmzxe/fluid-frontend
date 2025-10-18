import { useCallback, useState } from "react";
import { http } from "@/services/http";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useRedux";
import { login, logout } from "@/store/slices/userSlice";

type SignInPayload = { email: string; password: string };
type SignUpPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
};
type ForgotPasswordPayload = { email: string };
type ResetPasswordPayload = { email: string; otp: string; password: string };

const API_BASE = ""; // use http client base

function saveToken(token: string | null) {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
}

function mapUser(raw: any) {
  if (!raw) return null;
  return {
    _id: raw._id || raw.id || "",
    name: raw.name || "",
    email: raw.email || "",
    phone: raw.phone || "",
    role: raw.role || 'user',
  };
}

function saveUserData(user: any) {
  if (user) {
    localStorage.setItem("userData", JSON.stringify(user));
  } else {
    localStorage.removeItem("userData");
  }
}

function getUserData() {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
}

export function useUserProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');

      const data = await http.get<any>(`/user/profile`);

      // Update localStorage with fresh user data
      if (data?.data) {
        saveUserData(data.data);
      }
      
      return data.data;
    } catch (e: any) {
      setError(e?.message || "Failed to fetch profile");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchProfile, loading, error };
}

export function useSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const signIn = useCallback(async (payload: SignInPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await http.post<any>(`/auth/signin`, payload, { auth: false });

      const token: string | undefined = data?.data?.accessToken;
      const userRaw = data?.data?.user;
      const user = mapUser(userRaw);
      if (!token || !user) throw new Error("Invalid sign in response");

      saveToken(token);
      saveUserData(userRaw); // Save full user data to localStorage
      dispatch(login({ user, token }));
      
      // Redirect based on role
      if (user.role === 'superAdmin' || user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
      return { user, token };
    } catch (e: any) {
      setError(e?.message || "Sign in failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  const signOut = useCallback(() => {
    saveToken(null);
    saveUserData(null);
    dispatch(logout());
    navigate("/");
  }, [dispatch, navigate]);

  return { signIn, signOut, loading, error };
}

export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const signUp = useCallback(async (payload: SignUpPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await http.post<any>(`/auth/signup`, payload, { auth: false });

      const token: string | undefined = data?.data?.accessToken;
      const userRaw = data?.data?.user;
      const user = mapUser(userRaw);
      if (token) saveToken(token);
      if (user) dispatch(login({ user, token }));
      navigate("/profile");
      return { user, token };
    } catch (e: any) {
      setError(e?.message || "Sign up failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  return { signUp, loading, error };
}

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = useCallback(async (payload: ForgotPasswordPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await http.post<any>(`/auth/forget-password`, payload, { auth: false });
      return data;
    } catch (e: any) {
      setError(e?.message || "Request failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { requestReset, loading, error };
}

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await http.post<any>(`/auth/reset-password`, payload, { auth: false });
      return data;
    } catch (e: any) {
      setError(e?.message || "Reset failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { resetPassword, loading, error };
}


