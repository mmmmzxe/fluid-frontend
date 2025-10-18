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

  // Check authentication and role-based access
  React.useEffect(() => {
    const checkAuthAndRole = async () => {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // If user is not in Redux store but we have data in localStorage, restore it
      if (!isAuthenticated && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          const mappedUser = {
            _id: parsedUser._id || parsedUser.id || "",
            name: parsedUser.name || "",
            email: parsedUser.email || "",
            phone: parsedUser.phone || "",
            role: parsedUser.role || 'user',
          };
          dispatch(login({ user: mappedUser, token }));
        } catch (error) {
          console.error('Error parsing user data:', error);
          navigate('/login');
          return;
        }
      }

      // Fetch fresh user profile data
      try {
        const profileData = await fetchProfile();
        if (profileData) {
          const mappedUser = {
            _id: profileData._id || profileData.id || "",
            name: profileData.name || "",
            email: profileData.email || "",
            phone: profileData.phone || "",
            role: profileData.role || 'user',
          };
          dispatch(login({ user: mappedUser, token }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to fetch user profile');
      }

      // Check if user has admin role
      const currentUser = user || (userData ? JSON.parse(userData) : null);
      if (!currentUser?.role || (currentUser.role !== 'superAdmin' && currentUser.role !== 'admin')) {
        navigate('/');
        return;
      }

      // Redirect admins (not superAdmin) from /admin to /admin/orders by default
      if (currentUser.role === 'admin' && location.pathname === '/admin') {
        navigate('/admin/orders', { replace: true });
      }
    };

    checkAuthAndRole();
  }, [isAuthenticated, user, navigate, dispatch, fetchProfile]);

  if (!isAuthenticated || !user || !user.role) {
    return null;
  }

  return (
    <SidebarProvider>
      <AdminSidebar userRole={user.role as "superAdmin" | "admin"} />
      <SidebarInset>
        <AdminHeader user={{ ...user, id: user._id, role: user.role as "superAdmin" | "admin" }} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AdminBreadcrumb />
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminDashboard;
