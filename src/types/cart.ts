import type { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: {
    color: string;
    size: string;
  };
}
