import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyticsApi, OverTimePoint } from '@/services/analytics';
import { useAppSelector } from '@/hooks/useRedux';

const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);
  const role = user?.role || 'user';

  const [ordersSeries, setOrdersSeries] = useState<OverTimePoint[] | null>(null);
  const [salesSeries, setSalesSeries] = useState<OverTimePoint[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Example request window from the spec
  const params = useMemo(() => ({
    startDate: '2025-10-01',
    endDate: '2025-11-01',
    interval: 'month' as const,
  }), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Skip analytics fetch for admin role to avoid invalid token errors
      if (role === 'admin') {
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const [ordersRes, salesRes] = await Promise.all([
          analyticsApi.getOrdersOverTime(params),
          analyticsApi.getSalesOverTime(params),
        ]);
        if (!mounted) return;
        setOrdersSeries(ordersRes?.data || []);
        setSalesSeries(salesRes?.data || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load analytics');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [params, role]);

  const totalOrders = useMemo(() => {
    if (!ordersSeries) return 0;
    return ordersSeries.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
  }, [ordersSeries]);

  const totalRevenue = useMemo(() => {
    if (!salesSeries) return 0;
    return salesSeries.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
  }, [salesSeries]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex gap-2">
          {role === 'superAdmin' && (
            <Button onClick={() => navigate('/admin/products')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/admin/orders')}>
            <Eye className="mr-2 h-4 w-4" />
            View Orders
          </Button>
        </div>
      </div>

      {/* Stats Cards (populated from analytics endpoints) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Data coming soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {error ? 'Error loading' : 'From selected period'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Data coming soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : `$${totalRevenue.toLocaleString()}`}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {error ? 'Error loading' : 'From selected period'}
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {role === 'superAdmin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Management
              </CardTitle>
              <CardDescription>
                Manage your product catalog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate('/admin/products')}
                >
                  View Products
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate('/admin/categories')}
                >
                  Manage Categories
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Management
            </CardTitle>
            <CardDescription>
              Process and track orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/admin/orders')}
              >
                View Orders
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/admin/shipping')}
              >
                Shipping Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Support
            </CardTitle>
            <CardDescription>
              Help your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/admin/support')}
              >
                Support Tickets
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;


