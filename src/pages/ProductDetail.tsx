import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Heart, ShoppingBag, Minus, Plus, Truck, RotateCcw, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard, transformApiProduct } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProduct, ApiProductDetail } from "@/hooks/useProduct";
import { useCart } from "@/hooks/useCart";
import { useAppSelector } from "@/hooks/useRedux";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { getProductTitle, getProductDescription } from "@/lib/i18nHelpers";



export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { fetchProductById, loading, error } = useProduct();
  const { addItemToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAppSelector((state) => state.user);

  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const allImages = (product?.subImages && product.subImages.length > 0)
    ? [
      { secure_url: product.mainImage?.secure_url || '/placeholder.svg' },
      ...product.subImages,
    ]
    : [
      { secure_url: product?.mainImage?.secure_url || '/placeholder.svg' },
    ];

  useEffect(() => {
    if (id) {
      fetchProductById(id)
        .then((productData) => {
          setProduct(productData);
          if (productData?.variants && productData.variants.length > 0) {
            setSelectedColor(productData.variants[0].color);
          }
          const initialMain = productData?.mainImage?.secure_url || "/placeholder.svg";
          setActiveImageUrl(initialMain);
        })
        .catch((err) => {
          console.error("Failed to fetch product:", err);
        });
    }
  }, [id, fetchProductById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('productDetail.loadingProduct')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">{t('productDetail.productNotFound')}</h1>
          <p className="text-muted-foreground mb-8">
            {error || t('productDetail.productNotFoundMessage')}
          </p>
          <Button asChild>
            <Link to="/products">{t('productDetail.browseAllProducts')}</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Get available colors from variants
  const availableColors = product.variants?.map(v => v.color) || [];

  // Get available sizes from selected color variant
  const selectedVariant = product.variants?.find(v => v.color === selectedColor);
  const availableSizes = selectedVariant?.size?.map(s => {
    // Handle both old and new structure
    if (s.size) return s.size;
    // For new structure, find the first string value that's not 'stock' or '_id'
    const keys = Object.keys(s).filter(key => key !== 'stock' && key !== '_id');
    return keys.length > 0 ? String(s[keys[0]]) : 'M';
  }).filter(Boolean).map(String);

  const isOnSale = product.discount && product.discount > 0;
  const discountPercentage = isOnSale ? product.discount : 0;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error(t('productDetail.selectSize'));
      return;
    }

    try {
      const variantId = selectedVariant?._id || product._id;
      const sizeId = selectedVariant?.size?.find(s => {
        // Handle both old and new structure
        if (s.size) return s.size === selectedSize;
        const keys = Object.keys(s).filter(key => key !== 'stock' && key !== '_id');
        return keys.length > 0 && s[keys[0]] === selectedSize;
      })?._id || product._id;

      const cartItem = {
        productId: product._id,
        variantId,
        sizeId,
        quantity,
        variant: {
          size: selectedSize,
          color: selectedColor
        }
      };

      if (!isAuthenticated) {
        // Handle guest cart with localStorage
        const rawCart = localStorage.getItem('guestCart');
        let guestCart = rawCart ? JSON.parse(rawCart) : [];

        // Generate a unique ID for the cart item
        const itemId = Date.now().toString();
        const newItem = {
          ...cartItem,
          _id: itemId,
          productId: {
            ...product,
            _id: product._id
          }
        };

        // Check if item with same variant and size exists
        const existingItemIndex = guestCart.findIndex(
          (item: any) =>
            item.variantId === variantId &&
            item.variant.size === selectedSize &&
            item.variant.color === selectedColor
        );

        if (existingItemIndex > -1) {
          // Update quantity if item exists
          guestCart[existingItemIndex].quantity += quantity;
        } else {
          // Add new item if it doesn't exist
          guestCart.push(newItem);
        }

        localStorage.setItem('guestCart', JSON.stringify(guestCart));
      } else {
        // Handle authenticated user cart
        await addItemToCart(cartItem);
      }

      toast.success(t('productDetail.addToCart'));
    } catch (err: any) {
      toast.error(err?.message || t('common.error'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">{t('common.home')}</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-foreground">{t('nav.allProducts')}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{getProductTitle(product)}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-5 gap-4">
              {/* Big Image */}
              <div className="col-span-4 aspect-square bg-gray-light rounded-lg overflow-hidden">
                <img
                  src={activeImageUrl || product.mainImage?.secure_url || '/placeholder.svg'}
                  alt={getProductTitle(product)}
                  className="w-full h-full object-cover"
                  loading="eager"
                  // @ts-ignore
                  fetchpriority="high"
                />
              </div>
              {/* Thumbnails */}
              <div className="col-span-1 flex flex-col gap-4">
                {allImages.slice(0, 6).map((image, index) => {
                  const isActive = (activeImageUrl || product.mainImage?.secure_url || '/placeholder.svg') === image.secure_url;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "aspect-square rounded-lg overflow-hidden cursor-pointer transition-all border",
                        isActive ? "border-navy opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      onMouseEnter={() => setActiveImageUrl(image.secure_url)}
                      onClick={() => setActiveImageUrl(image.secure_url)}
                    >
                      <img
                        src={image.secure_url}
                        alt={`${getProductTitle(product)} ${t('common.viewMore')} ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                  <Badge variant="secondary" className="bg-navy text-white">{t('products.newArrivals')}</Badge>
                )}
                {isOnSale && (
                  <Badge variant="destructive" className="bg-primary text-white">
                    -{discountPercentage}% {t('productDetail.discount')}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-navy">{getProductTitle(product)}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < 4 // Default rating since not provided in API
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  4.5 (12 reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-navy">
                L.E{product.finalPrice.toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-xl text-muted-foreground line-through">
                  L.E{product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Lingerie - no returns notice (i18n) */}
            <div className="mt-2 text-sm rounded-md px-3 py-2 bg-rose-50 text-rose-700">
              {t('productDetail.lingerieNoReturn')}
            </div>

            {/* Colors */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">{t('productDetail.color')}</h3>
                <div className="flex gap-2">
                  {availableColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        selectedColor === color
                          ? "border-navy scale-110"
                          : "border-border hover:border-gray-400"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            <div>
              <h3 className="font-medium mb-3">{t('productDetail.size')}</h3>
              <div className="flex gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "px-4 py-2 border rounded-lg transition-colors",
                      selectedSize === size
                        ? "border-navy bg-navy text-white"
                        : "border-border hover:border-gray-400"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-medium mb-3">{t('productDetail.quantity')}</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-light"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-border">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-light"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock ? t('productDetail.onlyLeftInStock').replace('{count}', product.stock.toString()) : t('productDetail.inStock')}
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={cartLoading}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                {cartLoading ? t('productDetail.adding') : t('productDetail.addToCart')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={cn(
                  isWishlisted && "bg-primary text-white border-primary"
                )}
              >
                <Heart className={cn(
                  "h-4 w-4",
                  isWishlisted && "fill-current"
                )} />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-t border-border">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm">{t('productDetail.freeShipping')}</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" />
                <span className="text-sm">{t('productDetail.easyReturns')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm">{t('productDetail.warranty')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-border">
            <div className="flex space-x-8">
              {["description", ""].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "py-4 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "description" ? t('productDetail.description') : ``}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {getProductDescription(product) || `This premium ${getProductTitle(product)} combines style and comfort for the modern wardrobe. 
                  Crafted from high-quality materials, it features a contemporary design that transitions 
                  seamlessly from casual to formal settings. The attention to detail and superior 
                  construction ensure lasting durability and timeless appeal.`}
                </p>

              </div>
            )}


          </div>
        </div>


      </div>

      <Footer />
    </div>
  );
}