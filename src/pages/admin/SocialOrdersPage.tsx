import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import { socialOrderApi, SocialOrder, SocialProduct, SocialVariant, SellerStat } from '@/services/adminApi';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Plus,
  Eye,
  BarChart3,
  Package,
  User,
  Calendar,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  Loader2,
  TrendingUp,
  Search,
  Trash2,
  PlusCircle,
  Minus,
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

const SELLER_NAMES = ['Fatma', 'Mariam', 'Zeinab', 'Sara'] as const;
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

function orderSerial(_order: SocialOrder, index: number) {
  return `#${String(index + 1).padStart(4, '0')}`;
}

// ─── Product row state ─────────────────────────────────────────────────────────
interface VariantRow {
  id: string;
  color: string;
  size: string;
  quantity: string;
}

interface ProductRow {
  id: string;
  productName: string;
  price: string;
  productNotes: string;
  imageFile: File | null;
  imagePreview: string | null;
  variants: VariantRow[];
}

function makeVariant(): VariantRow {
  return { id: crypto.randomUUID(), color: '', size: '', quantity: '1' };
}
function makeProduct(): ProductRow {
  return {
    id: crypto.randomUUID(),
    productName: '',
    price: '',
    productNotes: '',
    imageFile: null,
    imagePreview: null,
    variants: [makeVariant()],
  };
}

// ─── Product Card Component ────────────────────────────────────────────────────
interface ProductCardProps {
  product: ProductRow;
  index: number;
  canRemove: boolean;
  onChange: (updated: ProductRow) => void;
  onRemove: () => void;
}

