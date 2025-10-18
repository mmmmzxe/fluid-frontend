import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Grid, List, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ProductCard, transformApiProduct } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import Footer  from "@/components/Footer";
import { useCategories } from "@/hooks/useApi";
import { productApi, Product } from "@/services/adminApi";
import { cn } from "@/lib/utils";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // API data
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  
  const loading = categoriesLoading || productsLoading;
  const error = categoriesError || productsError;

  // Filter states with default values
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [showOnSale, setShowOnSale] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);

  // Fetch products (no-cache) and set defaults
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const res = await productApi.getAllNoCache();
        if (!mounted) return;
        setProducts(res.data || []);
      } catch (e: any) {
        if (!mounted) return;
        setProductsError(e?.message || "Failed to load products");
      } finally {
        if (mounted) setProductsLoading(false);
      }
    })();

    // Only set defaults if no URL parameters are present
    if (!searchParams.get("category") && !searchParams.get("sort")) {
      setSelectedCategories([]);
      setPriceRange([0, 50000]);
      setSortBy("featured");
      setShowOnSale(false);
      setShowNew(false);
    }
    return () => { mounted = false; };
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    let filtered = products
      .map(product => {
        try {
          return transformApiProduct(product);
        } catch (error) {
          console.error('Error transforming product:', error, product);
          return null;
        }
      })
      .filter((product): product is NonNullable<typeof product> => product !== null);

  
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category)
      );
    }
    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter(product => 
        product.subCategory && selectedSubCategories.includes(product.subCategory)
      );
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // On sale filter
    if (showOnSale) {
      filtered = filtered.filter(product => product.isSale);
    }

    // New products filter
    if (showNew) {
      filtered = filtered.filter(product => product.isNew);
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // Featured - keep original order
        break;
    }

    console.log('Final filtered products:', filtered.length);
    return filtered;
  }, [products, selectedCategories, priceRange, showOnSale, showNew, sortBy]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSelectedPriceRange([]);
    setPriceRange([0, 50000]);
    setShowOnSale(false);
    setShowNew(false);
    setSortBy("featured");
    setSearchParams({});
  };

  const activeFiltersCount = selectedCategories.length + 
    selectedSubCategories.length + 
    (showOnSale ? 1 : 0) + 
    (showNew ? 1 : 0) + 
    (priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy mb-2">All Products</h1>
            <p className="text-muted-foreground">
              Showing {filteredProducts.length} of {products?.length || 0} products
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex border border-border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className={cn(
            "lg:block",
            showFilters ? "block" : "hidden"
          )}>
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-navy">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h4 className="font-medium">Categories</h4>
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading categories...</div>
                ) : (
                  <>
                    {/* All Products Option */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="all-products"
                        checked={selectedCategories.length === 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([]);
                          }
                        }}
                      />
                      <label htmlFor="all-products" className="text-sm flex-1 cursor-pointer">
                        All Products
                      </label>
                      <span className="text-xs text-muted-foreground">
                        ({products?.length || 0})
                      </span>
                    </div>
                    
                    {/* Category Options */}
                    {categories?.map((category) => (
                  <div key={category._id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={category._id}
                        checked={selectedCategories.includes(category._id)}
                        onCheckedChange={(checked) => 
                          handleCategoryChange(category._id, checked as boolean)
                        }
                      />
                      <label htmlFor={category._id} className="text-sm flex-1 cursor-pointer">
                        {category.nameEnglish || category.name}
                      </label>
                      <span className="text-xs text-muted-foreground">
                        ({products?.filter(p => (p as any).category === category._id).length || 0})
                      </span>
                    </div>

                    {(category as any)?.subCategories?.length > 0 && (
                      <div className="ml-6 space-y-1">
                        {(category as any).subCategories.map((sub: any) => (
                          <div key={sub._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`sub-${sub._id}`}
                              checked={selectedSubCategories.includes(sub._id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedSubCategories(prev => [...prev, sub._id]);
                                } else {
                                  setSelectedSubCategories(prev => prev.filter(id => id !== sub._id));
                                }
                              }}
                            />
                            <label htmlFor={`sub-${sub._id}`} className="text-xs text-muted-foreground cursor-pointer">
                              {sub.nameEnglish || sub.nameArabic || sub.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                  </>
                )}
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-medium">Price Range</h4>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    max={50000}
                    min={0}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>${priceRange[0].toLocaleString()}</span>
                    <span>${priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Special Filters */}
              <div className="space-y-3">
                <h4 className="font-medium">Special</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="on-sale"
                    checked={showOnSale}
                    onCheckedChange={(checked) => setShowOnSale(checked as boolean)}
                  />
                  <label htmlFor="on-sale" className="text-sm cursor-pointer">
                    On Sale
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-arrivals"
                    checked={showNew}
                    onCheckedChange={(checked) => setShowNew(checked as boolean)}
                  />
                  <label htmlFor="new-arrivals" className="text-sm cursor-pointer">
                    New Arrivals
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading products...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No products found matching your filters.
                </p>
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={cn(
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-6"
              )}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className={viewMode === "list" ? "flex-row" : ""}
                  />
                ))}
              </div>
            )}

            {/* Load More (if needed) */}
            {filteredProducts.length > 0 && !loading && (
              <div className="text-center mt-12">
                <Button variant="outline">
                  Load More Products
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
