import type { CloudinaryImage } from './category';
import type { FlextockSubmission } from './order';

export interface EditHistoryItem {
  editedBy: string;
  editedByUserId?: string | { _id: string; name: string };
  editedAt: string;
  summary: string;
  previousState?: Record<string, any>;
}

export interface SocialVariant {
  color?: string;
  size?: string;
  quantity: number;
}

export interface SocialProduct {
  productName: string;
  productImage?: CloudinaryImage;
  price: number;
  productNotes?: string;
  variants: SocialVariant[];
}

export type SocialOrderStatus = 'pending' | 'confirmed' | 'cancelled';

export type SellerName = 'Fatma' | 'Mariam' | 'Zeinab' | 'Sara';

export const SELLER_NAMES: readonly SellerName[] = ['Fatma', 'Mariam', 'Zeinab', 'Sara'];

export interface SocialOrder {
  _id: string;
  createdBy: SellerName;
  createdByUserId: string | { _id: string; name: string; email: string };
  status: SocialOrderStatus;
  editHistory?: EditHistoryItem[];

  // Multi-product array
  products?: SocialProduct[];

  // Legacy flat fields (backward compat for old orders)
  productName?: string;
  productImage?: CloudinaryImage;
  deposit?: number;
  depositImage?: CloudinaryImage;
  price?: number;
  color?: string;
  size?: string;
  quantity?: number;
  productNotes?: string;

  // Customer / Delivery
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  city: string;
  deliveryNotes?: string;

  // Flextock Tracking
  flextockSubmission?: FlextockSubmission;
  createdAt: string;
  updatedAt: string;
}

export interface SellerStat {
  seller: string;
  count: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
}
