import type { LucideIcon } from 'lucide-react';
import {
  FolderOpen, HeadphonesIcon, LayoutDashboard, Megaphone, MessageSquare,
  Package, Share2, ShoppingCart, Truck, Users,
} from 'lucide-react';
import type { AdminRole } from '@/lib/adminSession';

export interface AdminNavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: readonly AdminRole[];
}

export const ADMIN_NAVIGATION: readonly AdminNavigationItem[] = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, roles: ['superAdmin'] },
  { title: 'Categories', url: '/admin/categories', icon: FolderOpen, roles: ['superAdmin'] },
  { title: 'Products', url: '/admin/products', icon: Package, roles: ['superAdmin'] },
  { title: 'Orders', url: '/admin/orders', icon: ShoppingCart, roles: ['superAdmin'] },
  { title: 'Users', url: '/admin/users', icon: Users, roles: ['superAdmin'] },
  { title: 'SubCategories', url: '/admin/subcategories', icon: FolderOpen, roles: ['superAdmin'] },
  { title: 'Support', url: '/admin/support', icon: HeadphonesIcon, roles: ['superAdmin'] },
  { title: 'Shipping', url: '/admin/shipping', icon: Truck, roles: ['superAdmin'] },
  { title: 'Announcements', url: '/admin/announcements', icon: Megaphone, roles: ['superAdmin'] },
  { title: 'WhatsApp Settings', url: '/admin/whatsapp', icon: MessageSquare, roles: ['superAdmin'] },
  { title: 'Social Media Orders', url: '/admin/social-orders', icon: Share2, roles: ['superAdmin', 'admin'] },
];

export const getAdminNavigation = (role: AdminRole) =>
  ADMIN_NAVIGATION.filter((item) => item.roles.includes(role));

export const isAdminNavigationActive = (pathname: string, item: AdminNavigationItem) =>
  item.url === '/admin' ? pathname === item.url : pathname === item.url || pathname.startsWith(`${item.url}/`);
