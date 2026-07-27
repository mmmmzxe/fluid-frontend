import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
// [EDIT] Import new icons for payment method
import { Package, Truck, CheckCircle, XCircle, User, MapPin, CreditCard, Wallet, Printer, Plus } from 'lucide-react';
import { Order, productApi, Product, orderApi } from '@/services/adminApi';
import { printInvoice } from '@/utils/printInvoice';
import { toast } from 'sonner';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (order: Order, status: string) => void;
  onCancel: (order: Order) => void;
  onUpdate?: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onClose,
  onStatusUpdate,
  onCancel,
  onUpdate,
}) => {
  const [productDetails, setProductDetails] = useState<Record<string, Product>>({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [deposit, setDeposit] = useState<number>(order.deposit || 0);
  const [depositInput, setDepositInput] = useState<string>(order.deposit?.toString() || '0');
  const [savingDeposit, setSavingDeposit] = useState(false);

  useEffect(() => {
    setDeposit(order.deposit || 0);
    setDepositInput(order.deposit?.toString() || '0');
  }, [order.deposit]);

  // Fetch ALL products once and create a mapping by ID
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoadingProducts(true);
        
        // Fetch all products from the API
        const response = await productApi.getAllNoCache();
        const allProducts = response.data || [];
        
        // Create a mapping of productId -> Product
        const productsMap: Record<string, Product> = {};
        allProducts.forEach((product: Product) => {
          productsMap[product._id] = product;
        });
        
        console.log('Fetched all products:', allProducts.length);
        console.log('Products map:', productsMap);
        setProductDetails(productsMap);
      } catch (error) {
        console.error('Error fetching all products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchAllProducts();
  }, []); // Only fetch once when component mounts

  // Helper function to get color and size from product variants
  const getVariantInfo = (productId: string, variantId?: string, sizeId?: string) => {
    const product = productDetails[productId];
    if (!product || !product.variants) {
      return { color: null, size: null };
    }

    const variant = product.variants.find(v => v._id === variantId);
    if (!variant) {
      return { color: null, size: null };
    }

    const sizeInfo = variant.size?.find(s => s._id === sizeId);
    
    return {
      color: variant.color || null,
      size: sizeInfo?.size || null,
    };
  };

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

  // Parse shipping info
  const shippingPrice = typeof (order as any).shippingId === 'object' && (order as any).shippingId !== null
    ? ((order as any).shippingId as any).price
    : (Number(order.finalPrice ?? 0) - Number(order.subTotal ?? 0));

  const shippingGov = typeof (order as any).shippingId === 'object' && (order as any).shippingId !== null
    ? ((order as any).shippingId as any).government
    : '';

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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-sm">
          <Button variant="outline" onClick={() => printInvoice(order, deposit)}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Deposit:</span>
              <Input
                type="number"
                placeholder="Deposit amount"
                value={depositInput}
                onChange={(e) => setDepositInput(e.target.value)}
                className="w-32 bg-white/50 border-white/20 focus:bg-white"
                min="0"
              />
            </div>
            <Button
              variant="secondary"
              disabled={savingDeposit}
              onClick={async () => {
                const amount = parseFloat(depositInput);
                if (isNaN(amount) || amount < 0) {
                  toast.error('Please enter a valid deposit amount');
                  return;
                }
                try {
                  setSavingDeposit(true);
                  await orderApi.updateDeposit(order._id, amount);
                  setDeposit(amount);
                  toast.success('Deposit updated successfully');
                  if (onUpdate) {
                    onUpdate();
                  }
                } catch (error) {
                  console.error('Failed to update deposit:', error);
                } finally {
                  setSavingDeposit(false);
                }
              }}
            >
              {savingDeposit ? 'Saving...' : 'Save Deposit'}
            </Button>
            {deposit > 0 && (
              <Button
                variant="ghost"
                size="sm"
                disabled={savingDeposit}
                onClick={async () => {
                  try {
                    setSavingDeposit(true);
                    await orderApi.updateDeposit(order._id, 0);
                    setDeposit(0);
                    setDepositInput('0');
                    toast.success('Deposit cleared');
                    if (onUpdate) {
                      onUpdate();
                    }
                  } catch (error) {
                    console.error('Failed to clear deposit:', error);
                  } finally {
                    setSavingDeposit(false);
                  }
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

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
                {shippingGov && (
                  <div className="mt-1 text-muted-foreground">
                    <span className="font-medium text-gray-700">Government:</span> {shippingGov}
                  </div>
                )}
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
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
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
              </div>

              {order.depositReceipt?.secure_url && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="font-medium mb-3 flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Deposit Receipt
                  </div>
                  <div className="relative group rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center p-2">
                    <img 
                      src={order.depositReceipt.secure_url} 
                      alt="Deposit Receipt" 
                      className="max-h-64 object-contain rounded-md shadow-sm"
                      onClick={() => window.open(order.depositReceipt?.secure_url, '_blank')}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                </div>
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
                  const variantInfo = getVariantInfo(item.productId, item.variantId, item.sizeId);
                  
                  console.log(`Order item ${index}:`, {
                    productId: item.productId,
                    variantId: item.variantId,
                    sizeId: item.sizeId,
                    variantInfo,
                    hasProduct: !!productDetails[item.productId],
                  });
                  
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{title}</h4>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="text-sm">Quantity: {qty}</span>
                          <span className="text-sm">Unit: L.E{unit.toFixed(2)}</span>
                          
                          {/* Debug Info */}
                          {loadingProducts && (
                            <span className="text-xs text-gray-500">Loading...</span>
                          )}
                          
                          {/* Color Display */}
                          {variantInfo.color && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Color:</span>
                              <div 
                                className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                                style={{ backgroundColor: variantInfo.color }}
                                title={variantInfo.color}
                              />
                            </div>
                          )}
                          
                          {/* Size Display */}
                          {variantInfo.size && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Size:</span>
                              <Badge variant="outline" className="font-normal">
                                {variantInfo.size}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">L.E{(unit * qty).toFixed(2)}</div>
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
                  <span>L.E{Number(order.subTotal ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>L.E{Number(shippingPrice ?? 0).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>L.E{Number(order.finalPrice ?? 0).toFixed(2)}</span>
                </div>
                {deposit > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Deposit Paid:</span>
                      <span>- L.E{deposit.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg text-primary">
                      <span>Remaining Balance:</span>
                      <span>L.E{(Number(order.finalPrice ?? 0) - deposit).toFixed(2)}</span>
                    </div>
                  </>
                )}
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

