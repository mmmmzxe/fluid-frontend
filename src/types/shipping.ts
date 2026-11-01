export interface Shipping {
  _id: string;
  government?: string;
  name?: string;
  description?: string;
  price?: number;
  estimatedDays?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}
