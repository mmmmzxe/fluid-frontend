import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ProductCard, transformApiProduct } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useApi";
import { getCategoryName } from "@/lib/i18nHelpers";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, normalizeImageUrl } from "@/lib/utils";
import type { ApiCategory, ApiSubCategory } from "@/services/api";
import { ChevronDown } from "lucide-react";

type Props = {
  category: ApiCategory;
};

const INITIAL_VISIBLE = 4;
const LOAD_MORE_STEP = 4;
const BATCH_SIZE = 12;

export default function CategorySection({ category }: Props) {
  const subCategories: ApiSubCategory[] = category.subCategories || [];
  const [activeTab, setActiveTab] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Fetch a lightweight batch (12 items) instead of 40 for optimal performance
  const { products: apiProducts, loading } = useProducts({
    category: category._id,
    pageSize: BATCH_SIZE,
  });

  // Reset visible count when switching subcategories
  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setVisibleCount(INITIAL_VISIBLE);
  };

  const filteredProducts = apiProducts.filter((product) => {
    if (activeTab === "all") return true;
    return product.subCategory === activeTab;
  });

  const allProducts = filteredProducts.map(transformApiProduct);
  const visibleProducts = allProducts.slice(0, visibleCount);
  const hasMoreToDisplay = visibleCount < allProducts.length;

  // Infinite scroll observer: automatically reveal more products as user scrolls down
  useEffect(() => {
    if (!hasMoreToDisplay) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, allProducts.length));
        }
      },
      { rootMargin: "150px" }
    );

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMoreToDisplay, allProducts.length]);

  if (!loading && apiProducts.length === 0) return null;

  const viewAllHref =
    activeTab === "all"
      ? `/products?category=${category._id}`
      : `/products?category=${category._id}&subCategory=${activeTab}`;

  return (
    <motion.section 
      className="py-10 border-b border-border/40 last:border-0" 
      initial={{ opacity: 0, y: 15 }} 
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h3 className="text-2xl font-semibold">{getCategoryName(category)}</h3>
          <Link to={viewAllHref} className="text-sm font-medium text-primary hover:underline shrink-0">
            View all
          </Link>
        </div>

        {subCategories.length > 0 && (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="h-auto w-full justify-start flex-wrap gap-1 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className={cn(
                  "rounded-full border border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none"
                )}
              >
                All
              </TabsTrigger>
              {subCategories.map((sub) => (
                <TabsTrigger
                  key={sub._id}
                  value={sub._id}
                  className={cn(
                    "rounded-full border border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none",
                    "flex items-center gap-2"
                  )}
                >
                  {sub.image?.secure_url && (
                    <img
                      src={normalizeImageUrl(sub.image.secure_url)}
                      alt={getCategoryName(sub)}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <span>{getCategoryName(sub)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 bg-muted/30 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No products in this subcategory.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleProducts.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>

            {/* Scroll observer sentinel & fallback button for smooth progressive loading */}
            {hasMoreToDisplay && (
              <div ref={observerRef} className="flex justify-center items-center py-6 mt-2">
                <button
                  onClick={() => setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, allProducts.length))}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-secondary/60 px-4 py-2 rounded-full transition-all hover:bg-secondary"
                >
                  <span>Show More</span>
                  <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}

