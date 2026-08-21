import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import { socialOrderApi, SocialOrder } from '@/services/adminApi';
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Loader2,
  ShoppingBag,
  Tag,
  Palette,
  Ruler,
  Hash,
  FileText,
  Building,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value?: string | number;
  iconColor?: string;
}
function InfoRow({ icon: Icon, label, value, iconColor = 'text-gray-400' }: InfoRowProps) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const SocialOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);
  const isSuperAdmin = user?.role === 'superAdmin';

  const [order, setOrder] = useState<SocialOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await socialOrderApi.getById(id);
        setOrder(res.data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-sm text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <ShoppingBag className="h-8 w-8 text-red-300" />
        </div>
        <p className="text-gray-600 font-medium">{error || 'Order not found'}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const totalPrice = order.price * order.quantity;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="rounded-lg hover:bg-purple-50 text-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-purple-600" />
          <h1 className="text-lg font-bold text-gray-900">Order Detail</h1>
        </div>
        {/* Read-only badge */}
        <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
          <Lock className="h-3 w-3" />
          Read-only
        </span>
      </div>

      {/* Meta bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50 px-5 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          <span className="text-sm text-gray-600">Created <span className="font-semibold text-gray-800">{formatDate(order.createdAt)}</span></span>
        </div>
        <div className="h-4 w-px bg-purple-200" />
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-purple-500" />
          <span className="text-sm text-gray-600">By <span className="font-semibold text-purple-700">{order.createdBy}</span></span>
        </div>
        {isSuperAdmin && typeof order.createdByUserId === 'object' && (
          <>
            <div className="h-4 w-px bg-purple-200" />
            <span className="text-xs text-gray-500">{(order.createdByUserId as any).email}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── Product Card ──────────────────────────────────── */}
        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Package className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-gray-800">Product</h2>
          </div>

          {/* Product image */}
          {order.productImage?.secure_url ? (
            <div className="mb-4">
              <img
                src={order.productImage.secure_url}
                alt={order.productName}
                className="h-48 w-full object-cover rounded-xl border border-gray-100"
              />
            </div>
          ) : (
            <div className="mb-4 h-32 w-full rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-gray-300" />
            </div>
          )}

          <InfoRow icon={Tag} label="Product Name" value={order.productName} iconColor="text-purple-400" />
          <InfoRow icon={Hash} label="Price" value={`${order.price.toLocaleString()} EGP`} iconColor="text-purple-400" />
          <InfoRow icon={Hash} label="Quantity" value={order.quantity} iconColor="text-purple-400" />
          <InfoRow icon={Palette} label="Color" value={order.color} iconColor="text-purple-400" />
          <InfoRow icon={Ruler} label="Size" value={order.size} iconColor="text-purple-400" />
          <InfoRow icon={FileText} label="Product Notes" value={order.productNotes} iconColor="text-purple-400" />

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-lg font-bold text-purple-700">{totalPrice.toLocaleString()} EGP</span>
          </div>
        </div>

        {/* ── Customer Card ─────────────────────────────────── */}
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <User className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-gray-800">Customer & Delivery</h2>
          </div>

          <InfoRow icon={User} label="Customer Name" value={order.customerName} iconColor="text-blue-400" />
          <InfoRow icon={Phone} label="Phone" value={order.customerPhone} iconColor="text-blue-400" />
          <InfoRow icon={Building} label="City / Area" value={order.city} iconColor="text-blue-400" />
          <InfoRow icon={MapPin} label="Address" value={order.customerAddress} iconColor="text-blue-400" />
          <InfoRow icon={FileText} label="Delivery Notes" value={order.deliveryNotes} iconColor="text-blue-400" />
        </div>
      </div>

      {/* Immutability notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
        <Lock className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          This order is <strong>read-only</strong>. Social media orders cannot be modified after creation.
        </p>
      </div>
    </div>
  );
};

export default SocialOrderDetail;
