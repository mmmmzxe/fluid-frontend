import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { addToFavorites, removeFromFavorites } from "@/store/slices/favoritesSlice";
import { userApi } from '@/services/adminApi';
import { useCart } from "@/hooks/useCart";
import { toast } from "react-toastify";
import { useProduct } from "@/hooks/useProduct";
import { getProductTitle } from "@/lib/i18nHelpers";
import { useTranslation } from "react-i18next";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  subCategory?: string;
  image: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isSale?: boolean;
  colors?: string[];
  stock?: number;
}

// API Product interface for backend data
export interface ApiProduct {
  _id: string;
  titleEnglish: string;
  titleArabic: string;
  descriptionEnglish: string;
  descriptionArabic: string;
  price: number;
  finalPrice: number;
  discount?: number;
  discountType?: string;
  stock?: number;
  category: string;
  subCategory?: string;
  mainImage?: {
    secure_url: string;
    public_id: string;
    _id: string;
  };
  subImages?: Array<{
    secure_url: string;
    public_id: string;
    _id: string;
  }>;
  variants?: Array<{
    color: string;
    size: Array<{
      size?: string;
      stock: number;
      _id: string;
    }>;
    stock: number;
    _id: string;
  }>;
  slugEnglish: string;
  slugArabic: string;
  createdAt: string;
  updatedAt: string;
}

