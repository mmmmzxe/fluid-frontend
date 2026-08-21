import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import { socialOrderApi, SocialOrder, SellerStat } from '@/services/adminApi';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Plus,
  Eye,
  BarChart3,
  Package,
  User,
  Phone,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  ChevronRight,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SELLER_NAMES = ['Fatma', 'Mariam', 'Zeinab'] as const;
type SellerName = typeof SELLER_NAMES[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

function orderSerial(order: SocialOrder, index: number) {
  return `#${String(index + 1).padStart(4, '0')}`;
}

// ─── Create Order Form ────────────────────────────────────────────────────────
interface CreateFormProps {
  sellerName: SellerName | '';
  isSuperAdmin: boolean;
  onCreated: () => void;
}

const EMPTY_FORM = {
  productName: '',
  price: '',
  color: '',
  size: '',
  quantity: '1',
  productNotes: '',
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  city: '',
  deliveryNotes: '',
};

function CreateOrderForm({ sellerName, isSuperAdmin, onCreated }: CreateFormProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [selectedSeller, setSelectedSeller] = useState<SellerName | ''>(sellerName);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep seller locked for admin
  useEffect(() => {
    if (!isSuperAdmin) setSelectedSeller(sellerName);
  }, [sellerName, isSuperAdmin]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChange = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeller) {
      toast.error('Please select "Created By".');
      return;
    }
    if (!form.productName || !form.price || !form.customerName || !form.customerPhone || !form.customerAddress || !form.city) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('createdBy', selectedSeller);
      fd.append('productName', form.productName);
      fd.append('price', form.price);
      fd.append('quantity', form.quantity || '1');
      if (form.color) fd.append('color', form.color);
      if (form.size) fd.append('size', form.size);
      if (form.productNotes) fd.append('productNotes', form.productNotes);
      fd.append('customerName', form.customerName);
      fd.append('customerPhone', form.customerPhone);
      fd.append('customerAddress', form.customerAddress);
      fd.append('city', form.city);
      if (form.deliveryNotes) fd.append('deliveryNotes', form.deliveryNotes);
      if (imageFile) fd.append('productImage', imageFile);

      await socialOrderApi.create(fd);
      toast.success('Order created successfully!');
      setForm({ ...EMPTY_FORM });
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onCreated();
    } catch {
      // error handled by axios interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Product Section ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/60 to-blue-50/40 p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white">
            <Package className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">Product Information</h3>
        </div>

        {/* Image upload */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Product Image</Label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="preview"
                className="h-36 w-36 rounded-xl object-cover border border-purple-200 shadow-sm"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-2 h-36 w-full rounded-xl border-2 border-dashed border-purple-200 bg-white cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-6 w-6 text-purple-400" />
              <span className="text-sm text-gray-500">Click to upload image</span>
              <span className="text-xs text-gray-400">PNG, JPG up to 10MB</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="so-productName" className="text-sm font-medium text-gray-700 mb-1 block">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="so-productName"
              placeholder="e.g. Floral Summer Dress"
              value={form.productName}
              onChange={(e) => handleChange('productName', e.target.value)}
              className="bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400/20"
            />
          </div>
          <div>
            <Label htmlFor="so-price" className="text-sm font-medium text-gray-700 mb-1 block">
              Price (EGP) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="so-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className="bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400/20"
            />
          </div>
          <div>
            <Label htmlFor="so-color" className="text-sm font-medium text-gray-700 mb-1 block">Color</Label>
            <Input
              id="so-color"
              placeholder="e.g. Rose Gold"
              value={form.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="bg-white border-purple-200"
            />
          </div>
          <div>
            <Label htmlFor="so-size" className="text-sm font-medium text-gray-700 mb-1 block">Size</Label>
            <Input
              id="so-size"
              placeholder="e.g. M, L, XL or 38"
              value={form.size}
              onChange={(e) => handleChange('size', e.target.value)}
              className="bg-white border-purple-200"
            />
          </div>
          <div>
            <Label htmlFor="so-quantity" className="text-sm font-medium text-gray-700 mb-1 block">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="so-quantity"
              type="number"
              min="1"
              placeholder="1"
              value={form.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              className="bg-white border-purple-200"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="so-productNotes" className="text-sm font-medium text-gray-700 mb-1 block">Product Notes</Label>
          <Textarea
            id="so-productNotes"
            rows={2}
            placeholder="Any additional product details..."
            value={form.productNotes}
            onChange={(e) => handleChange('productNotes', e.target.value)}
            className="bg-white border-purple-200 resize-none"
          />
        </div>
      </div>

      {/* ── Customer / Delivery Section ───────────────────────────── */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <User className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">Customer & Delivery Information</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="so-customerName" className="text-sm font-medium text-gray-700 mb-1 block">
              Customer Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="so-customerName"
              placeholder="Full name"
              value={form.customerName}
              onChange={(e) => handleChange('customerName', e.target.value)}
              className="bg-white border-blue-200 focus:border-blue-400"
            />
          </div>
          <div>
            <Label htmlFor="so-customerPhone" className="text-sm font-medium text-gray-700 mb-1 block">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="so-customerPhone"
              placeholder="01XXXXXXXXX"
              value={form.customerPhone}
              onChange={(e) => handleChange('customerPhone', e.target.value)}
              className="bg-white border-blue-200"
            />
          </div>
          <div>
            <Label htmlFor="so-city" className="text-sm font-medium text-gray-700 mb-1 block">
              City / Area <span className="text-red-500">*</span>
            </Label>
            <Input
              id="so-city"
              placeholder="e.g. Cairo, Alexandria"
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="bg-white border-blue-200"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="so-customerAddress" className="text-sm font-medium text-gray-700 mb-1 block">
              Delivery Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="so-customerAddress"
              placeholder="Street, building, apartment..."
              value={form.customerAddress}
              onChange={(e) => handleChange('customerAddress', e.target.value)}
              className="bg-white border-blue-200"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="so-deliveryNotes" className="text-sm font-medium text-gray-700 mb-1 block">Delivery Notes</Label>
          <Textarea
            id="so-deliveryNotes"
            rows={2}
            placeholder="Any special delivery instructions..."
            value={form.deliveryNotes}
            onChange={(e) => handleChange('deliveryNotes', e.target.value)}
            className="bg-white border-blue-200 resize-none"
          />
        </div>
      </div>

      {/* ── Created By ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
            <User className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">Created By</h3>
        </div>
        {isSuperAdmin ? (
          <Select value={selectedSeller} onValueChange={(v) => setSelectedSeller(v as SellerName)}>
            <SelectTrigger id="so-createdBy" className="bg-white border-amber-200 w-full max-w-xs">
              <SelectValue placeholder="Select seller" />
            </SelectTrigger>
            <SelectContent>
              {SELLER_NAMES.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/30 text-amber-700 font-bold text-lg">
              {sellerName[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{sellerName}</p>
              <p className="text-xs text-gray-500">Logged-in seller (auto-assigned)</p>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Order...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── Orders Table ─────────────────────────────────────────────────────────────
interface OrdersTableProps {
  orders: SocialOrder[];
  loading: boolean;
  showSeller?: boolean;
  isSuperAdmin?: boolean;
  onView: (id: string) => void;
  onStatusChange?: (id: string, status: 'confirmed' | 'cancelled') => void;
}

function StatusBadge({ status }: { status: SocialOrder['status'] }) {
  const s = status || 'pending';
  if (s === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Check className="h-3 w-3" />
        Confirmed
      </span>
    );
  }
  if (s === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <X className="h-3 w-3" />
        Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
      Pending
    </span>
  );
}

function OrdersTable({ orders, loading, showSeller = false, isSuperAdmin = false, onView, onStatusChange }: OrdersTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatus = async (e: React.MouseEvent, id: string, status: 'confirmed' | 'cancelled') => {
    e.stopPropagation();
    if (!onStatusChange) return;
    setUpdatingId(id);
    try {
      await onStatusChange(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-gray-500 text-sm">Loading orders...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-16 w-16 rounded-2xl bg-purple-50 flex items-center justify-center">
          <ShoppingBag className="h-8 w-8 text-purple-300" />
        </div>
        <p className="text-gray-500 font-medium">No orders yet</p>
        <p className="text-gray-400 text-sm">Orders will appear here once created</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              {showSeller && (
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created By</th>
              )}
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {orders.map((order, i) => (
              <tr
                key={order._id}
                className="hover:bg-purple-50/30 transition-colors cursor-pointer group"
                onClick={() => onView(order._id)}
              >
                <td className="py-4 px-4">
                  <span className="font-semibold text-purple-700 text-sm">{orderSerial(order, i)}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {order.productImage?.secure_url ? (
                      <img
                        src={order.productImage.secure_url}
                        alt={order.productName}
                        className="h-10 w-10 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate max-w-[140px]">{order.productName}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {order.quantity}{order.color ? ` · ${order.color}` : ''}{order.size ? ` · ${order.size}` : ''}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm font-medium text-gray-800">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.customerPhone}</p>
                </td>
                {showSeller && (
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                      {order.createdBy}
                    </span>
                  </td>
                )}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(order.createdAt)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="py-4 px-4">
                  <span className="font-semibold text-gray-800 text-sm">
                    {(order.price * order.quantity).toLocaleString()} EGP
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-1.5">
                    {isSuperAdmin && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === order._id || order.status === 'confirmed'}
                          className="h-8 px-2.5 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 disabled:opacity-40"
                          onClick={(e) => handleStatus(e, order._id, 'confirmed')}
                          title="Confirm Order"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === order._id || order.status === 'cancelled'}
                          className="h-8 px-2.5 bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:text-rose-800 disabled:opacity-40"
                          onClick={(e) => handleStatus(e, order._id, 'cancelled')}
                          title="Cancel Order"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      onClick={(e) => { e.stopPropagation(); onView(order._id); }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Seller Stats ─────────────────────────────────────────────────────────────
interface SellerStatsViewProps {
  stats: SellerStat[];
  loading: boolean;
}

const SELLER_COLORS: Record<string, { bg: string; ring: string; text: string; gradient: string }> = {
  Fatma:  { bg: 'bg-pink-50',   ring: 'ring-pink-200',   text: 'text-pink-700',   gradient: 'from-pink-500 to-rose-500' },
  Mariam: { bg: 'bg-purple-50', ring: 'ring-purple-200', text: 'text-purple-700', gradient: 'from-purple-500 to-indigo-500' },
  Zeinab: { bg: 'bg-blue-50',   ring: 'ring-blue-200',   text: 'text-blue-700',   gradient: 'from-blue-500 to-cyan-500' },
};

function SellerStatsView({ stats, loading }: SellerStatsViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const totalCreated = stats.reduce((acc, s) => acc + (s.count || 0), 0);
  const totalConfirmed = stats.reduce((acc, s) => acc + (s.confirmedCount || 0), 0);
  const totalPending = stats.reduce((acc, s) => acc + (s.pendingCount || 0), 0);
  const totalCancelled = stats.reduce((acc, s) => acc + (s.cancelledCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Seller Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat) => {
          const colors = SELLER_COLORS[stat.seller] ?? SELLER_COLORS['Fatma'];
          const pct = totalCreated > 0 ? Math.round((stat.count / totalCreated) * 100) : 0;
          return (
            <div
              key={stat.seller}
              className={`relative overflow-hidden rounded-2xl ${colors.bg} ring-1 ${colors.ring} p-6 flex flex-col justify-between gap-4 shadow-sm`}
            >
              {/* Decorative background circle */}
              <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${colors.gradient} opacity-10`} />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} text-white text-lg font-bold shadow-md`}>
                    {stat.seller[0]}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} ring-1 ${colors.ring}`}>
                    {pct}% of Total
                  </span>
                </div>
                
                <h3 className={`text-lg font-bold ${colors.text}`}>{stat.seller}</h3>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{stat.count.toLocaleString()}</p>
                <p className="text-xs text-gray-500 font-medium">Total Orders Created</p>
              </div>

              {/* Status Breakdown Pills */}
              <div className="space-y-2 pt-3 border-t border-gray-200/60">
                <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-800 font-medium border border-emerald-100">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Confirmed
                  </span>
                  <span className="font-bold text-emerald-900">{(stat.confirmedCount || 0).toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-amber-50 text-amber-800 font-medium border border-amber-100">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" /> Pending
                  </span>
                  <span className="font-bold text-amber-900">{(stat.pendingCount || 0).toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-rose-50 text-rose-800 font-medium border border-rose-100">
                  <span className="flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5 text-rose-500" /> Cancelled
                  </span>
                  <span className="font-bold text-rose-900">{(stat.cancelledCount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Created</p>
            <p className="text-2xl font-bold text-gray-800">{totalCreated.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide">Confirmed</p>
            <p className="text-2xl font-bold text-emerald-900">{totalConfirmed.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center text-white flex-shrink-0">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-amber-900">{totalPending.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-rose-500 flex items-center justify-center text-white flex-shrink-0">
            <X className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-rose-700 font-medium uppercase tracking-wide">Cancelled</p>
            <p className="text-2xl font-bold text-rose-900">{totalCancelled.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type AdminTab = 'my-orders' | 'create';
type SuperAdminTab = 'all-orders' | 'stats';

const SocialOrdersPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'superAdmin';

  // Tabs
  const [adminTab, setAdminTab] = useState<AdminTab>('my-orders');
  const [superTab, setSuperTab] = useState<SuperAdminTab>('all-orders');

  // Data
  const [myOrders, setMyOrders] = useState<SocialOrder[]>([]);
  const [allOrders, setAllOrders] = useState<SocialOrder[]>([]);
  const [stats, setStats] = useState<SellerStat[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  // Determine seller name for admin
  const sellerName = (user?.name as SellerName) ?? '';

  const loadMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await socialOrderApi.getMyOrders();
      setMyOrders(res.data);
    } catch { /* handled by interceptor */ } finally {
      setLoadingOrders(false);
    }
  };

  const loadAllOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await socialOrderApi.getAll();
      setAllOrders(res.data);
    } catch { } finally {
      setLoadingOrders(false);
    }
  };

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await socialOrderApi.getStats();
      setStats(res.data);
    } catch { } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadAllOrders();
      loadStats();
    } else {
      loadMyOrders();
    }
  }, [isSuperAdmin]);

  const handleView = (id: string) => navigate(`/admin/social-orders/${id}`);

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await socialOrderApi.updateStatus(id, status);
      toast.success(`Order ${status === 'confirmed' ? 'confirmed' : 'cancelled'} successfully!`);
      loadAllOrders();
    } catch {
      toast.error(`Failed to update order status`);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Social Media Orders</h1>
            <p className="text-sm text-gray-500">
              {isSuperAdmin ? 'Monitor all seller orders' : `Welcome, ${sellerName}`}
            </p>
          </div>
        </div>
        {!isSuperAdmin && (
          <Button
            onClick={() => setAdminTab('create')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-md shadow-purple-500/20 hover:scale-[1.02] transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        )}
      </div>

      {/* ── Admin View ───────────────────────────────────── */}
      {!isSuperAdmin && (
        <>
          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            {([
              { id: 'my-orders', label: 'My Orders', icon: ShoppingBag },
              { id: 'create', label: 'Create New Order', icon: Plus },
            ] as { id: AdminTab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAdminTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  adminTab === id
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {adminTab === 'my-orders' && (
            <OrdersTable
              orders={myOrders}
              loading={loadingOrders}
              showSeller={false}
              isSuperAdmin={false}
              onView={handleView}
            />
          )}
          {adminTab === 'create' && (
            <div className="max-w-2xl">
              <CreateOrderForm
                sellerName={sellerName}
                isSuperAdmin={false}
                onCreated={() => { setAdminTab('my-orders'); loadMyOrders(); }}
              />
            </div>
          )}
        </>
      )}

      {/* ── Super Admin View ─────────────────────────────── */}
      {isSuperAdmin && (
        <>
          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            {([
              { id: 'all-orders', label: 'All Orders', icon: ShoppingBag },
              { id: 'stats', label: 'Seller Statistics', icon: BarChart3 },
            ] as { id: SuperAdminTab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSuperTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  superTab === id
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {superTab === 'all-orders' && (
            <OrdersTable
              orders={allOrders}
              loading={loadingOrders}
              showSeller={true}
              isSuperAdmin={true}
              onView={handleView}
              onStatusChange={handleStatusChange}
            />
          )}
          {superTab === 'stats' && (
            <SellerStatsView stats={stats} loading={loadingStats} />
          )}
        </>
      )}
    </div>
  );

};

export default SocialOrdersPage;
