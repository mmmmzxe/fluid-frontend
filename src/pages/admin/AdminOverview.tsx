import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EnhancedStatsCard from '@/components/admin/EnhancedStatsCard';
import GradientButton from '@/components/admin/GradientButton';
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
    <div className="space-y-8">
      {/* Header with Gradient */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex gap-2">
          {role === 'superAdmin' && (
            <GradientButton gradient="purple" onClick={() => navigate('/admin/products')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </GradientButton>
          )}
          <Button variant="outline" onClick={() => navigate('/admin/orders')} className="hover:border-purple-500">
            <Eye className="mr-2 h-4 w-4" />
            View Orders
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedStatsCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          gradient="blue"
          loading={loading}
          trend={{
            value: 12.5,
            isPositive: true,
          }}
          subtitle="from last month"
        />
        <EnhancedStatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          gradient="green"
          loading={loading}
          trend={{
            value: 8.2,
            isPositive: true,
          }}
          subtitle="from last month"
        />
        <EnhancedStatsCard
          title="Total Products"
          value={loading ? '...' : '-'}
          icon={Package}
          gradient="purple"
          loading={loading}
          subtitle="Data coming soon"
        />
        <EnhancedStatsCard
          title="Total Users"
          value={loading ? '...' : '-'}
          icon={Users}
          gradient="orange"
          loading={loading}
          subtitle="Data coming soon"
        />
      </div>


      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Quick Actions
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {role === 'superAdmin' && (
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  Product Management
                </CardTitle>
                <CardDescription>
                  Manage your product catalog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start hover:bg-purple-50 hover:text-purple-600 hover:border-purple-500"
                    variant="outline"
                    onClick={() => navigate('/admin/products')}
                  >
                    View Products
                  </Button>
                  <Button
                    className="w-full justify-start hover:bg-purple-50 hover:text-purple-600 hover:border-purple-500"
                    variant="outline"
                    onClick={() => navigate('/admin/categories')}
                  >
                    Manage Categories
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                Order Management
              </CardTitle>
              <CardDescription>
                Process and track orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 hover:border-blue-500"
                  variant="outline"
                  onClick={() => navigate('/admin/orders')}
                >
                  View All Orders
                </Button>
                <Button
                  className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 hover:border-blue-500"
                  variant="outline"
                  onClick={() => navigate('/admin/shipping')}
                >
                  Shipping Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-5 w-5 text-white" />
                </div>
                User Management
              </CardTitle>
              <CardDescription>
                Manage users and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start hover:bg-green-50 hover:text-green-600 hover:border-green-500"
                  variant="outline"
                  onClick={() => navigate('/admin/users')}
                >
                  View All Users
                </Button>
                <Button
                  className="w-full justify-start hover:bg-green-50 hover:text-green-600 hover:border-green-500"
                  variant="outline"
                  onClick={() => navigate('/admin/support')}
                >
                  Support Tickets
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
