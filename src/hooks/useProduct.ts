import { useCallback, useState } from "react";

const API_BASE = "http://localhost:3000";

export interface ApiProductDetail {
  _id: string;
  titleArabic: string;
  titleEnglish: string;
  descriptionArabic: string;
  descriptionEnglish: string;
  createdBy: string;
  updatedBy: string;
  category: string;
  price: number;
  discount?: number;
  discountType?: string;
  stock?: number;
  subImages: Array<{
    secure_url: string;
    public_id: string;
    _id: string;
  }>;
  folderId: string;
  slugArabic: string;
  slugEnglish: string;
  finalPrice: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  variants: Array<{
    color: string;
    size: Array<{
      [key: string]: string | number;
      stock: number;
      _id: string;
    }>;
    stock: number;
    _id: string;
  }>;
  mainImage?: {
    secure_url: string;
    public_id: string;
    _id: string;
  };
}

export function useProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductById = useCallback(async (productId: string): Promise<ApiProductDetail | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/product/withId/${productId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.message === "Done" && data.product) {
        return data.product;
      } else {
        throw new Error("Invalid product data received");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to fetch product");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchProductById,
    loading,
    error,
  };
}
