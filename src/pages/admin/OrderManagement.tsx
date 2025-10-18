import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/admin/DataTable';
import OrderDetails from '@/components/admin/OrderDetails';
import { orderApi, Order } from '@/services/adminApi';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAll();
      // Assuming the API response is the array directly
      setOrders(response.data); 
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (order: Order, newStatus: string) => {
    try {
      await orderApi.updateStatus(order._id, newStatus);
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await orderApi.cancel(order._id);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to cancel order');
      console.error('Error cancelling order:', error);
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'placed':
        return 'bg-blue-100 text-blue-800';
      case 'on_way':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Package className="h-4 w-4" />;
      case 'placed':
        return <Package className="h-4 w-4" />;
      case 'on_way':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const filteredOrders = (orders || []).filter(order => {
    const customerName = order.createdBy?.name || `${order.firstName || ''} ${order.lastName || ''}`.trim();
    const customerEmail = order.createdBy?.email || order.email || '';

    const matchesSearch = 
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Order>[] = [
    {
      key: '_id',
      title: 'Order ID',
      render: (value) => (
        <div className="font-mono text-sm">
          {value.slice(-8).toUpperCase()}
        </div>
      ),
    },
    {
      key: 'createdBy' as any, // Use a key that exists, we will use the `row` object
      title: 'Customer',
      render: (_, row) => {
        const name = row.createdBy?.name || `${row.firstName || ''} ${row.lastName || ''}`.trim();
        const email = row.createdBy?.email || row.email || '';
        return (
          <div>
            <div className="font-medium">{name || 'Guest'}</div>
            <div className="text-sm text-muted-foreground">{email}</div>
          </div>
        );
      },
    },
    {
      key: 'products' as any,
      title: 'Items',
      render: (value) => (
        <Badge variant="secondary">
          {(value?.length || 0)} item{(value?.length || 0) !== 1 ? 's' : ''}
        </Badge>
      ),
    },
    {
      key: 'finalPrice' as any,
      title: 'Total',
      render: (value) => (
        <div className="font-medium">${Number(value || 0).toFixed(2)}</div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge className={getStatusColor(value)}>
          <span className="flex items-center gap-1">
            {getStatusIcon(value)}
            {value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
          </span>
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Date',
      render: (value) => new Date(value).toLocaleDateString(),
      sortable: true,
    },
  ];

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const statusFilters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'placed', label: 'Placed' },
        { value: 'on_way', label: 'On Way' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
      onFilter: setStatusFilter,
    },
  ];

  const actions = [
    {
      label: 'Mark as Placed',
      onClick: (order: Order) => handleStatusUpdate(order, 'placed'),
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: 'Mark as On Way',
      onClick: (order: Order) => handleStatusUpdate(order, 'on_way'),
      icon: <Truck className="h-4 w-4" />,
    },
    {
      label: 'Mark as Delivered',
      onClick: (order: Order) => handleStatusUpdate(order, 'delivered'),
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      label: 'Cancel Order',
      onClick: handleCancelOrder,
      icon: <XCircle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">
            Manage customer orders and track their status
          </p>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(order => order.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Way Orders</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(order => order.status === 'on_way').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${orders.reduce((sum, order) => sum + Number(order.finalPrice || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            A list of all customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedOrders}
            columns={columns}
            loading={loading}
            searchable
            searchPlaceholder="Search by ID, name, or email..."
            onSearch={setSearchQuery}
            onView={handleView}
            actions={actions}
            pagination={{
              page,
              pageSize,
              total: filteredOrders.length,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
            filters={statusFilters}
          />
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => {
            setShowDetails(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={handleStatusUpdate}
          onCancel={handleCancelOrder}
        />
      )}
    </div>
  );
};

export default OrderManagement;
