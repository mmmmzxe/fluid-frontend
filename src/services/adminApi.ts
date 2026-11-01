/**
 * adminApi.ts — backward-compatible barrel
 *
 * All types now live in `src/types/` and all API functions live in
 * `src/services/admin/<domain>Api.ts`.
 *
 * This file re-exports everything so that existing consumers that import from
 * `@/services/adminApi` continue to work without any changes.
 *
 * For new code, prefer importing directly from:
 *   - `@/types` for types
 *   - `@/services/admin` for API functions
 */

// ── Types ──────────────────────────────────────────────────────────────────────
export type { ApiResponse } from '@/types/api';
export type { User, AuthResponse } from '@/types/auth';
export type { CloudinaryImage, Category, SubCategory } from '@/types/category';
export type { ProductVariant, Product } from '@/types/product';
export type {
  WhatsAppConfirmation,
  DepositConfirmation,
  FlextockSubmission,
  OrderStatus,
  Order,
} from '@/types/order';
export type { CartItem } from '@/types/cart';
export type { SupportTicket } from '@/types/support';
export type { Shipping } from '@/types/shipping';
export type { Announcement } from '@/types/announcement';
export type {
  EditHistoryItem,
  SocialVariant,
  SocialProduct,
  SocialOrderStatus,
  SellerName,
  SocialOrder,
  SellerStat,
} from '@/types/social-order';
export { SELLER_NAMES } from '@/types/social-order';
export type { WhatsAppSettingsData } from '@/types/whatsapp';

// ── API functions ──────────────────────────────────────────────────────────────
export { authApi } from './admin/authApi';
export { categoryApi } from './admin/categoryApi';
export { subCategoryApi } from './admin/subCategoryApi';
export { productApi } from './admin/productApi';
export { orderApi } from './admin/orderApi';
export { cartApi } from './admin/cartApi';
export { userApi } from './admin/userApi';
export { supportApi } from './admin/supportApi';
export { shippingApi } from './admin/shippingApi';
export { announcementApi } from './admin/announcementApi';
export { socialOrderApi } from './admin/socialOrderApi';
export { whatsappSettingsApi } from './admin/whatsappApi';

// ── HTTP client (default export kept for files that import `api` directly) ────
export { adminApiClient as default } from './admin/httpClient';
