import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';
import { orderApi, shippingApi, Shipping } from '@/services/adminApi';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/hooks/useRedux';
import { useCart } from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProduct';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProductTitle } from '@/lib/i18nHelpers';
import { fbPixel } from '@/lib/fbPixel';

const OrderPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((s) => s.user);
  const { checkoutWithoutLogin, cart, fetchCart } = useCart();
  const { fetchProductById } = useProduct();

  // Shared fields
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [paymentWay, setPaymentWay] = useState('cash');
  const [shippingOptions, setShippingOptions] = useState<Shipping[]>([]);
  const [shippingId, setShippingId] = useState<string>('');
  // Guest-only fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [loading, setLoading] = useState(false);

  // States for guest cart details
  const [detailedCart, setDetailedCart] = useState<any[]>([]);
  const [isGuestDetailsLoading, setIsGuestDetailsLoading] = useState(false);


  // Load base cart and shipping options
  useEffect(() => {
    fetchCart().catch(() => { });
    (async () => {
      try {
        const res = await shippingApi.getAll();
        const list = res.data || [];
        setShippingOptions(list);
        if (list.length > 0) setShippingId(list[0]._id);
      } catch (e: any) {
        // silent
      }
    })();
  }, [fetchCart]);

  // Fetch full product details for guest users
  useEffect(() => {
    const augmentGuestCart = async () => {
      if (isAuthenticated) {
        setDetailedCart(cart);
        return;
      }
      if (cart.length > 0) {
        const needsDetails = cart.some(item => typeof item.productId === 'string');
        if (needsDetails) {
          setIsGuestDetailsLoading(true);
          try {
            // Use Promise.allSettled to handle individual failures gracefully
            const results = await Promise.allSettled(
              cart.map(async (item: any) => {
                if (typeof item.productId === 'string') {
                  try {
                    const productDetails = await fetchProductById(item.productId);
                    return { ...item, productId: productDetails };
                  } catch (error: any) {
                    // If product not found (404), return null to filter it out
                    console.warn(`Product ${item.productId} not found, removing from cart`);
                    return null;
                  }
                }
                return item;
              })
            );

            // Filter out failed items and extract successful results
            const augmentedItems = results
              .map((result) => result.status === 'fulfilled' ? result.value : null)
              .filter((item) => item !== null);

            // Update guest cart in localStorage to remove invalid products
            const invalidProductIds = new Set<string>();
            results.forEach((result, index) => {
              if (result.status === 'rejected' || (result.status === 'fulfilled' && result.value === null)) {
                const item = cart[index];
                if (item && typeof item.productId === 'string') {
                  invalidProductIds.add(item.productId);
                } else if (item && item._id) {
                  invalidProductIds.add(item._id);
                }
              }
            });

            if (invalidProductIds.size > 0) {
              const rawCart = localStorage.getItem('guestCart');
              if (rawCart) {
                try {
                  let guestCart = JSON.parse(rawCart);
                  guestCart = guestCart.filter((item: any) => {
                    const itemId = typeof item.productId === 'string' ? item.productId : item.productId?._id;
                    return !invalidProductIds.has(itemId) && !invalidProductIds.has(item._id);
                  });
                  localStorage.setItem('guestCart', JSON.stringify(guestCart));
                  // Refresh cart from localStorage
                  await fetchCart();
                  
                  if (invalidProductIds.size > 0) {
                    toast.warning(t('cart.someProductsRemoved') || 'Some products are no longer available and have been removed from your cart');
                  }
                } catch (e) {
                  console.error('Error updating guest cart:', e);
                }
              }
            }

            setDetailedCart(augmentedItems);
          } catch (error) {
            console.error("Error fetching product details for guest order:", error);
            toast.error(t('order.loadError'));
          } finally {
            setIsGuestDetailsLoading(false);
          }
        } else {
          setDetailedCart(cart);
        }
      } else {
        setDetailedCart([]);
      }
    };
    augmentGuestCart();
  }, [cart, isAuthenticated, fetchProductById, fetchCart, t]);

  // Track InitiateCheckout event when cart is loaded
  useEffect(() => {
    if (detailedCart.length > 0 && !isGuestDetailsLoading) {
      const contents = detailedCart.map(item => ({
        id: item.productId?._id || item.productId,
        quantity: item.quantity || 1,
      }));
      
      const totalValue = detailedCart.reduce(
        (sum, it) => sum + ((it.productId?.finalPrice || 0) * (it.quantity || 1)),
        0
      );

      fbPixel.initiateCheckout({
        content_ids: contents.map(c => c.id),
        contents,
        num_items: detailedCart.length,
        value: totalValue,
        currency: 'EGP',
      });
    }
  }, [detailedCart, isGuestDetailsLoading]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!address.trim() || !phone.trim()) {
      return toast.error(t('order.requiredFields'));
    }
    if (!isAuthenticated && (!firstName.trim() || !lastName.trim() || !email.trim())) {
      return toast.error(t('order.guestRequiredFields'));
    }

    setLoading(true);
    try {
      let createOrderResponse;

      // Step 1: Create the order (for both guests and logged-in users)
      // Note: shippingId is always required by the API
      // Free shipping (itemsTotal >= 2000) is handled by the backend
      
      if (isAuthenticated) {
        const payload = { address, phone, note: note || '', paymentWay, shippingId };
        createOrderResponse = await orderApi.create(payload);
      } else {
        const payload = { firstName, lastName, address, phone, note: note || '', paymentWay, shippingId, email, discountPercent };
        createOrderResponse = await checkoutWithoutLogin(payload);
      }

      // Step 2: Handle based on payment method
      if (paymentWay === 'cash') {
        // Track Purchase event for Facebook Pixel
        const contents = detailedCart.map(item => ({
          id: item.productId?._id || item.productId,
          quantity: item.quantity || 1,
        }));
        
        fbPixel.purchase({
          content_ids: contents.map(c => c.id),
          contents,
          value: finalTotal,
          currency: 'EGP',
          num_items: detailedCart.length,
        });
        
        toast.success(isAuthenticated ? 'Order created successfully' : 'Order placed successfully');
        navigate('/');
        return;
      }

      if (paymentWay === 'card') {
        // Step 3: Extract Order ID from the response robustly
        let orderId;
        const responseData = createOrderResponse?.data || createOrderResponse;

        if (responseData?.order?.order?._id) {
          orderId = responseData.order.order._id;
        } else if (responseData?.order?._id) {
          orderId = responseData.order._id;
        } else if (responseData?._id) {
          orderId = responseData._id;
        }
        

        if (!orderId) {
          console.error("Failed to parse order ID from response:", createOrderResponse);
          throw new Error("Could not retrieve Order ID from the server response.");
        }

        // Step 4: Get the payment URL based on user authentication status
        let paymentResponse;
        if (isAuthenticated) {
          paymentResponse = await orderApi.getPaymobUrlForUser(orderId);
        } else {
          paymentResponse = await orderApi.getPaymobUrlForGuest(orderId);
        }

        // Step 5: Redirect to the payment URL
        // The URL is nested inside the 'data' property
        const paymentUrl = paymentResponse?.data?.url;

        if (paymentUrl) {
          // Track Purchase event for Facebook Pixel (before redirect)
          const contents = detailedCart.map(item => ({
            id: item.productId?._id || item.productId,
            quantity: item.quantity || 1,
          }));
          
          fbPixel.purchase({
            content_ids: contents.map(c => c.id),
            contents,
            value: finalTotal,
            currency: 'EGP',
            num_items: detailedCart.length,
          });
          
          toast.success(t('order.redirecting'));
          
          // Log the payment URL for debugging purposes
          console.log('Redirecting to payment URL:', paymentUrl);

          // Use window.location.href for reliable redirection
          // We do not interact with the payment iframe/page via JS to avoid Cross-Origin errors (as per "Blocked a frame..." solution).
          // This allows the Paymob widget/page to function naturally.
          window.location.href = paymentUrl;
        } else {
          console.error("Payment response did not contain a URL:", paymentResponse);
          throw new Error("Could not retrieve payment URL.");
        }
        return; // Stop further execution
      }

    } catch (err: any) {
      toast.error(err?.message || t('order.createError'));
    } finally {
      setLoading(false);
    }
  };

  const itemsTotal = detailedCart.reduce((sum, it) => sum + ((it.productId?.finalPrice || 0) * (it.quantity || 1)), 0);
  const baseShippingCost = shippingOptions.find(opt => opt._id === shippingId)?.price || 0;
  // Free shipping if order total is 2000 or more
  const selectedShippingCost = baseShippingCost;
  const finalTotal = itemsTotal + selectedShippingCost;


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">{t('order.checkout')}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Form */}
          <Card className="p-6 lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isAuthenticated && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('order.firstName')}</label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('order.lastName')}</label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">{t('auth.address')}</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('auth.phone')}</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('order.note')}</label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('order.paymentMethod')}</label>
                <select value={paymentWay} onChange={(e) => setPaymentWay(e.target.value)} className="w-full border rounded-md p-2 bg-background">
                  <option value="card">{t('order.card')}</option>
                  <option value="cash">{t('order.cash')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('order.shipping')}</label>
                <select
                  value={shippingId}
                  onChange={(e) => setShippingId(e.target.value)}
                  className="w-full border rounded-md p-2 bg-background"
                  required
                >
                  {shippingOptions.length === 0 && <option>{t('order.loadingOptions')}</option>}
                  {shippingOptions.map((opt) => (
                    <option key={opt._id} value={opt._id}>
                      {opt.government || opt._id} 
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading || isGuestDetailsLoading}>
                  {loading
                    ? t('order.processing')
                    : paymentWay === 'card'
                      ? t('order.proceedToPayment')
                      : t('order.createOrder')}
                </Button>
              </div>
            </form>
          </Card>

          {/* Cart Summary */}
          <Card className="p-6 lg:col-span-1 h-max sticky top-6">
            <h2 className="text-xl font-semibold mb-4">{t('order.orderSummary')}</h2>
            <div className="space-y-4 max-h-[50vh] overflow-auto pr-2">
              {isGuestDetailsLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="animate-spin h-6 w-6 text-primary" />
                </div>
              ) : (
                detailedCart.map((item: any) => (
                  <div key={item._id || `${item.productId}-${item.variantId}-${item.sizeId}`} className="flex gap-3">
                    <img
                      src={item.productId?.mainImage?.secure_url || '/placeholder.svg'}
                      alt={getProductTitle(item.productId) || 'Product'}
                      className="w-16 h-16 rounded object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{getProductTitle(item.productId) || t('common.loading')}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.variant?.color || 'color'} - {item.variant?.size || 'size'}
                      </div>
                      <div className="text-xs">{t('order.qty')}: {item.quantity || 1}</div>
                    </div>
                    <div className="text-sm font-semibold">L.E{(item.productId?.finalPrice || 0).toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('cart.subtotal')}</span>
                <span>L.E{itemsTotal.toFixed(2)}</span>
              </div>
           
                <div className="flex justify-between text-sm">
                  <span>{t('cart.shipping')}</span>
                  <span>L.E{selectedShippingCost.toFixed(2)}</span>
                </div>
              
              
              <div className="flex justify-between font-semibold text-lg">
                <span>{t('cart.total')}</span>
                <span>L.E{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderPage;

