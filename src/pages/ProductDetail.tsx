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

const sizes = ["XS", "S", "M", "L", "XL"];
const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    date: "2 weeks ago",
    comment: "Amazing quality and perfect fit! The fabric feels premium and the color is exactly as shown.",
    verified: true
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 4,
    date: "1 month ago", 
    comment: "Great product overall. Shipping was fast and the item arrived in perfect condition.",
    verified: true
  },
  {
    id: 3,
    name: "Emma Davis",
    rating: 5,
    date: "3 weeks ago",
    comment: "Absolutely love this! Will definitely order more items from this brand.",
    verified: false
  }
];

export default function ProductDetail() {
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
          <p className="text-muted-foreground">Loading product...</p>
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
          <h1 className="text-2xl font-bold text-navy mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <Button asChild>
            <Link to="/products">Browse All Products</Link>
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
  }).filter(Boolean).map(String) || sizes;

  const isOnSale = product.discount && product.discount > 0;
  const discountPercentage = isOnSale ? product.discount : 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
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
      
      await addItemToCart({
        productId: product._id,
        variantId,
        sizeId,
        quantity,
        variant: {
          // API expects string values
          size: selectedSize,
          color: selectedColor
        }
      });
      
      toast.success("Added to cart!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-foreground">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.titleEnglish}</span>
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
                  alt={product.titleEnglish}
                  className="w-full h-full object-cover"
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
                        alt={`${product.titleEnglish} view ${index + 1}`}
                        className="w-full h-full object-cover"
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
                  <Badge variant="secondary" className="bg-navy text-white">NEW</Badge>
                )}
                {isOnSale && (
                  <Badge variant="destructive" className="bg-primary text-white">
                    -{discountPercentage}% OFF
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-navy">{product.titleEnglish}</h1>
              
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
                ${product.finalPrice.toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Colors */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Color</h3>
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
              <h3 className="font-medium mb-3">Size</h3>
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
              <h3 className="font-medium mb-3">Quantity</h3>
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
                  {product.stock ? `Only ${product.stock} left in stock` : "In stock"}
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={cartLoading}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                {cartLoading ? "Adding..." : "Add to Cart"}
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
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" />
                <span className="text-sm">Easy Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm">2 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-border">
            <div className="flex space-x-8">
              {["description", "reviews"].map((tab) => (
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
                  {tab === "description" ? "Description" : "Reviews (12)"}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.descriptionEnglish || `This premium ${product.titleEnglish} combines style and comfort for the modern wardrobe. 
                  Crafted from high-quality materials, it features a contemporary design that transitions 
                  seamlessly from casual to formal settings. The attention to detail and superior 
                  construction ensure lasting durability and timeless appeal.`}
                </p>
                <h4 className="font-semibold mt-6 mb-3">Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Premium fabric construction</li>
                  <li>Modern, versatile design</li>
                  <li>Comfortable fit for all-day wear</li>
                  <li>Easy care and maintenance</li>
                  <li>Available in multiple sizes and colors</li>
                </ul>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">Customer Reviews</h3>
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.name}</span>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs">Verified</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <div className="flex mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3",
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Write a Review</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Rating</label>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-gray-300 hover:text-yellow-400 cursor-pointer" />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Review</label>
                        <textarea
                          rows={4}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Share your thoughts about this product..."
                        />
                      </div>
                      <Button>Submit Review</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      
      </div>

      <Footer />
    </div>
  );
}