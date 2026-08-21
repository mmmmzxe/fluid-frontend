import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { HelmetProvider } from "react-helmet-async";
import { store } from "@/store/store";
import { AppInitializer } from "@/components/AppInitializer";
import { useEffect } from "react";
import { fbPixel } from "@/lib/fbPixel";
import { pageview } from "@/lib/gtag";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOverview from "./pages/admin/AdminOverview";
import CategoryManagement from "./pages/admin/CategoryManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import UserManagement from "./pages/admin/UserManagement";
import SubCategoryManagement from "./pages/admin/SubCategoryManagement";
import SupportManagement from "./pages/admin/SupportManagement";
import ShippingManagement from "./pages/admin/ShippingManagement";
import AnnouncementManagement from "./pages/admin/AnnouncementManagement";
import AdminProfile from "./pages/admin/AdminProfile";
import "react-toastify/dist/ReactToastify.css";
import ContactUs from "./pages/ContactUs";
import OrderPage from "./pages/Order";
import { SearchResults } from "./pages/SearchResults";
import FAQ from "./pages/FAQ";
import ShippingReturns from "./pages/ShippingReturns";
import About from "./pages/About";
import Terms from "./pages/Terms";
import ProductCare from "./pages/ProductCare";
import Sitemap from "./pages/Sitemap";
import SocialOrdersPage from "./pages/admin/SocialOrdersPage";
import SocialOrderDetail from "./pages/admin/SocialOrderDetail";

const queryClient = new QueryClient();

// PageView tracker component
function PageViewTracker() {
  const location = useLocation();
  
  useEffect(() => {
    // Track PageView on every route change
    fbPixel.pageView();
    // Send Google Analytics page_view for SPA route changes
    pageview(location.pathname);
  }, [location.pathname]);
  
  return null;
}

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <AppInitializer>
            <Toaster />

            <BrowserRouter>
              <PageViewTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/shipping-returns" element={<ShippingReturns />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/product-care" element={<ProductCare />} />
              <Route path="/sitemap" element={<Sitemap />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />}>
                <Route index element={<AdminOverview />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="subcategories" element={<SubCategoryManagement />} />
                <Route path="support" element={<SupportManagement />} />
                <Route path="shipping" element={<ShippingManagement />} />
                <Route path="announcements" element={<AnnouncementManagement />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="social-orders" element={<SocialOrdersPage />} />
                <Route path="social-orders/:id" element={<SocialOrderDetail />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </BrowserRouter>
        </AppInitializer>
      </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
