import { Link } from "react-router-dom";
import { User, Package, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppSelector } from "@/hooks/useRedux";
import { useOrders } from "@/hooks/useOrders";
import { useSignIn } from "@/hooks/useAuth";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { getProductTitle } from "@/lib/i18nHelpers";

const Profile = () => {
  const { t } = useTranslation();
  const { user, orders, isAuthenticated } = useAppSelector((state) => state.user);
  const { fetchOrders, loading: ordersLoading } = useOrders();
  const { signOut } = useSignIn();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders().catch((err) => {
        console.error("Failed to fetch orders:", err);
      });
    }
  }, [isAuthenticated, fetchOrders]);

  const handleLogout = () => {
    signOut();
    toast.success(t('common.success'));
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">{t('profile.pleaseLogin')}</h1>
            <p className="text-muted-foreground mb-8">{t('profile.needLogin')}</p>
            <Button asChild>
              <Link to="/login">{t('auth.login')}</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen ">
      <Navbar />
      
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">{t('profile.phone')}:</span> {user.phone}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">{t('profile.memberSince')}:</span> January 2024
                  </p>
                </div>
                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    {t('profile.editProfile')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('profile.logout')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Section */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t('profile.orderHistory')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t('profile.loadingOrders')}</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('profile.noOrders')}</p>
                    <Button asChild className="mt-4">
                      <Link to="/products">{t('profile.startShopping')}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 grid grid-cols-2 gap-3 justify-center items-center">
                    {orders.map((order) => (
                      <Card key={order._id} className="border-l-4  border-l-primary">
                        <CardContent className="p-4 ">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{t('order.orderNumber')} #{order._id.slice(-6)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {t(`order.status.${order.status}`) || order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              {(() => {
                                const orderItems: any[] = (order as any).items || (order as any).products || [];
                                return (
                                  <>
                                    <p className="text-sm font-medium mb-1">{t('cart.items')} ({orderItems.length})</p>
                                    <div className="space-y-1">
                                      {orderItems.map((item: any, index: number) => (
                                  <div key={index} className="flex items-center gap-2">
                                          {item.product?.mainImage?.secure_url && (
                                      <img
                                              src={item.product.mainImage.secure_url}
                                              alt={getProductTitle(item.product) || 'Product'}
                                        className="w-8 h-8 rounded object-cover"
                                        loading="lazy"
                                      />
                                    )}
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                              {(getProductTitle(item.product) || item.name || 'Item')} {item.variant ? `(${item.variant.color}, ${item.variant.size})` : ''} x{item.quantity}
                                      </p>
                                    </div>
                                    
                                  </div>
                                      ))}
                                      {orderItems.length > 2 && (
                                        <p className="text-sm text-muted-foreground">
                                          +{orderItems.length - 2} {t('profile.moreItems')}
                                        </p>
                                      )}
                                    </div>
                                  </>
                                );
                              })()}
                              
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold">${(order as any).totalAmount ? (order as any).totalAmount.toFixed(2) : (order as any).finalPrice?.toFixed(2)}</p>
                            
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;