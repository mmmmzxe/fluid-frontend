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

  // Dynamic date range - last 30 days
  const params = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      interval: 'day' as const,
    };
  }, []);

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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex gap-3">
          {role === 'superAdmin' && (
            <Button
              onClick={() => navigate('/admin/products')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30 transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/admin/orders')}
            className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 border-2 hover:border-purple-200 transition-all duration-300"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Orders
          </Button>
        </div>
      </div>

      {/* Stats Cards (populated from analytics endpoints) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <Package className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : '-'}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="inline h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+0%</span>
              {loading ? 'Loading...' : 'Data coming soon'}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="inline h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+0%</span>
              {error ? 'Error loading' : 'From selected period'}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : '-'}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="inline h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+0%</span>
              {loading ? 'Loading...' : 'Data coming soon'}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {loading ? '...' : `$${totalRevenue.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="inline h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+0%</span>
              {error ? 'Error loading' : 'From selected period'}
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {role === 'superAdmin' && (
            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 hover:border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <span className="group-hover:text-purple-600 transition-colors">
                    Product Management
                  </span>
                </CardTitle>
                <CardDescription>
                  Manage your product catalog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    variant="outline"
                    onClick={() => navigate('/admin/products')}
                  >
                    View Products
                  </Button>
                  <Button
                    className="w-full justify-start hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    variant="outline"
                    onClick={() => navigate('/admin/categories')}
                  >
                    Manage Categories
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 hover:border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <span className="group-hover:text-blue-600 transition-colors">
                  Order Management
                </span>
              </CardTitle>
              <CardDescription>
                Process and track orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  variant="outline"
                  onClick={() => navigate('/admin/orders')}
                >
                  View Orders
                </Button>
                <Button
                  className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  variant="outline"
                  onClick={() => navigate('/admin/shipping')}
                >
                  Shipping Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 hover:border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-green-500/30">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="group-hover:text-green-600 transition-colors">
                  Customer Support
                </span>
              </CardTitle>
              <CardDescription>
                Help your customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start hover:bg-green-50 hover:text-green-700 transition-colors"
                  variant="outline"
                  onClick={() => navigate('/admin/support')}
                >
                  Support Tickets
                </Button>
                <Button
                  className="w-full justify-start hover:bg-green-50 hover:text-green-700 transition-colors"
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
    </div>
  );
};

export default AdminOverview;
