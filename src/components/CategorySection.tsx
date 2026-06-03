import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ProductCard, transformApiProduct } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useApi";
import { getCategoryName } from "@/lib/i18nHelpers";

type Props = {
  category: any;
};

export default function CategorySection({ category }: Props) {
  const { products: apiProducts, loading } = useProducts({ category: category._id, pageSize: 4 });
  const products = apiProducts.map(transformApiProduct).slice(0, 4);
  // If not loading and there are no products, don't render the section
  if (!loading && products.length === 0) return null;

  return (
    <motion.section className="py-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">{getCategoryName(category)}</h3>
          <Link to={`/products?category=${category._id}`} className="text-sm text-primary">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
