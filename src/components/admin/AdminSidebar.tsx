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
  SidebarRail,
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
  Megaphone,
  Share2,
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
      {
        title: 'Announcements',
        url: '/admin/announcements',
        icon: Megaphone,
        roles: ['superAdmin', 'admin'],
      },
      {
        title: 'Social Media Orders',
        url: '/admin/social-orders',
        icon: Share2,
        roles: ['superAdmin', 'admin'],
      },
    ];

    return allItems.filter((item) => item.roles.includes(userRole));
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar variant="inset" className="border-r-0 bg-transparent">
      <SidebarHeader className="border-b border-white/10 bg-white/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold text-base bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Extrachic
            </span>
            <span className="truncate text-xs text-muted-foreground font-medium">
              {userRole === 'superAdmin' ? 'Super Administrator' : 'Administrator'}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white/40 backdrop-blur-md">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url || location.pathname.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`
                        transition-all duration-200 ease-in-out rounded-lg h-10
                        ${isActive
                          ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-700 font-medium shadow-sm border border-purple-100'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
                        }
                      `}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : 'text-muted-foreground/70'}`} />
                        <span>{item.title}</span>
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-white/40 backdrop-blur-md border-t border-white/10 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-12 rounded-xl border border-transparent hover:bg-white/60 hover:border-white/50 transition-all duration-200"
            >
              <Link to="/admin/profile" className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">Profile</span>
                  <span className="text-xs text-muted-foreground">Account Settings</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="mt-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-10 rounded-lg"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AdminSidebar;


