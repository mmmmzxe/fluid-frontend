import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderOpen,
  HeadphonesIcon,
  Truck,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/hooks/useRedux';
import { logout } from '@/store/slices/userSlice';
import { useNavigate } from 'react-router-dom';

interface AdminSidebarProps {
  userRole: 'superAdmin' | 'admin';
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ userRole }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  // Define menu items based on role
  const getMenuItems = () => {
    const allItems = [
      {
        title: 'Dashboard',
        url: '/admin',
        icon: LayoutDashboard,
        roles: ['superAdmin'],
      },
      {
        title: 'Categories',
        url: '/admin/categories',
        icon: FolderOpen,
        roles: ['superAdmin'],
      },
      {
        title: 'Products',
        url: '/admin/products',
        icon: Package,
        roles: ['superAdmin'],
      },
      {
        title: 'Orders',
        url: '/admin/orders',
        icon: ShoppingCart,
        roles: ['superAdmin', 'admin'],
      },
      {
        title: 'Users',
        url: '/admin/users',
        icon: Users,
        roles: ['superAdmin'],
      },
      {
        title: 'SubCategories',
        url: '/admin/subcategories',
        icon: FolderOpen,
        roles: ['superAdmin'],
      },
      {
        title: 'Support',
        url: '/admin/support',
        icon: HeadphonesIcon,
        roles: ['superAdmin', 'admin'],
      },
      {
        title: 'Shipping',
        url: '/admin/shipping',
        icon: Truck,
        roles: ['superAdmin'],
      },
    ];

    return allItems.filter((item) => item.roles.includes(userRole));
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Admin Dashboard</span>
            <span className="truncate text-xs text-muted-foreground">
              {userRole === 'superAdmin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/profile">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;


