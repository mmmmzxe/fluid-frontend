import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AdminBreadcrumb from '@/components/admin/AdminBreadcrumb';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const AdminDashboard = () => {
  const { ready, user } = useAdminAccess();

  if (!ready || !user || (user.role !== 'admin' && user.role !== 'superAdmin')) {
    return null;
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30">
      <SidebarProvider>
        <AdminSidebar userRole={user.role} />
        <SidebarInset>
          <AdminHeader user={{ ...user, id: user._id }} />
          <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden p-3 pt-0 md:p-6 md:pt-0">
            <AdminBreadcrumb />
            <section className="min-w-0 flex-1 overflow-auto rounded-xl border border-white/20 bg-white/30 p-3 shadow-sm backdrop-blur-sm md:p-6">
              <Outlet />
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default AdminDashboard;
