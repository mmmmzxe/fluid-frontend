import CategorySection from "@/components/CategorySection";
import { useProducts } from "@/hooks/useApi";

type Props = {
  category: any;
};

export default function CategoryLoader({ category }: Props) {
  const { products, loading } = useProducts({ category: category._id, pageSize: 1 });

  // While loading, render nothing to avoid flashing empty headers
  if (loading) return null;

  // If there are no products, don't render the section
  if (!products || products.length === 0) return null;

  return <CategorySection category={category} />;
}
