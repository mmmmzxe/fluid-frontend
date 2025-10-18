import { useState, useEffect } from 'react';
import { fetchCategories, fetchProducts, ApiCategory, ApiProduct } from '@/services/api';

export const useCategories = () => {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchCategories();
        setCategories(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return { categories, loading, error };
};

export const useProducts = (params?: {
  name?: string;
  maxPrice?: number;
  minPrice?: number;
  category?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}) => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchProducts(params);
        setProducts(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [params?.name, params?.maxPrice, params?.minPrice, params?.category, params?.page, params?.pageSize, params?.sortBy]);

  return { products, loading, error };
};
