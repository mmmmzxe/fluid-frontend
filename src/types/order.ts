import type { CloudinaryImage } from './category';

export interface WhatsAppConfirmation {
  confirmedVia: 'whatsapp';
  confirmedAt: string;
  whatsappPhone: string;
  whatsappMessageId: string;
}

export interface DepositConfirmation {
  depositConfirmed: boolean;
  confirmedVia: 'whatsapp';
  confirmedAt: string;
  whatsappMessageId: string;
}

export interface FlextockSubmission {
  status: 'not_submitted' | 'submitted' | 'failed';
  submittedAt?: string;
  flextockOrderCode?: string;
  lastError?: string;
  attempts: number;
  lastStatusNote?: string;
  lastSyncedAt?: string;
}

export type OrderStatus =
  | 'pending'
  | 'pending_deposit'
  | 'placed'
  | 'on_way'
  | 'delivered'
  | 'cancelled';

export interface Order {
  _id: string;
  status: OrderStatus;
  products: Array<{
    name?: string;
    productId: string;
    unitPrice?: number;
    quantity: number;
    variantId?: string;
    sizeId?: string;
    finalPrice?: number;
    _id?: string;
  }>;
  subTotal: number;
  finalPrice: number;
  createdAt: string;
  updatedAt: string;
  note?: string;
  paymentWay: 'card' | 'cash';
  address: string;
  phone: string;

  // Registered users
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };

  // Guest users
  firstName?: string;
  lastName?: string;
  paidAt?: string;
  email?: string;
  deposit?: number;
  depositReceipt?: CloudinaryImage;

  // WhatsApp integration
  whatsappConfirmation?: WhatsAppConfirmation;
  depositConfirmation?: DepositConfirmation;

  // Flextock integration
  flextockSubmission?: FlextockSubmission;
}
