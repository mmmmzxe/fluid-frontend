import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// [EDIT] Import new icons for payment method
import { Package, Truck, CheckCircle, XCircle, User, MapPin, CreditCard, Wallet } from 'lucide-react';
import { Order } from '@/services/adminApi';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (order: Order, status: string) => void;
  onCancel: (order: Order) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onClose,
  onStatusUpdate,
  onCancel,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'placed': return 'bg-blue-100 text-blue-800';
      case 'on_way': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Package className="h-4 w-4" />;
      case 'placed': return <Package className="h-4 w-4" />;
      case 'on_way': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusUpdate(order, newStatus);
  };

  const handleCancel = () => {
    onCancel(order);
  };

  const customerName = order.createdBy?.name || `${order.firstName || ''} ${order.lastName || ''}`.trim();
  const customerEmail = order.createdBy?.email || order.email || '';
  const customerPhone = order.phone || order.createdBy?.phone || '';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <Badge className={getStatusColor(order.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
              </span>
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Order ID: {order._id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {customerName || 'Guest'}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {customerEmail}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {customerPhone}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>{order.address || '-'}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      {order.paymentWay === 'card' ? <CreditCard className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
      Payment Information
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-2 text-sm">
    <div>
      <span className="font-medium">Method:</span>
      <span className="ml-2 capitalize bg-gray-100 text-gray-800 px-2 py-1 rounded-md">
        {order.paymentWay}
      </span>
    </div>

    {order.paidAt ? (
      <div>
        <span className="font-medium">Paid At:</span>
        <span className="ml-2 text-green-700 font-semibold">
          {new Date(order.paidAt).toLocaleString()}
        </span>
      </div>
    ) : (
      <div className="text-red-500 font-medium">Not Paid Yet</div>
    )}
  </CardContent>
</Card>


          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.products?.map((item: any, index: number) => {
                  const unit = Number(item.unitPrice ?? item.finalPrice ?? 0);
                  const qty = Number(item.quantity ?? 1);
                  const title = item.name || item.productId || 'Product';
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{title}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm">Quantity: {qty}</span>
                          <span className="text-sm">Unit: ${unit.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${(unit * qty).toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${Number(order.subTotal ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>${(Number(order.finalPrice ?? 0) - Number(order.subTotal ?? 0)).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>${Number(order.finalPrice ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Update Status:</label>
                <Select value={order.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="placed">Placed</SelectItem>
                    <SelectItem value="on_way">On Way</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  className="w-full"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetails;

