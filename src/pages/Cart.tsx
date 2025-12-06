import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppSelector } from "@/hooks/useRedux";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-toastify";
import { useProduct } from "@/hooks/useProduct";
import { useTranslation } from "react-i18next";
import { getProductTitle } from "@/lib/i18nHelpers";

const Cart = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const { cart, loading: cartLoadingHook, fetchCart, updateItemQuantity, removeItemFromCart, clearUserCart } = useCart();
  const { fetchProductById } = useProduct();

  const [detailedCart, setDetailedCart] = useState([]);
  const [isGuestDetailsLoading, setIsGuestDetailsLoading] = useState(false);

  // Effect to fetch the base cart from the hook (API for logged-in, localStorage for guest)
  useEffect(() => {
    fetchCart().catch((err) => {
      console.error("Failed to fetch cart:", err);
    });
  }, [fetchCart]);

  // Effect to fetch full product details for guest cart items
  useEffect(() => {
    const augmentGuestCart = async () => {
      if (isAuthenticated) {
        // For authenticated users, the cart from the hook is already detailed.
        setDetailedCart(cart);
        return;
      }

      // For guests, check if the cart has items and if they need details fetched.
      if (cart.length > 0) {
        // Determine if we need to fetch details (i.e., if any productId is a string).
        const needsDetails = cart.some(item => typeof item.productId === 'string');

        if (needsDetails) {
          setIsGuestDetailsLoading(true);
          try {
            const augmentedItems = await Promise.all(
              cart.map(async (item) => {
                // Check each item. If productId is a string, fetch details.
                if (typeof item.productId === 'string') {
                  const productDetails = await fetchProductById(item.productId);
                  return {
                    ...item, // Keep quantity, variant, etc.
                    productId: productDetails, // Replace ID with the full product object.
                  };
                }
                // If it's already an object, return the item as is.
                return item;
              })
            );
            setDetailedCart(augmentedItems);
          } catch (error) {
            console.error("Error fetching product details for guest cart:", error);
            toast.error(t('cart.loadError'));
          } finally {
            setIsGuestDetailsLoading(false);
          }
        } else {
          // Cart items are already detailed (e.g., from a previous fetch).
          setDetailedCart(cart);
        }
      } else {
        // Guest cart is empty.
        setDetailedCart([]);
      }
    };

    augmentGuestCart();
  }, [cart, isAuthenticated, fetchProductById]);


  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    try {
      if (!isAuthenticated) {
        // Handle guest cart logic directly with localStorage
        const rawCart = localStorage.getItem('guestCart');
        let guestCart = rawCart ? JSON.parse(rawCart) : [];

        if (newQuantity === 0) {
          // Remove the item if quantity is 0
          guestCart = guestCart.filter((item: any) => item._id !== itemId);
        } else {
          // Find and update the item quantity
          const itemIndex = guestCart.findIndex((item: any) => item._id === itemId);
          if (itemIndex > -1) {
            guestCart[itemIndex].quantity = newQuantity;
          }
        }

        localStorage.setItem('guestCart', JSON.stringify(guestCart));

        // Trigger a re-fetch from the hook to update the UI state
        await fetchCart();
      } else {
        // Handle authenticated user cart logic via the hook
        await updateItemQuantity(itemId, newQuantity);
      }

      if (newQuantity === 0) {
        toast.success(t('cart.removeSuccess'));
      } else {
        toast.success(t('cart.updateSuccess'));
      }
    } catch (err: any) {
      toast.error(err?.message || t('cart.updateError'));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItemFromCart(itemId);
      toast.success(t('cart.removeSuccess'));
    } catch (err: any) {
      toast.error(err?.message || t('cart.removeError'));
    }
  };

  const handleClearCart = async () => {
    try {
      if (!isAuthenticated) {
        // Handle guest cart by clearing localStorage
        localStorage.setItem('guestCart', JSON.stringify([]));
        await fetchCart(); // Re-fetch to update the UI state
      } else {
        // Handle authenticated user cart
        await clearUserCart();
      }
      toast.success(t('cart.clearSuccess'));
    } catch (err: any) {
      toast.error(err?.message || t('cart.clearError'));
    }
  };

  const finalCart = detailedCart;
  const loading = cartLoadingHook || isGuestDetailsLoading;

  const total = finalCart.reduce((sum, item) => {
    const price = item.productId?.finalPrice || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t('cart.loadingCart')}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (finalCart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">{t('cart.empty')}</h1>
            <p className="text-muted-foreground mb-8">{t('cart.emptyMessage')}</p>
            <Button asChild>
              <Link to="/products">{t('cart.continueShopping')}</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('cart.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {finalCart.map((item) => (
              <Card key={item._id} className="p-4">
                <div className="flex gap-4">

                  <Link to={`/product/${item.productId?._id}`}>
                    <img
                      src={item.productId?.mainImage?.secure_url || '/placeholder.svg'}
                      alt={getProductTitle(item.productId) || 'Product'}
                      className="w-20 h-20 object-cover rounded-lg"
                      loading="lazy"
                    />
                  </Link>

                  <div className="flex-1">
                    <Link to={`/product/${item.productId?._id}`}>
                      <h3 className="font-medium text-foreground hover:text-primary transition-colors">
                        {getProductTitle(item.productId) || 'Product'}
                      </h3>
                    </Link>

                    <p className="text-sm text-muted-foreground">
                      {item.variant?.color || 'N/A'} - {item.variant?.size || 'N/A'}
                    </p>
                    <p className="text-lg font-semibold text-primary">L.E{(item.productId?.finalPrice || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item._id, (item.quantity || 1) - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity || 1}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item._id, (item.quantity || 1) + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">{t('cart.orderSummary')}</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>{t('cart.subtotal')} ({finalCart.length} {t('cart.items')})</span>
                  <span>L.E{total.toFixed(2)}</span>
                </div>
              
               
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{t('cart.total')}</span>
                    <span>L.E{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link to="/order">{t('cart.proceedToCheckout')}</Link>
              </Button>
              <Button asChild variant="outline" className="w-full mt-2">
                <Link to="/products">{t('cart.continueShopping')}</Link>
              </Button>
              {finalCart.length > 0 && (
                <Button
                  variant="destructive"
                  className="w-full mt-2"
                  onClick={handleClearCart}
                >
                  {t('cart.clearCart')}
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;