// Transform API product to frontend Product interface
export const transformApiProduct = (apiProduct: ApiProduct): Product => {
  if (!apiProduct || !apiProduct._id) {
    throw new Error('Invalid product data');
  }

  const isOnSale = Boolean(apiProduct.discount && apiProduct.discount > 0);
  const originalPrice = isOnSale ? apiProduct.price : undefined;

  // Extract colors from variants
  const colors = apiProduct.variants?.map(variant => variant.color) || [];

  // Calculate total stock from variants
  let totalStock = apiProduct.stock || 0;
  if (apiProduct.variants && apiProduct.variants.length > 0) {
    totalStock = apiProduct.variants.reduce((acc, variant) => {
      const variantStock = variant.size?.reduce((sizeAcc, s) => sizeAcc + (s.stock || 0), 0) || 0;
      return acc + variantStock;
    }, 0);
  }

  // Calculate if product is new (created within last 30 days)
  const createdAt = new Date(apiProduct.createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const isNew = createdAt > thirtyDaysAgo;

  return {
    id: apiProduct._id,
    name: getProductTitle(apiProduct),
    price: apiProduct.finalPrice || 0,
    originalPrice: originalPrice,
    category: apiProduct.category || 'uncategorized',
    subCategory: apiProduct.subCategory,
    image: apiProduct.mainImage?.secure_url ||
      (apiProduct.subImages && apiProduct.subImages.length > 0 ? apiProduct.subImages[0].secure_url : '/placeholder.svg'),
    rating: 4.5, // Default rating since not provided in API
    reviewCount: Math.floor(Math.random() * 200) + 10, // Mock review count
    isNew: isNew,
    isSale: isOnSale,
    colors: colors,
    stock: totalStock
  };
};

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.items);
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const { addItemToCart, loading } = useCart();
  const [hoveredImage, setHoveredImage] = useState(product.image);
  const { fetchProductById } = useProduct();

  // Variant selection dialog state
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const isWishlisted = favorites.some(item => item.id === product.id);

  const openVariantDialog = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const data = await fetchProductById(product.id);
      setDetail(data);
      if (data?.variants && data.variants.length > 0) {
        const firstColor = data.variants[0].color;
        setSelectedColor(firstColor);
        const firstSize = data.variants[0].size?.[0];
        if (firstSize) {
          if (firstSize.size) setSelectedSize(String(firstSize.size));
          else {
            const keys = Object.keys(firstSize).filter(k => k !== 'stock' && k !== '_id');
            setSelectedSize(keys.length ? String(firstSize[keys[0]]) : "M");
          }
        }
      }
      setShowVariantDialog(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load product variants");
    }
  };

  const confirmAddToCart = async () => {
    try {
      if (!selectedColor || !selectedSize || !detail) {
        toast.error("Please choose color and size");
        return;
      }
      const selectedVariant = detail.variants?.find((v: any) => v.color === selectedColor);
      const variantId = selectedVariant?._id || detail._id;
      const sizeObj = selectedVariant?.size?.find((s: any) => {
        if (s.size) return s.size === selectedSize;
        const keys = Object.keys(s).filter((k) => k !== 'stock' && k !== '_id');
        return keys.length > 0 && s[keys[0]] === selectedSize;
      });
      const sizeId = sizeObj?._id || detail._id;

      await addItemToCart({
        productId: detail._id,
        variantId,
        sizeId,
        quantity: 1,
        variant: {
          size: selectedSize,
          color: selectedColor,
        },
      });
      toast.success("Added to cart!");
      setShowVariantDialog(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to add to cart");
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to manage favorites');
      return;
    }

    try {
      // Call backend to add/remove favorite depending on current state
      if (isWishlisted) {
        await userApi.removeFromFavorites(product.id);
        dispatch(removeFromFavorites(product.id));
        toast.success('Removed from favorites');
      } else {
        await userApi.addToFavorites(product.id);
        dispatch(addToFavorites(product));
        toast.success('Added to favorites');
      }
    } catch (err: any) {
      console.error('Failed to toggle favorite', err);
      toast.error(err?.response?.data?.message || 'Failed to update favorites');
    }
  };

  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = isOnSale
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <>
      <div className={cn("group relative", className)}>
        <div className="relative bg-gray-light rounded-lg overflow-hidden">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {product.stock === 0 && (
              <Badge variant="destructive" className="bg-gray-500 text-white">
                {t('productDetail.outOfStock')}
              </Badge>
            )}
            {product.isNew && (
              <Badge variant="secondary" className="bg-navy text-white">
                {t('products.newArrivals').split(' ')[0].toUpperCase()}
              </Badge>
            )}
            {isOnSale && discountPercentage > 0 && (
              <Badge variant="destructive" className="bg-primary text-white">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white"
            onClick={handleToggleFavorite}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isWishlisted ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </Button>

          {/* Product Image */}
          <Link to={`/product/${product.id}`}>
            <div
              className="aspect-square overflow-hidden"
              onMouseEnter={() => setHoveredImage(product.image)}
              onMouseLeave={() => setHoveredImage(product.image)}
            >
              <img
                src={hoveredImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="secondary"
              className="w-full"
              onClick={openVariantDialog}
              disabled={loading}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {loading ? t('common.loading') : t('productDetail.addToCart')}
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-4 space-y-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              L.E{product.price.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-sm text-muted-foreground line-through">
                L.E{product.originalPrice!.toFixed(2)}
              </span>
            )}
          </div>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1">
              {product.colors.slice(0, 4).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-muted-foreground ml-1">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Variant Selection Dialog */}
      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('productDetail.selectSize')} & {t('productDetail.selectColor')}</DialogTitle>
            <DialogDescription>
              Please select your preferred color and size before adding to cart.
            </DialogDescription>
          </DialogHeader>

          {/* Colors */}
          {detail?.variants?.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">{t('productDetail.selectColor')}</div>
              <div className="flex flex-wrap gap-2">
                {detail.variants.map((v: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedColor(v.color);
                      // Try to find first size with stock > 0, otherwise fallback to first size
                      const firstAvailableSize = v.size?.find((s: any) => (s.stock || 0) > 0) || v.size?.[0];
                      
                      if (firstAvailableSize) {
                        if (firstAvailableSize.size) setSelectedSize(String(firstAvailableSize.size));
                        else {
                          const keys = Object.keys(firstAvailableSize).filter(k => k !== 'stock' && k !== '_id');
                          setSelectedSize(keys.length ? String(firstAvailableSize[keys[0]]) : "M");
                        }
                      }
                    }}
                    className={cn(
                      "px-3 py-1 rounded border text-sm",
                      selectedColor === v.color ? "border-navy" : "border-border hover:border-gray-400"
                    )}
                    style={{ backgroundColor: String(v.color) }}
                    title={v.color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {detail && (
            <div className="space-y-2">
              <div className="text-sm font-medium">{t('productDetail.selectSize')}</div>
              <div className="flex flex-wrap gap-2">
                {(detail.variants?.find((v: any) => v.color === selectedColor)?.size || []).map((s: any, i: number) => {
                  const display = s.size ? s.size : (() => {
                    const keys = Object.keys(s).filter(k => k !== 'stock' && k !== '_id');
                    return keys.length ? String(s[keys[0]]) : 'M';
                  })();
                  const stock = s.stock || 0;
                  const isOutOfStock = stock === 0;
                  
                  return (
                    <button
                      key={i}
                      disabled={isOutOfStock}
                      onClick={() => !isOutOfStock && setSelectedSize(display)}
                      className={cn(
                        "px-3 py-1 rounded border text-sm relative overflow-hidden transition-all",
                        selectedSize === display 
                          ? "border-navy bg-navy/5" 
                          : "border-border hover:border-gray-400",
                        isOutOfStock && "opacity-50 cursor-not-allowed bg-gray-100 hover:border-border"
                      )}
                    >
                      {display}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-full h-[1px] bg-gray-400 rotate-45 transform origin-center" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVariantDialog(false)}>{t('common.cancel')}</Button>
            <Button onClick={confirmAddToCart} disabled={!selectedColor || !selectedSize || loading}>
              {loading ? t('common.loading') : t('productDetail.addToCart')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}