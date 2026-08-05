import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Heart, ShoppingBag, Minus, Plus, Truck, RotateCcw, Shield, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard, transformApiProduct } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProduct, ApiProductDetail } from "@/hooks/useProduct";
import { useCart } from "@/hooks/useCart";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { getProductTitle, getProductDescription } from "@/lib/i18nHelpers";
import SEO from "@/components/SEO";
import PageLoader from "@/components/PageLoader";
import { fbPixel } from "@/lib/fbPixel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import { addToFavorites, removeFromFavorites } from "@/store/slices/favoritesSlice";
import { userApi } from '@/services/adminApi';

// ... (other imports)

export default function ProductDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.items);
  const { fetchProductById, loading, error } = useProduct();
  const { addItemToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAppSelector((state) => state.user);

  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const isRtl = i18n.language === "ar";
  const allImages = (product?.subImages && product.subImages.length > 0)
    ? [
      { secure_url: normalizeImageUrl(product.mainImage?.secure_url) },
      ...product.subImages.map(img => ({ secure_url: normalizeImageUrl(img.secure_url) })),
    ]
    : [
      { secure_url: normalizeImageUrl(product?.mainImage?.secure_url) },
    ];

  const onCarouselSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setActiveImageIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    onCarouselSelect(carouselApi);
    carouselApi.on("select", onCarouselSelect);
    return () => {
      carouselApi.off("select", onCarouselSelect);
    };
  }, [carouselApi, onCarouselSelect]);

  useEffect(() => {
    if (id) {
      fetchProductById(id)
        .then((productData) => {
          setProduct(productData);
          setActiveImageIndex(0);
          if (productData?.variants && productData.variants.length > 0) {
            setSelectedColor(productData.variants[0].color);
          }
          
          // Track ViewContent event for Facebook Pixel
          fbPixel.viewContent({
            content_name: getProductTitle(productData),
            content_ids: [productData._id],
            content_type: 'product',
            value: productData.finalPrice,
            currency: 'EGP',
          });
        })
        .catch((err) => {
          console.error("Failed to fetch product:", err);
        });
    }
  }, [id, fetchProductById]);

  if (loading) {
    return <PageLoader message="Loading product details..." />;
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
            <Link to="/products" className="inline-flex items-center gap-1.5">
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              {t('productDetail.browseAllProducts')}
            </Link>
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

  const isOnSale = Boolean(product.discount && product.discount > 0);
  const discountPercentage = isOnSale ? product.discount : 0;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error(t('productDetail.selectSize'));
      return;
    }

    try {
      if (!selectedVariant) {
        throw new Error('Please select a valid color and size');
      }

      const sizeObj = selectedVariant.size?.find(s => {
        // Handle both old and new structure
        if (s.size) return s.size === selectedSize;
        const keys = Object.keys(s).filter(key => key !== 'stock' && key !== '_id');
        return keys.length > 0 && s[keys[0]] === selectedSize;
      });

      if (!sizeObj?._id) {
        throw new Error('Please select a valid size');
      }

      const cartItem = {
        productId: product._id,
        variantId: selectedVariant._id,
        sizeId: sizeObj._id,
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
            item.variantId === selectedVariant._id &&
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

      
      // Track AddToCart event for Facebook Pixel
      fbPixel.addToCart({
        content_name: getProductTitle(product),
        content_ids: [product._id],
        content_type: 'product',
        value: product.finalPrice * quantity,
        currency: 'EGP',
      });
      
      toast.success(t('productDetail.addToCart'));
    } catch (err: any) {
      toast.error(err?.message || t('common.error'));
    }
  };  const productTitle = getProductTitle(product);
  const productDescription = getProductDescription(product) || t('productDetail.defaultDescription', { title: productTitle });
  
  // Robust image selection: Main Image -> First Sub Image -> Fallback
  const productImage = normalizeImageUrl(
    product.mainImage?.secure_url || 
    (product.subImages && product.subImages.length > 0 ? product.subImages[0].secure_url : '/seo-image.png')
  );

  // Check if any variant is in stock
  const isAvailable = product.variants?.some(v => 
    v.size?.some((s: any) => (s.stock || 0) > 0)
  ) ?? false;

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productTitle,
    "image": [
      normalizeImageUrl(product.mainImage?.secure_url),
      ...(product.subImages?.map(img => normalizeImageUrl(img.secure_url)) || [])
    ].filter(Boolean),
    "description": productDescription,
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": "ExtraChic"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "EGP",
      "price": product.finalPrice,
      "availability": isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "12"
      
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={productTitle}
        description={productDescription}
        image={productImage}
        type="product"
        keywords={`${productTitle}, fashion, clothing, buy online, ExtraChic, ${product.category}`}
        structuredData={productSchema}
      />
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-primary transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          {t('common.back')} {t('nav.allProducts')}
        </Link>
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
            <div className="flex flex-col gap-4">
              {/* Image Slider */}
              <div className="relative group">
                <Carousel
                  setApi={setCarouselApi}
                  opts={{ loop: allImages.length > 1, direction: isRtl ? "rtl" : "ltr" }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-0">
                    {allImages.map((image, index) => (
                      <CarouselItem key={index} className="pl-0 basis-full">
                        <div className="aspect-square bg-gray-light rounded-lg overflow-hidden">
                          <img
                            src={image.secure_url}
                            alt={`${getProductTitle(product)} ${index + 1}`}
                            className="w-full h-full object-cover select-none"
                            loading={index === 0 ? "eager" : "lazy"}
                            // @ts-ignore
                            fetchpriority={index === 0 ? "high" : undefined}
                            draggable={false}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label={t('common.previous', 'Previous image')}
                      onClick={() => carouselApi?.scrollPrev()}
                      className="absolute start-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
                    </button>
                    <button
                      type="button"
                      aria-label={t('common.next', 'Next image')}
                      onClick={() => carouselApi?.scrollNext()}
                      className="absolute end-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronRight className="h-5 w-5 rtl:rotate-180" />
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((image, index) => {
                  const isActive = activeImageIndex === index;
                  return (
                    <button
                      type="button"
                      key={index}
                      className={cn(
                        "aspect-square rounded-lg overflow-hidden cursor-pointer transition-all border",
                        isActive ? "border-navy opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      onClick={() => carouselApi?.scrollTo(index)}
                    >
                      <img
                        src={image.secure_url}
                        alt={`${getProductTitle(product)} ${t('common.viewMore')} ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
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
                {isOnSale && discountPercentage > 0 && (
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
                  4.5 (12 {t('productDetail.reviews').toLowerCase()})
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
              <div className="flex flex-wrap gap-2">
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
                    className="p-2 hover:bg-gray-light disabled:opacity-50"
                    disabled={!selectedSize}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-border">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-light disabled:opacity-50"
                    disabled={!selectedSize}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className={cn("text-sm", 
                  (() => {
                    if (!selectedSize) return "text-muted-foreground";
                    const selectedSizeObj = selectedVariant?.size?.find(s => {
                      if (s.size) return s.size === selectedSize;
                      const keys = Object.keys(s).filter(key => key !== 'stock' && key !== '_id');
                      return keys.length > 0 && String(s[keys[0]]) === selectedSize;
                    });
                    const stock = selectedSizeObj?.stock || 0;
                    return stock > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium";
                  })()
                )}>
                  {(() => {
                    if (!selectedSize) return t('productDetail.selectSize');
                    const selectedSizeObj = selectedVariant?.size?.find(s => {
                      if (s.size) return s.size === selectedSize;
                      const keys = Object.keys(s).filter(key => key !== 'stock' && key !== '_id');
                      return keys.length > 0 && String(s[keys[0]]) === selectedSize;
                    });
                    const stock = selectedSizeObj?.stock || 0;
                    if (stock === 0) return t('productDetail.outOfStock');
                    return stock < 10 && stock > 0
                      ? t('productDetail.onlyLeftInStock').replace('{count}', stock.toString()) 
                      : t('productDetail.inStock');
                  })()}
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="flex-1" 
                onClick={handleAddToCart} 
                disabled={cartLoading || (() => {
                  if (!selectedSize) return false; // Allow click to show validation
                  const selectedSizeObj = selectedVariant?.size?.find(s => {
                    if (s.size) return s.size === selectedSize;
                    const keys = Object.keys(s).filter(key => key !== 'stock' && key !== '_id');
                    return keys.length > 0 && String(s[keys[0]]) === selectedSize;
                  });
                  return (selectedSizeObj?.stock || 0) === 0;
                })()}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {cartLoading ? t('productDetail.adding') : t('productDetail.addToCart')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={async () => {
                   const productId = product._id;
                   const isLiked = favorites.some(item => item.id === productId);

                   if (!isAuthenticated) {
                      if (isLiked) {
                        dispatch(removeFromFavorites(productId));
                        toast.success(t('common.removedFromFavorites', 'Removed from favorites'));
                      } else {
                        // Use shared transformer to ensure consistent data (stock, price, etc.)
                        const productForStore = transformApiProduct(product as any);
                        dispatch(addToFavorites(productForStore));
                        
                        // Track AddToWishlist event for Facebook Pixel
                        fbPixel.addToWishlist({
                          content_name: getProductTitle(product),
                          content_ids: [productId],
                          value: product.finalPrice,
                          currency: 'USD',
                        });
                        
                        toast.success(t('common.addedToFavorites', 'Added to favorites'));
                      }
                      return;
                   }

                   try {
                      if (isLiked) {
                        await userApi.removeFromFavorites(productId);
                        dispatch(removeFromFavorites(productId));
                        toast.success(t('common.removedFromFavorites', 'Removed from favorites'));
                      } else {
                        // Use shared transformer here too
                        const productForStore = transformApiProduct(product as any);
                        await userApi.addToFavorites(productId);
                        dispatch(addToFavorites(productForStore));
                        
                        // Track AddToWishlist event for Facebook Pixel
                        fbPixel.addToWishlist({
                          content_name: getProductTitle(product),
                          content_ids: [productId],
                          value: product.finalPrice,
                          currency: 'EGP',
                        });
                        
                        toast.success(t('common.addedToFavorites', 'Added to favorites'));
                      }
                   } catch (err: any) {
                      toast.error(err?.message || 'Failed to update favorites');
                   }
                }}
                className={cn(
                  favorites.some(item => item.id === product._id) && "bg-primary text-white border-primary"
                )}
              >
                <Heart className={cn(
                  "h-4 w-4",
                  favorites.some(item => item.id === product._id) && "fill-current"
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
                  {getProductDescription(product) || t('productDetail.defaultDescription', { title: getProductTitle(product) })}
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