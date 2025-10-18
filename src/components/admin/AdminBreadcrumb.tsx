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
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin" className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            Admin
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AdminBreadcrumb;


