import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ProductCard, transformApiProduct } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useApi";
import { getCategoryName } from "@/lib/i18nHelpers";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, normalizeImageUrl } from "@/lib/utils";
import type { ApiCategory, ApiSubCategory } from "@/services/api";

type Props = {
  category: ApiCategory;
};

export default function CategorySection({ category }: Props) {
  const subCategories: ApiSubCategory[] = category.subCategories || [];
  const [activeTab, setActiveTab] = useState<string>("all");

  const { products: apiProducts, loading } = useProducts({
    category: category._id,
    pageSize: 40,
  });

  const filteredProducts = apiProducts.filter((product) => {
    if (activeTab === "all") return true;
    return product.subCategory === activeTab;
  });

  const products = filteredProducts.map(transformApiProduct);

  if (!loading && apiProducts.length === 0) return null;

  const viewAllHref =
    activeTab === "all"
      ? `/products?category=${category._id}`
      : `/products?category=${category._id}&subCategory=${activeTab}`;

  return (
    <motion.section className="py-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h3 className="text-2xl font-semibold">{getCategoryName(category)}</h3>
          <Link to={viewAllHref} className="text-sm text-primary shrink-0">
            View all
          </Link>
        </div>

        {subCategories.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
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
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-sm text-muted-foreground">No products in this subcategory.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
