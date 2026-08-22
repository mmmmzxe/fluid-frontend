import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import { socialOrderApi, SocialOrder, SocialProduct } from '@/services/adminApi';
import { toast } from 'sonner';
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
  Check,
  X,
  Edit,
  History,
  Upload,
  AlertCircle,
  PlusCircle,
  Trash2,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }).format(new Date(iso));
  } catch { return iso; }
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
      <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}><Icon className="h-4 w-4" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

// ─── Edit form helpers ─────────────────────────────────────────────────────────
interface EditVariant { id: string; color: string; size: string; quantity: string; }
interface EditProduct {
  id: string;
  productName: string;
  price: string;
  productNotes: string;
  imageFile: File | null;
  imagePreview: string | null;
  existingImage?: { secure_url: string; public_id: string };
  variants: EditVariant[];
}

function makeEditVariant(color = '', size = '', quantity = 1): EditVariant {
  return { id: crypto.randomUUID(), color, size, quantity: String(quantity) };
}
function makeEditProduct(): EditProduct {
  return {
    id: crypto.randomUUID(),
    productName: '', price: '', productNotes: '',
    imageFile: null, imagePreview: null,
    variants: [makeEditVariant()],
  };
}

function productToEdit(p: SocialProduct): EditProduct {
  return {
    id: crypto.randomUUID(),
    productName: p.productName,
    price: String(p.price),
    productNotes: p.productNotes || '',
    imageFile: null,
    imagePreview: p.productImage?.secure_url || null,
    existingImage: p.productImage,
    variants: p.variants.length > 0
      ? p.variants.map((v) => makeEditVariant(v.color, v.size, v.quantity))
      : [makeEditVariant()],
  };
}

// ─── EditProductCard ───────────────────────────────────────────────────────────
interface EditProductCardProps {
  product: EditProduct;
  index: number;
  canRemove: boolean;
  onChange: (updated: EditProduct) => void;
  onRemove: () => void;
}

