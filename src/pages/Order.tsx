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
import { normalizeImageUrl } from '@/lib/utils';

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
  const [depositPhoto, setDepositPhoto] = useState<File | null>(null);

  // States for guest cart details
  const [detailedCart, setDetailedCart] = useState<any[]>([]);
  const [isGuestDetailsLoading, setIsGuestDetailsLoading] = useState(false);


  // Load base cart, shipping options, and build detailed cart from fresh data
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // Fetch shipping options (parallel with cart fetch)
      const shippingPromise = shippingApi.getAll().then((res) => {
        if (cancelled) return;
        const list = res.data || [];
        setShippingOptions(list);
        if (list.length > 0) setShippingId(list[0]._id);
      }).catch(() => {});

      // Always fetch fresh cart first so we don't use stale Redux state
      let freshCart: any[] = [];
      try {
        const result = await fetchCart();
        if (cancelled) return;
        freshCart = Array.isArray(result) ? result : [];
      } catch {
        if (cancelled) return;
      }

      await shippingPromise;
      if (cancelled) return;

      // Now build detailedCart from the fresh data
      if (isAuthenticated) {
        setDetailedCart(freshCart);
        return;
      }

      // Guest: productIds may be strings that need details fetched
      if (freshCart.length === 0) {
        setDetailedCart([]);
        return;
      }

      const needsDetails = freshCart.some((item: any) => typeof item.productId === 'string');
      if (!needsDetails) {
        setDetailedCart(freshCart);
        return;
      }

      setIsGuestDetailsLoading(true);
      try {
        const results = await Promise.allSettled(
          freshCart.map(async (item: any) => {
            if (typeof item.productId === 'string') {
              try {
                const productDetails = await fetchProductById(item.productId);
                return { ...item, productId: productDetails };
              } catch {
                console.warn(`Product ${item.productId} not found, removing from cart`);
                return null;
              }
            }
            return item;
          })
        );

        if (cancelled) return;

        const augmentedItems = results
          .map((result) => result.status === 'fulfilled' ? result.value : null)
          .filter((item) => item !== null);

        // Remove invalid products from localStorage guest cart
        const invalidProductIds = new Set<string>();
        results.forEach((result, index) => {
          if (result.status === 'rejected' || (result.status === 'fulfilled' && result.value === null)) {
            const item = freshCart[index];
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
              await fetchCart();
              toast.warning(t('cart.someProductsRemoved') || 'Some products are no longer available and have been removed from your cart');
            } catch (e) {
              console.error('Error updating guest cart:', e);
            }
          }
        }

        if (!cancelled) setDetailedCart(augmentedItems);
      } catch (error) {
        console.error("Error fetching product details for guest order:", error);
        if (!cancelled) toast.error(t('order.loadError'));
      } finally {
        if (!cancelled) setIsGuestDetailsLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [fetchCart, isAuthenticated, fetchProductById, t]);

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

    if (!address.trim() || !phone.trim()) {
      return toast.error(t('order.requiredFields'));
    }
    if ((paymentWay === 'instapay' || paymentWay === 'vodafone_cash') && !depositPhoto) {
      return toast.error("Please upload the deposit receipt to proceed");
    }

    setLoading(true);
    try {
      let createOrderResponse;

      // Step 1: Upload the deposit receipt if needed
      let receiptData: any = null;
      if ((paymentWay === 'instapay' || paymentWay === 'vodafone_cash') && depositPhoto) {
        const formData = new FormData();
        formData.append('receipt', depositPhoto);
        try {
          const uploadRes = await orderApi.uploadReceipt(formData);
          receiptData = uploadRes.data?.receipt || uploadRes.receipt; // Adjust based on actual structure returned
        } catch (uploadError) {
          throw new Error("Failed to upload deposit receipt. Please try again.");
        }
      }

      // Step 2: Create the order (for both guests and logged-in users)
      // Note: shippingId is always required by the API
      // Free shipping (itemsTotal >= 2000) is handled by the backend
      
      if (isAuthenticated) {
        const payload = { address, phone, note: note || 'null', paymentWay, shippingId, depositReceipt: receiptData };
        createOrderResponse = await orderApi.create(payload);
      } else {
        const payload = { firstName, lastName, address, phone, note: note || 'null', paymentWay, shippingId, email, discountPercent, depositReceipt: receiptData };
        createOrderResponse = await checkoutWithoutLogin(payload);
      }

      // Step 3: Handle based on payment method
      if (paymentWay === 'cash' || paymentWay === 'instapay' || paymentWay === 'vodafone_cash') {
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
      console.error("Order submit error:", err);
      const errorMsg = err?.response?.data?.message || err?.response?.data?.response?.message || err?.message || t('order.createError');
      toast.error(errorMsg);
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
                <label className="block text-sm font-medium mb-2">{t('order.paymentMethod')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Cash Option */}
                  <label
                    htmlFor="pay-cash"
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentWay === 'cash'
                        ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                  >
                    <input id="pay-cash" type="radio" name="paymentWay" value="cash" checked={paymentWay === 'cash'} onChange={(e) => { setPaymentWay(e.target.value); setDepositPhoto(null); }} className="sr-only" />
                    <span className="text-2xl">💵</span>
                    <span className="text-xs font-semibold text-center">{t('order.cash') || 'Cash'}</span>
                  </label>

                  {/* InstaPay Option */}
                  <label
                    htmlFor="pay-instapay"
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentWay === 'instapay'
                        ? 'border-purple-500 bg-purple-50/60 shadow-sm'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <input id="pay-instapay" type="radio" name="paymentWay" value="instapay" checked={paymentWay === 'instapay'} onChange={(e) => { setPaymentWay(e.target.value); setDepositPhoto(null); }} className="sr-only" />
                    <img src="https://play-lh.googleusercontent.com/_ks0_XUbrZOkeiXkjaiZEK1S-j1skuQgF1E8S3ff702CoVyaiGnbfXPK74WjgxMk0Q4v2hlhu8WTHxp52Wq0" alt="InstaPay" className="h-7 w-7 object-contain rounded-md" />
                    <span className="text-xs font-semibold text-center">InstaPay</span>
                  </label>

                  {/* Vodafone Cash Option */}
                  <label
                    htmlFor="pay-vodafone"
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentWay === 'vodafone_cash'
                        ? 'border-red-500 bg-red-50/60 shadow-sm'
                        : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                    }`}
                  >
                    <input id="pay-vodafone" type="radio" name="paymentWay" value="vodafone_cash" checked={paymentWay === 'vodafone_cash'} onChange={(e) => { setPaymentWay(e.target.value); setDepositPhoto(null); }} className="sr-only" />
                    <img src="https://drashrafsoliman.com/wp-content/uploads/2022/06/vc.png" alt="Vodafone Cash" className="h-7 w-7 object-contain rounded-md" />
                    <span className="text-xs font-semibold text-center">Vodafone Cash</span>
                  </label>
                </div>
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

              {/* Cash: show call-back notice, no upload */}
              {paymentWay === 'cash' && (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3 shadow-sm">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold text-xs mt-0.5">📞</div>
                  <p className="leading-relaxed font-medium">Please note: We will call you to confirm your order and arrange a deposit for your order.</p>
                </div>
              )}

              {/* InstaPay: show account info + required upload */}
              {paymentWay === 'instapay' && (
                <>
                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-purple-950 text-sm flex items-start gap-3 shadow-sm">
                    <img src="https://play-lh.googleusercontent.com/_ks0_XUbrZOkeiXkjaiZEK1S-j1skuQgF1E8S3ff702CoVyaiGnbfXPK74WjgxMk0Q4v2hlhu8WTHxp52Wq0" alt="InstaPay" className="h-8 w-8 object-contain rounded-md shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-0.5">Transfer to InstaPay</p>
                      <p className="text-base font-bold text-purple-800 tracking-widest">01128560748</p>
                      <p className="text-xs text-purple-600 mt-1">After transferring, upload your receipt below.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Deposit Receipt (Required) *</label>
                    <div className="flex flex-col items-center justify-center w-full">
                      <label
                        htmlFor="deposit-upload"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer bg-purple-50/30 hover:bg-purple-50/60 transition-colors relative overflow-hidden"
                      >
                        {depositPhoto ? (
                          <div className="relative w-full h-full flex items-center justify-center p-2">
                            <img src={URL.createObjectURL(depositPhoto)} alt="Deposit Preview" className="max-h-full max-w-full object-contain rounded-md" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm backdrop-blur-sm">Click to change image</div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-10 h-10 mb-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="mb-1 text-sm text-gray-500 font-semibold">Click to upload deposit receipt</p>
                            <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
                          </div>
                        )}
                        <input id="deposit-upload" type="file" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setDepositPhoto(e.target.files[0]); }} required />
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Vodafone Cash: show account info + required upload */}
              {paymentWay === 'vodafone_cash' && (
                <>
                  <div className="p-4 rounded-xl bg-red-50/50 border border-red-100 text-red-950 text-sm flex items-start gap-3 shadow-sm">
                    <img src="https://drashrafsoliman.com/wp-content/uploads/2022/06/vc.png" alt="Vodafone Cash" className="h-8 w-8 object-contain rounded-md shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-0.5">Transfer to Vodafone Cash</p>
                      <p className="text-base font-bold text-red-700 tracking-widest">01286198016</p>
                      <p className="text-xs text-red-500 mt-1">After transferring, upload your receipt below.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Deposit Receipt (Required) *</label>
                    <div className="flex flex-col items-center justify-center w-full">
                      <label
                        htmlFor="deposit-upload"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-red-300 rounded-xl cursor-pointer bg-red-50/30 hover:bg-red-50/60 transition-colors relative overflow-hidden"
                      >
                        {depositPhoto ? (
                          <div className="relative w-full h-full flex items-center justify-center p-2">
                            <img src={URL.createObjectURL(depositPhoto)} alt="Deposit Preview" className="max-h-full max-w-full object-contain rounded-md" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm backdrop-blur-sm">Click to change image</div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-10 h-10 mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="mb-1 text-sm text-gray-500 font-semibold">Click to upload deposit receipt</p>
                            <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
                          </div>
                        )}
                        <input id="deposit-upload" type="file" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setDepositPhoto(e.target.files[0]); }} required />
                      </label>
                    </div>
                  </div>
                </>
              )}

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
                      src={normalizeImageUrl(item.productId?.mainImage?.secure_url)}
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

