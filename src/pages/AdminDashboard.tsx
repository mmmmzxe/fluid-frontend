import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminBreadcrumb from '@/components/admin/AdminBreadcrumb';
import { useUserProfile } from '@/hooks/useAuth';
import { login } from '@/store/slices/userSlice';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchProfile } = useUserProfile();

  // Helper function to map user data consistently
  const mapUserData = React.useCallback((userData: any) => ({
    _id: userData._id || userData.id || "",
    name: userData.name || "",
    email: userData.email || "",
    phone: userData.phone || "",
    role: userData.role || 'user',
  }), []);

  // Check authentication and role-based access
  React.useEffect(() => {
    const checkAuthAndRole = async () => {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');

      if (!token) {
        navigate('/login');
        return;
      }

      let currentUser = user;

      // If user is not in Redux store but we have data in localStorage, restore it
      if (!isAuthenticated && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          const mappedUser = mapUserData(parsedUser);
          dispatch(login({ user: mappedUser, token }));
          currentUser = mappedUser;
        } catch (error) {
          console.error('Error parsing user data:', error);
          toast.error('Invalid session data');
          navigate('/login');
          return;
        }
      }

      // Fetch fresh user profile data
      try {
        const profileData = await fetchProfile();
        if (profileData) {
          const mappedUser = mapUserData(profileData);
          dispatch(login({ user: mappedUser, token }));
          currentUser = mappedUser;
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Don't show error if we already have user data
        if (!currentUser) {
          toast.error('Failed to fetch user profile');
        }
      }

      // Check if user has admin role
      if (!currentUser?.role || (currentUser.role !== 'superAdmin' && currentUser.role !== 'admin')) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }

      // Redirect admins (not superAdmin) from /admin to /admin/orders by default
      if (currentUser.role === 'admin' && location.pathname === '/admin') {
        navigate('/admin/orders', { replace: true });
      }
    };

    checkAuthAndRole();
  }, [isAuthenticated, user, navigate, dispatch, fetchProfile, location.pathname, mapUserData]);

  if (!isAuthenticated || !user || !user.role) {
    return null;
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30">
      <SidebarProvider>
        <AdminSidebar userRole={user.role as "superAdmin" | "admin"} />
        <SidebarInset>
          <AdminHeader user={{ ...user, id: user._id, role: user.role as "superAdmin" | "admin" }} />
          <div className="flex flex-1 flex-col gap-4 p-3 md:p-6 pt-0 overflow-hidden min-w-0">
            <AdminBreadcrumb />
            <div className="flex-1 overflow-auto rounded-xl bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm p-3 md:p-6 min-w-0">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default AdminDashboard;
