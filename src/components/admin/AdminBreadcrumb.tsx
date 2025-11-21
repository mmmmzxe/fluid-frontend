import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight, Home } from 'lucide-react';

const AdminBreadcrumb: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [];

    // Always start with Admin Dashboard
    items.push({
      label: 'Admin Dashboard',
      href: '/admin',
      isLast: pathSegments.length === 1,
    });

    if (pathSegments.length > 1) {
      const module = pathSegments[1];
      const moduleLabels: Record<string, string> = {
        categories: 'Categories',
        products: 'Products',
        orders: 'Orders',
        users: 'Users',
        subcategories: 'SubCategories',
        support: 'Support',
        shipping: 'Shipping',
        profile: 'Profile',
        settings: 'Settings',
      };

      const moduleLabel = moduleLabels[module] || module;
      items.push({
        label: moduleLabel,
        href: `/admin/${module}`,
        isLast: pathSegments.length === 2,
      });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList className="bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-sm inline-flex">
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin" className="flex items-center gap-1.5 text-muted-foreground hover:text-purple-600 transition-colors">
            <Home className="h-3.5 w-3.5" />
            <span className="font-medium text-xs">Admin</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage className="font-semibold text-xs bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href} className="text-muted-foreground hover:text-purple-600 transition-colors text-xs font-medium">
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AdminBreadcrumb;


