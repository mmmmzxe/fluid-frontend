import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { http } from "@/services/http";

import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useTranslation } from "react-i18next";
import { fbPixel } from "@/lib/fbPixel";

export function SearchResults() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchQuery = searchParams.get("query");

useEffect(() => {
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/product/all?name=${searchQuery}`);
      const productsData = Array.isArray(response.data.products) ? response.data.products : [];
      setProducts(productsData);
      
      // Track Search event for Facebook Pixel
      if (searchQuery) {
        fbPixel.search({
          search_string: searchQuery,
          content_ids: productsData.map((p: any) => p._id),
        });
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setProducts([]);
    }
    setLoading(false);
  };

  if (searchQuery) {
    fetchProducts();
  } else {
    setProducts([]);
    setLoading(false);
  }
}, [searchQuery]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('search.results')} {t('search.for')} "{searchQuery}"</h1>
      {products.length === 0 ? (
        <p className="text-muted-foreground">{t('search.noProductsFound')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}