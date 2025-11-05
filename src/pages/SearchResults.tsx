import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { http } from "@/services/http";

import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchQuery = searchParams.get("query");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await http.get(`/product?name=${searchQuery}`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
      setLoading(false);
    };

    if (searchQuery) {
      fetchProducts();
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
      <h1 className="text-2xl font-bold mb-6">Search Results for "{searchQuery}"</h1>
      {products.length === 0 ? (
        <p className="text-muted-foreground">No products found matching your search.</p>
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