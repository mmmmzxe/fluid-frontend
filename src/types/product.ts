import type { CloudinaryImage } from './category';

export interface ProductVariant {
  color: string;
  size: Array<{
    size?: string;
    stock: number;
    _id: string;
  }>;
  stock: number;
  _id: string;
}

export interface Product {
  _id: string;
  titleEnglish: string;
  titleArabic: string;
  descriptionEnglish: string;
  descriptionArabic: string;
  price: number;
  finalPrice: number;
  discount?: number;
  discountType?: string;
  stock?: number;
  category: string;
  subCategory?: string;
  mainImage?: CloudinaryImage;
  subImages?: CloudinaryImage[];
  variants?: ProductVariant[];
  slugEnglish: string;
  slugArabic: string;
  createdAt: string;
  updatedAt: string;
}
