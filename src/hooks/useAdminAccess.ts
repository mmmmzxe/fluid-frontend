import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useRedux';
import { login, logout } from '@/store/slices/userSlice';
import { AdminUser, clearStoredSession, getStoredUser, isAdmin, isInvalidSessionError, normalizeUser } from '@/lib/adminSession';

type AccessState = { ready: boolean; user: AdminUser | null };

/** Resolves an admin session once when the admin layout mounts. */
export function useAdminAccess(): AccessState {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { fetchProfile } = useUserProfile();
  const initialized = useRef(false);
  const [state, setState] = useState<AccessState>({ ready: false, user: null });

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const token = localStorage.getItem('accessToken');
    if (!token) { navigate('/login', { replace: true }); setState({ ready: true, user: null }); return; }

    const validateSession = async () => {
      let resolvedUser = getStoredUser();
      try {
        const profileUser = normalizeUser(await fetchProfile());
        if (profileUser) resolvedUser = profileUser;
      }
      catch (error) {
        if (isInvalidSessionError(error)) {
          clearStoredSession(); dispatch(logout()); toast.error('Session expired. Please log in again.');
          navigate('/login', { replace: true }); setState({ ready: true, user: null }); return;
        }
        if (!resolvedUser) { toast.error('Unable to verify your profile. Please try again.'); setState({ ready: true, user: null }); return; }
      }

      if (!isAdmin(resolvedUser)) {
        toast.error('Access denied. Admin privileges are required.'); navigate('/', { replace: true });
        setState({ ready: true, user: null }); return;
      }
      dispatch(login({ user: resolvedUser, token }));
      setState({ ready: true, user: resolvedUser });
      if (resolvedUser.role === 'admin' && window.location.pathname === '/admin') navigate('/admin/social-orders', { replace: true });
    };
    void validateSession();
  }, [dispatch, fetchProfile, navigate]);

  return state;
}