function ProductCard({ product, index, canRemove, onChange, onRemove }: ProductCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof ProductRow, value: any) => {
    onChange({ ...product, [field]: value });
  };

  const updateVariant = (variantId: string, field: keyof VariantRow, value: string) => {
    onChange({
      ...product,
      variants: product.variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v)),
    });
  };

  const addVariant = () => {
    onChange({ ...product, variants: [...product.variants, makeVariant()] });
  };

  const removeVariant = (variantId: string) => {
    onChange({
      ...product,
      variants: product.variants.filter((v) => v.id !== variantId),
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      onChange({ ...product, imageFile: file, imagePreview: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/70 to-blue-50/40 p-5 space-y-4 shadow-sm relative">
      {/* Card header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white text-xs font-bold">
            {index + 1}
          </div>
          <h4 className="text-sm font-semibold text-gray-700">Product {index + 1}</h4>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Image upload */}
        <div className="sm:col-span-2">
          <Label className="text-xs font-medium text-gray-700 mb-1.5 block">Product Image (Optional)</Label>
          {product.imagePreview ? (
            <div className="relative inline-block">
              <img
                src={product.imagePreview}
                alt="preview"
                className="h-28 w-28 rounded-xl object-cover border border-purple-200 shadow-sm"
              />
              <button
                type="button"
                onClick={() => onChange({ ...product, imageFile: null, imagePreview: null })}
                className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-1.5 h-24 w-full rounded-xl border-2 border-dashed border-purple-200 bg-white cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-5 w-5 text-purple-400" />
              <span className="text-xs text-gray-500">Click to upload</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        {/* Product Name */}
        <div>
          <Label className="text-xs font-medium text-gray-700 mb-1 block">
            Product Name <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="e.g. Floral Dress"
            value={product.productName}
            onChange={(e) => updateField('productName', e.target.value)}
            className="bg-white border-purple-200 focus:border-purple-400 text-sm"
          />
        </div>

        {/* Price */}
        <div>
          <Label className="text-xs font-medium text-gray-700 mb-1 block">
            Price (EGP) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={product.price}
            onChange={(e) => updateField('price', e.target.value)}
            className="bg-white border-purple-200 focus:border-purple-400 text-sm"
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <Label className="text-xs font-medium text-gray-700 mb-1 block">Product Notes</Label>
          <Textarea
            rows={2}
            placeholder="Any special notes for this product..."
            value={product.productNotes}
            onChange={(e) => updateField('productNotes', e.target.value)}
            className="bg-white border-purple-200 resize-none text-sm"
          />
        </div>
      </div>

      {/* ── Variants (color → shows size + qty) ─────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-purple-800 uppercase tracking-wide">
            Color / Size / Quantity Variants
          </p>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 text-xs font-medium text-purple-700 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 px-2.5 py-1 rounded-lg transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add Variant
          </button>
        </div>

        {product.variants.map((variant, vi) => (
          <div
            key={variant.id}
            className="rounded-xl border border-purple-100 bg-white/80 p-3 space-y-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500">Variant {vi + 1}</span>
              {product.variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(variant.id)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Color */}
              <div>
                <Label className="text-[10px] font-medium text-gray-600 mb-0.5 block">Color</Label>
                <Input
                  placeholder="e.g. Red"
                  value={variant.color}
                  onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                  className="bg-white border-purple-100 text-xs h-8"
                />
              </div>

              {/* Size — shown always, hint text explains */}
              <div>
                <Label className="text-[10px] font-medium text-gray-600 mb-0.5 block">
                  Size {variant.color ? '' : '(optional)'}
                </Label>
                <Input
                  placeholder={variant.color ? 'e.g. M, 38' : 'e.g. M'}
                  value={variant.size}
                  onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                  className="bg-white border-purple-100 text-xs h-8"
                />
              </div>

              {/* Quantity */}
              <div>
                <Label className="text-[10px] font-medium text-gray-600 mb-0.5 block">
                  Qty <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={variant.quantity}
                  onChange={(e) => updateVariant(variant.id, 'quantity', e.target.value)}
                  className="bg-white border-purple-100 text-xs h-8"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Create Order Form ────────────────────────────────────────────────────────
interface CreateFormProps {
  sellerName: SellerName | '';
  isSuperAdmin: boolean;
  onCreated: () => void;
}

function CreateOrderForm({ sellerName, isSuperAdmin, onCreated }: CreateFormProps) {
  const [selectedSeller, setSelectedSeller] = useState<SellerName | ''>(sellerName);
  const [products, setProducts] = useState<ProductRow[]>([makeProduct()]);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositFile, setDepositFile] = useState<File | null>(null);
  const [depositPreview, setDepositPreview] = useState<string | null>(null);
  const depositInputRef = useRef<HTMLInputElement>(null);

  // Customer/delivery fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [city, setCity] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) setSelectedSeller(sellerName);
  }, [sellerName, isSuperAdmin]);

  const updateProduct = (id: string, updated: ProductRow) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };
  const removeProduct = (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id));
  const addProduct = () => setProducts((prev) => [...prev, makeProduct()]);

  const handleDepositImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDepositFile(file);
    const reader = new FileReader();
    reader.onload = () => setDepositPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setProducts([makeProduct()]);
    setDepositAmount('');
    setDepositFile(null);
    setDepositPreview(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCity('');
    setDeliveryNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeller) { toast.error('Please select "Created By".'); return; }
    if (!customerName || !customerPhone || !customerAddress || !city) {
      toast.error('Please fill in all customer fields.'); return;
    }
    for (const p of products) {
      if (!p.productName || !p.price) {
        toast.error('Each product must have a name and price.'); return;
      }
      for (const v of p.variants) {
        if (!v.quantity || Number(v.quantity) < 1) {
          toast.error('Each variant must have a quantity ≥ 1.'); return;
        }
      }
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('createdBy', selectedSeller);
      fd.append('customerName', customerName);
      fd.append('customerPhone', customerPhone);
      fd.append('customerAddress', customerAddress);
      fd.append('city', city);
      if (deliveryNotes) fd.append('deliveryNotes', deliveryNotes);
      if (depositAmount) fd.append('deposit', depositAmount);
      if (depositFile) fd.append('depositImage', depositFile);

      // Serialize products (without images — those go as separate files)
      const productsJson: SocialProduct[] = products.map((p) => ({
        productName: p.productName,
        price: Number(p.price),
        productNotes: p.productNotes || undefined,
        variants: p.variants.map((v) => ({
          color: v.color || undefined,
          size: v.size || undefined,
          quantity: Number(v.quantity),
        })),
      }));
      fd.append('products', JSON.stringify(productsJson));

      // Append product images with indexed field names
      products.forEach((p, i) => {
        if (p.imageFile) fd.append(`productImage_${i}`, p.imageFile);
      });

      await socialOrderApi.create(fd);
      toast.success('Order created successfully!');
      resetForm();
      onCreated();
    } catch {
      // error handled by axios interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Products Section ───────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white">
              <Package className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">
              Products <span className="text-xs font-normal text-gray-400 ml-1">({products.length})</span>
            </h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addProduct}
            className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-400 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        </div>

        {products.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            index={i}
            canRemove={products.length > 1}
            onChange={(updated) => updateProduct(p.id, updated)}
            onRemove={() => removeProduct(p.id)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Customer / Delivery ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <User className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">Customer & Delivery</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Customer Name <span className="text-red-500">*</span>
              </Label>
              <Input placeholder="Full name" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                className="bg-white border-blue-200 focus:border-blue-400" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input placeholder="01XXXXXXXXX" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                className="bg-white border-blue-200" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                City / Area <span className="text-red-500">*</span>
              </Label>
              <Input placeholder="e.g. Cairo" value={city} onChange={(e) => setCity(e.target.value)}
                className="bg-white border-blue-200" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Delivery Address <span className="text-red-500">*</span>
              </Label>
              <Input placeholder="Street, building, apartment..." value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)} className="bg-white border-blue-200" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">Delivery Notes</Label>
            <Textarea rows={2} placeholder="Any special delivery instructions..." value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)} className="bg-white border-blue-200 resize-none" />
          </div>
        </div>

        {/* ── Deposit + Seller ───────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Deposit */}
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Check className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">
                Deposit <span className="text-xs font-normal text-gray-400">(Optional)</span>
              </h3>
            </div>

            <div>
              <Label className="text-sm font-medium text-emerald-700 mb-1 block">Deposit Amount (EGP)</Label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-white border-emerald-200 focus:border-emerald-400" />
            </div>

            <div>
              <Label className="text-sm font-medium text-emerald-800 mb-2 block">Deposit Receipt Image</Label>
              {depositPreview ? (
                <div className="relative inline-block">
                  <img src={depositPreview} alt="deposit-preview"
                    className="h-28 w-28 rounded-xl object-cover border border-emerald-300 shadow-sm" />
                  <button type="button"
                    onClick={() => { setDepositFile(null); setDepositPreview(null); if (depositInputRef.current) depositInputRef.current.value = ''; }}
                    className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-1.5 h-24 w-full rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/70 transition-all"
                  onClick={() => depositInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-800">Upload Deposit Receipt</span>
                </div>
              )}
              <input ref={depositInputRef} type="file" accept="image/*" className="hidden" onChange={handleDepositImageChange} />
            </div>
          </div>

          {/* Created By */}
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
                  {SELLER_NAMES.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
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
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
        >
          {submitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Order...</>
          ) : (
            <><Plus className="mr-2 h-4 w-4" />Create Order</>
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
        <Check className="h-3 w-3" />Confirmed
      </span>
    );
  }
  if (s === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <X className="h-3 w-3" />Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <Loader2 className="h-3 w-3 animate-spin text-amber-500" />Pending
    </span>
  );
}

/** Get a display summary of an order's products */
function getProductSummary(order: SocialOrder): { name: string; thumb?: string; extraCount: number } {
  if (order.products && order.products.length > 0) {
    const first = order.products[0];
    return {
      name: first.productName,
      thumb: first.productImage?.secure_url,
      extraCount: order.products.length - 1,
    };
  }
  // Legacy
  return { name: order.productName || '—', thumb: order.productImage?.secure_url, extraCount: 0 };
}

/** Total quantity across all products+variants */
function getTotalQty(order: SocialOrder): number {
  if (order.products && order.products.length > 0) {
    return order.products.reduce(
      (sum, p) => sum + p.variants.reduce((s, v) => s + (v.quantity || 0), 0), 0,
    );
  }
  return order.quantity || 0;
}

/** Total price across all products */
function getTotalPrice(order: SocialOrder): number {
  if (order.products && order.products.length > 0) {
    return order.products.reduce((sum, p) => {
      const qty = p.variants.reduce((s, v) => s + (v.quantity || 0), 0);
      return sum + p.price * qty;
    }, 0);
  }
  return (order.price ?? 0) * (order.quantity ?? 1);
}

function OrdersTable({ orders, loading, showSeller = false, isSuperAdmin = false, onView, onStatusChange }: OrdersTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatus = async (e: React.MouseEvent, id: string, status: 'confirmed' | 'cancelled') => {
    e.stopPropagation();
    if (!onStatusChange) return;
    setUpdatingId(id);
    try { await onStatusChange(id, status); } finally { setUpdatingId(null); }
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
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              {showSeller && (<th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller</th>)}
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {orders.map((order, i) => {
              const summary = getProductSummary(order);
              const totalQty = getTotalQty(order);
              const totalPrice = getTotalPrice(order);
              const productCount = order.products?.length ?? 1;

              return (
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
                      {summary.thumb ? (
                        <img src={summary.thumb} alt={summary.name}
                          className="h-10 w-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate max-w-[140px]">{summary.name}</p>
                        <p className="text-xs text-gray-500">
                          {productCount > 1 ? `+${summary.extraCount} more · ` : ''}Qty: {totalQty}
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
                  <td className="py-4 px-4"><StatusBadge status={order.status} /></td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-800 text-sm">
                      {totalPrice.toLocaleString()} EGP
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {isSuperAdmin && (
                        <>
                          <Button size="sm" variant="outline"
                            disabled={updatingId === order._id || order.status === 'confirmed'}
                            className="h-8 px-2.5 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 disabled:opacity-40"
                            onClick={(e) => handleStatus(e, order._id, 'confirmed')} title="Confirm Order">
                            <Check className="h-3.5 w-3.5 mr-1" />Confirm
                          </Button>
                          <Button size="sm" variant="outline"
                            disabled={updatingId === order._id || order.status === 'cancelled'}
                            className="h-8 px-2.5 bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:text-rose-800 disabled:opacity-40"
                            onClick={(e) => handleStatus(e, order._id, 'cancelled')} title="Cancel Order">
                            <X className="h-3.5 w-3.5 mr-1" />Cancel
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost"
                        className="h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        onClick={(e) => { e.stopPropagation(); onView(order._id); }}>
                        <Eye className="h-4 w-4 mr-1" />View
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Seller Stats ─────────────────────────────────────────────────────────────
interface SellerStatsViewProps { stats: SellerStat[]; loading: boolean; }

const SELLER_COLORS: Record<string, { bg: string; ring: string; text: string; gradient: string }> = {
  Fatma:  { bg: 'bg-pink-50',   ring: 'ring-pink-200',   text: 'text-pink-700',   gradient: 'from-pink-500 to-rose-500' },
  Mariam: { bg: 'bg-purple-50', ring: 'ring-purple-200', text: 'text-purple-700', gradient: 'from-purple-500 to-indigo-500' },
  Zeinab: { bg: 'bg-blue-50',   ring: 'ring-blue-200',   text: 'text-blue-700',   gradient: 'from-blue-500 to-cyan-500' },
};

function SellerStatsView({ stats, loading }: SellerStatsViewProps) {
  if (loading) {
    return (<div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></div>);
  }

  const totalCreated = stats.reduce((acc, s) => acc + (s.count || 0), 0);
  const totalConfirmed = stats.reduce((acc, s) => acc + (s.confirmedCount || 0), 0);
  const totalPending = stats.reduce((acc, s) => acc + (s.pendingCount || 0), 0);
  const totalCancelled = stats.reduce((acc, s) => acc + (s.cancelledCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat) => {
          const colors = SELLER_COLORS[stat.seller] ?? SELLER_COLORS['Fatma'];
          const pct = totalCreated > 0 ? Math.round((stat.count / totalCreated) * 100) : 0;
          return (
            <div key={stat.seller}
              className={`relative overflow-hidden rounded-2xl ${colors.bg} ring-1 ${colors.ring} p-6 flex flex-col justify-between gap-4 shadow-sm`}>
              <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${colors.gradient} opacity-10`} />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} text-white text-lg font-bold shadow-md`}>
                    {stat.seller[0]}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} ring-1 ${colors.ring}`}>{pct}% of Total</span>
                </div>
                <h3 className={`text-lg font-bold ${colors.text}`}>{stat.seller}</h3>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{stat.count.toLocaleString()}</p>
                <p className="text-xs text-gray-500 font-medium">Total Orders Created</p>
              </div>
              <div className="space-y-2 pt-3 border-t border-gray-200/60">
                <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-800 font-medium border border-emerald-100">
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Confirmed</span>
                  <span className="font-bold text-emerald-900">{(stat.confirmedCount || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-amber-50 text-amber-800 font-medium border border-amber-100">
                  <span className="flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" /> Pending</span>
                  <span className="font-bold text-amber-900">{(stat.pendingCount || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-rose-50 text-rose-800 font-medium border border-rose-100">
                  <span className="flex items-center gap-1.5"><X className="h-3.5 w-3.5 text-rose-500" /> Cancelled</span>
                  <span className="font-bold text-rose-900">{(stat.cancelledCount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Created', value: totalCreated, icon: TrendingUp, bg: 'from-purple-500 to-blue-500', border: 'border-gray-100', textColor: 'text-gray-800' },
          { label: 'Confirmed', value: totalConfirmed, icon: Check, bg: 'bg-emerald-500', border: 'border-emerald-100', textColor: 'text-emerald-900', cardBg: 'bg-emerald-50/50' },
          { label: 'Pending', value: totalPending, icon: Loader2, bg: 'bg-amber-500', border: 'border-amber-100', textColor: 'text-amber-900', cardBg: 'bg-amber-50/50' },
          { label: 'Cancelled', value: totalCancelled, icon: X, bg: 'bg-rose-500', border: 'border-rose-100', textColor: 'text-rose-900', cardBg: 'bg-rose-50/50' },
        ].map(({ label, value, icon: Icon, bg, border, textColor, cardBg }) => (
          <div key={label} className={`rounded-2xl border ${border} ${cardBg || 'bg-white'} p-5 flex items-center gap-4 shadow-sm`}>
            <div className={`h-12 w-12 rounded-xl ${bg.startsWith('from') ? `bg-gradient-to-br ${bg}` : bg} flex items-center justify-center text-white flex-shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
              <p className={`text-2xl font-bold ${textColor}`}>{value.toLocaleString()}</p>
            </div>
          </div>
        ))}
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

  const [adminTab, setAdminTab] = useState<AdminTab>('my-orders');
  const [superTab, setSuperTab] = useState<SuperAdminTab>('all-orders');

  const [myOrders, setMyOrders] = useState<SocialOrder[]>([]);
  const [allOrders, setAllOrders] = useState<SocialOrder[]>([]);
  const [stats, setStats] = useState<SellerStat[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sellerName = (user?.name as SellerName) ?? '';

  // Search helper — checks customer + all products
  const matchesSearch = (order: SocialOrder, q: string): boolean => {
    if (order.customerName?.toLowerCase().includes(q)) return true;
    if (order.customerPhone?.includes(q)) return true;
    if (order.createdBy?.toLowerCase().includes(q)) return true;
    if (order.products?.some((p) => p.productName.toLowerCase().includes(q))) return true;
    if (order.productName?.toLowerCase().includes(q)) return true;
    return false;
  };

  const filteredMyOrders = useMemo(() => {
    if (!searchQuery.trim()) return myOrders;
    const q = searchQuery.toLowerCase().trim();
    return myOrders.filter((o) => matchesSearch(o, q));
  }, [myOrders, searchQuery]);

  const filteredAllOrders = useMemo(() => {
    if (!searchQuery.trim()) return allOrders;
    const q = searchQuery.toLowerCase().trim();
    return allOrders.filter((o) => matchesSearch(o, q));
  }, [allOrders, searchQuery]);

  const loadMyOrders = async () => {
    setLoadingOrders(true);
    try { const res = await socialOrderApi.getMyOrders(); setMyOrders(res.data); }
    catch { } finally { setLoadingOrders(false); }
  };

  const loadAllOrders = async () => {
    setLoadingOrders(true);
    try { const res = await socialOrderApi.getAll(); setAllOrders(res.data); }
    catch { } finally { setLoadingOrders(false); }
  };

  const loadStats = async () => {
    setLoadingStats(true);
    try { const res = await socialOrderApi.getStats(); setStats(res.data); }
    catch { } finally { setLoadingStats(false); }
  };

  useEffect(() => {
    if (isSuperAdmin) { loadAllOrders(); loadStats(); }
    else { loadMyOrders(); }
  }, [isSuperAdmin]);

  const handleView = (id: string) => navigate(`/admin/social-orders/${id}`);

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await socialOrderApi.updateStatus(id, status);
      toast.success(`Order ${status === 'confirmed' ? 'confirmed' : 'cancelled'} successfully!`);
      loadAllOrders();
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const SearchBar = (
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
      <Input type="text" placeholder="Search by customer name or phone..."
        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 pr-8 bg-white border-purple-200 focus:border-purple-400 rounded-xl text-sm" />
      {searchQuery && (
        <button onClick={() => setSearchQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 w-full">
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
          <Button onClick={() => setAdminTab('create')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-md shadow-purple-500/20 hover:scale-[1.02] transition-all">
            <Plus className="mr-2 h-4 w-4" />New Order
          </Button>
        )}
      </div>

      {/* ── Admin View ───────────────────────────────────── */}
      {!isSuperAdmin && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
              {([
                { id: 'my-orders', label: 'My Orders', icon: ShoppingBag },
                { id: 'create', label: 'Create New Order', icon: Plus },
              ] as { id: AdminTab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setAdminTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${adminTab === id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </div>
            {adminTab === 'my-orders' && SearchBar}
          </div>

          {adminTab === 'my-orders' && (
            <OrdersTable orders={filteredMyOrders} loading={loadingOrders} showSeller={false}
              isSuperAdmin={false} onView={handleView} />
          )}
          {adminTab === 'create' && (
            <div className="w-full">
              <CreateOrderForm sellerName={sellerName} isSuperAdmin={false}
                onCreated={() => { setAdminTab('my-orders'); loadMyOrders(); }} />
            </div>
          )}
        </>
      )}

      {/* ── Super Admin View ─────────────────────────────── */}
      {isSuperAdmin && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
              {([
                { id: 'all-orders', label: 'All Orders', icon: ShoppingBag },
                { id: 'stats', label: 'Seller Statistics', icon: BarChart3 },
              ] as { id: SuperAdminTab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setSuperTab(id as SuperAdminTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${superTab === id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </div>
            {superTab === 'all-orders' && SearchBar}
          </div>

          {superTab === 'all-orders' && (
            <OrdersTable orders={filteredAllOrders} loading={loadingOrders} showSeller={true}
              isSuperAdmin={true} onView={handleView} onStatusChange={handleStatusChange} />
          )}
          {superTab === 'stats' && (<SellerStatsView stats={stats} loading={loadingStats} />)}
        </>
      )}
    </div>
  );
};

export default SocialOrdersPage;