function EditProductCard({ product, index, canRemove, onChange, onRemove }: EditProductCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof EditProduct, value: any) => onChange({ ...product, [field]: value });
  const updateVariant = (vid: string, field: keyof EditVariant, value: string) =>
    onChange({ ...product, variants: product.variants.map((v) => (v.id === vid ? { ...v, [field]: value } : v)) });
  const addVariant = () => onChange({ ...product, variants: [...product.variants, makeEditVariant()] });
  const removeVariant = (vid: string) =>
    onChange({ ...product, variants: product.variants.filter((v) => v.id !== vid) });

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => onChange({ ...product, imageFile: f, imagePreview: r.result as string });
    r.readAsDataURL(f);
  };

  return (
    <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-purple-600 text-white text-[10px] font-bold">{index + 1}</div>
          Product {index + 1}
        </span>
        {canRemove && (
          <button type="button" onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Image */}
      <div>
        <Label className="text-[10px] font-medium text-gray-600 mb-1 block">Product Image</Label>
        {product.imagePreview ? (
          <div className="relative inline-block">
            <img src={product.imagePreview} alt="preview"
              className="h-20 w-20 rounded-lg object-cover border border-purple-200 shadow-sm" />
            <button type="button"
              onClick={() => onChange({ ...product, imageFile: null, imagePreview: null, existingImage: undefined })}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white">
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 h-20 w-full rounded-lg border-2 border-dashed border-purple-200 bg-white cursor-pointer hover:border-purple-400 transition-colors"
            onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 text-purple-400" />
            <span className="text-[10px] text-gray-500">Upload image</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] font-medium text-gray-600 mb-0.5 block">Product Name *</Label>
          <Input value={product.productName} onChange={(e) => updateField('productName', e.target.value)}
            className="h-8 text-xs bg-white" required />
        </div>
        <div>
          <Label className="text-[10px] font-medium text-gray-600 mb-0.5 block">Price (EGP) *</Label>
          <Input type="number" value={product.price} onChange={(e) => updateField('price', e.target.value)}
            className="h-8 text-xs bg-white" required />
        </div>
        <div className="col-span-2">
          <Label className="text-[10px] font-medium text-gray-600 mb-0.5 block">Notes</Label>
          <Textarea rows={1} value={product.productNotes} onChange={(e) => updateField('productNotes', e.target.value)}
            className="text-xs bg-white resize-none" />
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wide">Variants</span>
          <button type="button" onClick={addVariant}
            className="flex items-center gap-1 text-[10px] font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 px-2 py-0.5 rounded-md transition-colors">
            <PlusCircle className="h-3 w-3" />Add
          </button>
        </div>
        {product.variants.map((v, vi) => (
          <div key={v.id} className="rounded-lg border border-purple-100 bg-white p-2 grid grid-cols-3 gap-2">
            <div>
              <Label className="text-[10px] text-gray-500 mb-0.5 block">Color</Label>
              <Input value={v.color} placeholder="e.g. Red"
                onChange={(e) => updateVariant(v.id, 'color', e.target.value)} className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-[10px] text-gray-500 mb-0.5 block">Size</Label>
              <Input value={v.size} placeholder="e.g. M"
                onChange={(e) => updateVariant(v.id, 'size', e.target.value)} className="h-7 text-xs" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-gray-500 mb-0.5 block">Qty *</Label>
                {product.variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(v.id)}
                    className="h-3.5 w-3.5 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 mb-0.5">
                    <Minus className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
              <Input type="number" min="1" value={v.quantity}
                onChange={(e) => updateVariant(v.id, 'quantity', e.target.value)} className="h-7 text-xs" required />
            </div>
          </div>
        ))}
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
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editProducts, setEditProducts] = useState<EditProduct[]>([makeEditProduct()]);
  const [editDeposit, setEditDeposit] = useState('');
  const [editDepositFile, setEditDepositFile] = useState<File | null>(null);
  const [editDepositPreview, setEditDepositPreview] = useState<string | null>(null);
  const depositRef = useRef<HTMLInputElement>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editCustomerAddress, setEditCustomerAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editDeliveryNotes, setEditDeliveryNotes] = useState('');

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const res = await socialOrderApi.getById(id);
      setOrder(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load order');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const openEditModal = () => {
    if (!order) return;
    // Convert existing products to edit form
    if (order.products && order.products.length > 0) {
      setEditProducts(order.products.map(productToEdit));
    } else {
      // Legacy
      setEditProducts([{
        id: crypto.randomUUID(),
        productName: order.productName || '',
        price: String(order.price || ''),
        productNotes: order.productNotes || '',
        imageFile: null,
        imagePreview: order.productImage?.secure_url || null,
        existingImage: order.productImage,
        variants: [makeEditVariant(order.color, order.size, order.quantity || 1)],
      }]);
    }
    setEditDeposit(String(order.deposit || ''));
    setEditDepositPreview(order.depositImage?.secure_url || null);
    setEditDepositFile(null);
    setEditCustomerName(order.customerName || '');
    setEditCustomerPhone(order.customerPhone || '');
    setEditCustomerAddress(order.customerAddress || '');
    setEditCity(order.city || '');
    setEditDeliveryNotes(order.deliveryNotes || '');
    setIsEditOpen(true);
  };

  const handleUpdateStatus = async (status: 'confirmed' | 'cancelled') => {
    if (!id) return;
    setUpdatingStatus(true);
    try {
      const res = await socialOrderApi.updateStatus(id, status);
      setOrder(res.data);
      toast.success(`Order ${status === 'confirmed' ? 'confirmed' : 'cancelled'} successfully!`);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingStatus(false); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingEdit(true);
    try {
      const fd = new FormData();

      // Build products JSON (without images)
      const productsJson = editProducts.map((p) => ({
        productName: p.productName,
        price: Number(p.price),
        productNotes: p.productNotes || undefined,
        // preserve existing image URL so backend knows it
        productImage: p.imageFile ? undefined : p.existingImage,
        variants: p.variants.map((v) => ({
          color: v.color || undefined,
          size: v.size || undefined,
          quantity: Number(v.quantity),
        })),
      }));
      fd.append('products', JSON.stringify(productsJson));

      // Append new product images
      editProducts.forEach((p, i) => {
        if (p.imageFile) fd.append(`productImage_${i}`, p.imageFile);
      });

      if (editDeposit) fd.append('deposit', editDeposit);
      if (editDepositFile) fd.append('depositImage', editDepositFile);
      fd.append('customerName', editCustomerName);
      fd.append('customerPhone', editCustomerPhone);
      fd.append('customerAddress', editCustomerAddress);
      fd.append('city', editCity);
      if (editDeliveryNotes) fd.append('deliveryNotes', editDeliveryNotes);

      const res = await socialOrderApi.update(id, fd);
      setOrder(res.data);
      setIsEditOpen(false);
      toast.success('Order updated! Sent for SuperAdmin re-confirmation.');
    } catch {
      // handled by interceptor
    } finally { setSubmittingEdit(false); }
  };

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
          <ArrowLeft className="mr-2 h-4 w-4" />Go Back
        </Button>
      </div>
    );
  }

  const isOwner =
    user?.role === 'admin' &&
    (order.createdBy?.toLowerCase() === user.name?.toLowerCase() ||
      (typeof order.createdByUserId === 'object'
        ? (order.createdByUserId as any)?._id === user._id
        : order.createdByUserId === user._id));

  const canEdit = isSuperAdmin || isOwner;
  const hasHistory = order.editHistory && order.editHistory.length > 0;

  // Resolve products array (new or legacy)
  const displayProducts: SocialProduct[] =
    order.products && order.products.length > 0
      ? order.products
      : order.productName
      ? [
          {
            productName: order.productName,
            productImage: order.productImage,
            price: order.price ?? 0,
            productNotes: order.productNotes,
            variants: [{ color: order.color, size: order.size, quantity: order.quantity ?? 1 }],
          },
        ]
      : [];

  const totalOrderPrice = displayProducts.reduce(
    (sum, p) => sum + p.price * p.variants.reduce((s, v) => s + v.quantity, 0), 0,
  );

  return (
    <div className="w-full space-y-6">
      {/* Back + Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}
            className="rounded-lg hover:bg-purple-50 text-gray-600">
            <ArrowLeft className="mr-2 h-4 w-4" />Back
          </Button>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-purple-600" />
            <h1 className="text-lg font-bold text-gray-900">Order Detail</h1>
          </div>
        </div>
        {canEdit && (
          <Button onClick={openEditModal} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm">
            <Edit className="mr-2 h-4 w-4" />Edit Order
          </Button>
        )}
      </div>

      {/* Re-confirmation Notice */}
      {hasHistory && order.status === 'pending' && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-bold">Order Edited - Awaiting SuperAdmin Re-Confirmation</p>
            <p>This order was updated and requires new approval from SuperAdmin.</p>
          </div>
        </div>
      )}

      {/* Meta bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50 px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
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
        <div>
          {order.status === 'confirmed' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Check className="h-3.5 w-3.5" /> Confirmed
            </span>
          )}
          {order.status === 'cancelled' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
              <X className="h-3.5 w-3.5" /> Cancelled
            </span>
          )}
          {(!order.status || order.status === 'pending') && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" /> Pending
            </span>
          )}
        </div>
      </div>

      {/* SuperAdmin Actions */}
      {isSuperAdmin && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <span className="text-sm font-semibold text-gray-700">Order Actions:</span>
          <Button disabled={updatingStatus || order.status === 'confirmed'}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
            onClick={() => handleUpdateStatus('confirmed')}>
            <Check className="mr-1.5 h-4 w-4" />Confirm Order
          </Button>
          <Button variant="outline"
            disabled={updatingStatus || order.status === 'cancelled'}
            className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-xl"
            onClick={() => handleUpdateStatus('cancelled')}>
            <X className="mr-1.5 h-4 w-4" />Cancel Order
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Products Card ──────────────────────────────────── */}
        <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Package className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-gray-800">
              Products <span className="text-xs text-gray-400 font-normal">({displayProducts.length})</span>
            </h2>
          </div>

          {displayProducts.map((p, pi) => {
            const productTotal = p.price * p.variants.reduce((s, v) => s + v.quantity, 0);
            return (
              <div key={pi} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                {/* Product header */}
                <div className="flex items-start gap-3">
                  {p.productImage?.secure_url ? (
                    <img src={p.productImage.secure_url} alt={p.productName}
                      className="h-20 w-20 rounded-xl object-cover border border-gray-100 shadow-sm flex-shrink-0" />
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 border border-dashed border-gray-200">
                      <ImageIcon className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-600 text-white text-[10px] font-bold">{pi + 1}</span>
                      <p className="font-semibold text-gray-800 truncate">{p.productName}</p>
                    </div>
                    <p className="text-sm text-purple-700 font-semibold">{p.price.toLocaleString()} EGP</p>
                    {p.productNotes && (
                      <p className="text-xs text-gray-500 mt-1">{p.productNotes}</p>
                    )}
                  </div>
                </div>

                {/* Variants */}
                {p.variants.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-1.5 px-2 text-gray-500 font-medium">Color</th>
                          <th className="text-left py-1.5 px-2 text-gray-500 font-medium">Size</th>
                          <th className="text-right py-1.5 px-2 text-gray-500 font-medium">Qty</th>
                          <th className="text-right py-1.5 px-2 text-gray-500 font-medium">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {p.variants.map((v, vi) => (
                          <tr key={vi} className="bg-white/70">
                            <td className="py-1.5 px-2">
                              {v.color ? (
                                <span className="flex items-center gap-1.5">
                                  <Palette className="h-3 w-3 text-purple-400" />{v.color}
                                </span>
                              ) : <span className="text-gray-400">—</span>}
                            </td>
                            <td className="py-1.5 px-2">
                              {v.size ? (
                                <span className="flex items-center gap-1.5">
                                  <Ruler className="h-3 w-3 text-blue-400" />{v.size}
                                </span>
                              ) : <span className="text-gray-400">—</span>}
                            </td>
                            <td className="py-1.5 px-2 text-right font-semibold">{v.quantity}</td>
                            <td className="py-1.5 px-2 text-right font-semibold text-purple-700">
                              {(p.price * v.quantity).toLocaleString()} EGP
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-end pt-1 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-600">Product Total: <span className="text-purple-700">{productTotal.toLocaleString()} EGP</span></span>
                </div>
              </div>
            );
          })}

          {/* Deposit */}
          {order.deposit !== undefined && order.deposit > 0 && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-800 flex items-center gap-1.5">
                  <Check className="h-4 w-4" />Deposit Paid
                </span>
                <span className="font-bold text-emerald-700">{order.deposit.toLocaleString()} EGP</span>
              </div>
              {Math.max(0, totalOrderPrice - order.deposit) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-700">Remaining Balance</span>
                  <span className="font-semibold text-amber-700">
                    {Math.max(0, totalOrderPrice - order.deposit).toLocaleString()} EGP
                  </span>
                </div>
              )}
              {order.depositImage?.secure_url && (
                <a href={order.depositImage.secure_url} target="_blank" rel="noreferrer" className="inline-block group mt-1">
                  <img src={order.depositImage.secure_url} alt="Deposit Receipt"
                    className="h-24 w-24 object-cover rounded-xl border border-emerald-200 shadow-sm group-hover:opacity-90 transition-opacity" />
                  <span className="text-xs text-blue-600 underline block mt-1">View Full Receipt</span>
                </a>
              )}
            </div>
          )}

          {/* Total */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Order Amount</span>
            <span className="text-lg font-bold text-purple-700">{totalOrderPrice.toLocaleString()} EGP</span>
          </div>
        </div>

        {/* ── Customer Card ─────────────────────────────────── */}
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm space-y-1">
          <div className="flex items-center gap-2 mb-4">
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

      {/* Edit History */}
      {hasHistory && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <History className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-gray-800">Edit History Timeline</h2>
          </div>
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-100">
            {order.editHistory!.map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-purple-500 ring-4 ring-white" />
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-700">Edited by {item.editedBy}</span>
                    <span className="text-xs text-gray-400">{formatDate(item.editedAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 break-words mt-1">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Edit className="h-5 w-5 text-purple-600" />Edit Social Media Order
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-5 pt-2">
            {/* Products */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-1.5">
                  <Package className="h-4 w-4" />Products
                </h3>
                <button type="button"
                  onClick={() => setEditProducts((prev) => [...prev, makeEditProduct()])}
                  className="flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 px-2.5 py-1 rounded-lg transition-colors">
                  <PlusCircle className="h-3.5 w-3.5" />Add Product
                </button>
              </div>
              {editProducts.map((p, i) => (
                <EditProductCard
                  key={p.id} product={p} index={i} canRemove={editProducts.length > 1}
                  onChange={(updated) => setEditProducts((prev) => prev.map((ep) => (ep.id === p.id ? updated : ep)))}
                  onRemove={() => setEditProducts((prev) => prev.filter((ep) => ep.id !== p.id))}
                />
              ))}
            </div>

            {/* Deposit */}
            <div className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
              <h3 className="text-sm font-semibold text-emerald-900">Deposit (Optional)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-emerald-700 mb-1 block">Amount (EGP)</Label>
                  <Input type="number" placeholder="0.00" value={editDeposit}
                    onChange={(e) => setEditDeposit(e.target.value)} className="border-emerald-200 bg-white" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-emerald-800 mb-1 block">Receipt Image</Label>
                  {editDepositPreview ? (
                    <div className="relative inline-block">
                      <img src={editDepositPreview} alt="deposit" className="h-16 w-16 rounded-lg object-cover border border-emerald-200" />
                      <button type="button"
                        onClick={() => { setEditDepositFile(null); setEditDepositPreview(null); }}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => depositRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-1 h-16 w-full rounded-lg border-2 border-dashed border-emerald-200 bg-white cursor-pointer hover:border-emerald-400 transition-colors">
                      <Upload className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[10px] text-emerald-800">Upload</span>
                    </div>
                  )}
                  <input ref={depositRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setEditDepositFile(f); const r = new FileReader(); r.onload = () => setEditDepositPreview(r.result as string); r.readAsDataURL(f); }} />
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
              <h3 className="text-sm font-semibold text-blue-900">Customer & Delivery</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium mb-0.5 block">Customer Name *</Label>
                  <Input value={editCustomerName} onChange={(e) => setEditCustomerName(e.target.value)} required className="bg-white" />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-0.5 block">Phone *</Label>
                  <Input value={editCustomerPhone} onChange={(e) => setEditCustomerPhone(e.target.value)} required className="bg-white" />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-0.5 block">City / Area *</Label>
                  <Input value={editCity} onChange={(e) => setEditCity(e.target.value)} required className="bg-white" />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-0.5 block">Address *</Label>
                  <Input value={editCustomerAddress} onChange={(e) => setEditCustomerAddress(e.target.value)} required className="bg-white" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs font-medium mb-0.5 block">Delivery Notes</Label>
                  <Textarea rows={2} value={editDeliveryNotes} onChange={(e) => setEditDeliveryNotes(e.target.value)} className="resize-none bg-white" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submittingEdit} className="bg-purple-600 hover:bg-purple-700 text-white">
                {submittingEdit ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : 'Save & Request Re-Confirmation'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialOrderDetail;
