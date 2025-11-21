import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Package, Truck, CheckCircle, XCircle, ShoppingCart, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/admin/DataTable';
import OrderDetails from '@/components/admin/OrderDetails';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EnhancedStatsCard from '@/components/admin/EnhancedStatsCard';
import EnhancedBadge from '@/components/admin/EnhancedBadge';
import { orderApi, Order } from '@/services/adminApi';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { getCustomerName, getCustomerEmail } from '@/utils/adminHelpers';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { dialogState, confirm, closeDialog } = useConfirmDialog();

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

  const handleCancelOrder = (order: Order) => {
    confirm(
      'Cancel Order',
      `Are you sure you want to cancel order ${order._id.slice(-8).toUpperCase()}? This action cannot be undone.`,
      async () => {
        try {
          await orderApi.cancel(order._id);
          toast.success('Order cancelled successfully');
          fetchOrders();
        } catch (error) {
          toast.error('Failed to cancel order');
          console.error('Error cancelling order:', error);
        }
      },
      'destructive'
    );
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'purple' => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'placed':
        return 'info';
      case 'on_way':
        return 'purple';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'info';
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
    const customerName = getCustomerName(order);
    const customerEmail = getCustomerEmail(order);

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
      key: 'createdBy' as any,
      title: 'Customer',
      render: (_, row) => {
        const name = getCustomerName(row);
        const email = getCustomerEmail(row);
        return (
          <div>
            <div className="font-medium">{name}</div>
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
        <EnhancedBadge variant={getStatusVariant(value)} glow>
          <span className="flex items-center gap-1">
            {getStatusIcon(value)}
            {value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
          </span>
        </EnhancedBadge>
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
    <div className="space-y-8">
      {/* Header with Gradient */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Order Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage customer orders and track their status
          </p>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedStatsCard
          title="Total Orders"
          value={orders.length}
          icon={ShoppingCart}
          gradient="blue"
          loading={loading}
        />
        <EnhancedStatsCard
          title="Pending Orders"
          value={orders.filter(order => order.status === 'pending').length}
          icon={Package}
          gradient="orange"
          loading={loading}
        />
        <EnhancedStatsCard
          title="On Way Orders"
          value={orders.filter(order => order.status === 'on_way').length}
          icon={Truck}
          gradient="cyan"
          loading={loading}
        />
        <EnhancedStatsCard
          title="Total Revenue"
          value={`$${orders.reduce((sum, order) => sum + Number(order.finalPrice || 0), 0).toLocaleString()}`}
          icon={DollarSign}
          gradient="green"
          loading={loading}
        />
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={dialogState.open}
        onOpenChange={closeDialog}
        title={dialogState.title}
        description={dialogState.description}
        onConfirm={dialogState.onConfirm}
        variant={dialogState.variant}
        confirmText="Confirm"
      />
    </div>
  );
};

export default OrderManagement;
