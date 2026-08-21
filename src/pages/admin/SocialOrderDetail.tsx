import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import { socialOrderApi, SocialOrder } from '@/services/adminApi';
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
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
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
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
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
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const res = await socialOrderApi.getById(id);
      setOrder(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Pre-fill edit form when modal opens
  const openEditModal = () => {
    if (!order) return;
    setEditForm({
      productName: order.productName || '',
      price: String(order.price || ''),
      color: order.color || '',
      size: order.size || '',
      quantity: String(order.quantity || 1),
      productNotes: order.productNotes || '',
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      customerAddress: order.customerAddress || '',
      city: order.city || '',
      deliveryNotes: order.deliveryNotes || '',
    });
    setEditImagePreview(order.productImage?.secure_url || null);
    setEditImageFile(null);
    setIsEditOpen(true);
  };

  const handleUpdateStatus = async (status: 'confirmed' | 'cancelled') => {
    if (!id) return;
    setUpdatingStatus(true);
    try {
      const res = await socialOrderApi.updateStatus(id, status);
      setOrder(res.data);
      toast.success(`Order ${status === 'confirmed' ? 'confirmed' : 'cancelled'} successfully!`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingEdit(true);
    try {
      const fd = new FormData();
      fd.append('productName', editForm.productName);
      fd.append('price', editForm.price);
      fd.append('quantity', editForm.quantity || '1');
      if (editForm.color) fd.append('color', editForm.color);
      if (editForm.size) fd.append('size', editForm.size);
      if (editForm.productNotes) fd.append('productNotes', editForm.productNotes);
      fd.append('customerName', editForm.customerName);
      fd.append('customerPhone', editForm.customerPhone);
      fd.append('customerAddress', editForm.customerAddress);
      fd.append('city', editForm.city);
      if (editForm.deliveryNotes) fd.append('deliveryNotes', editForm.deliveryNotes);
      if (editImageFile) fd.append('productImage', editImageFile);

      const res = await socialOrderApi.update(id, fd);
      setOrder(res.data);
      setIsEditOpen(false);
      toast.success('Order updated successfully! Sent for SuperAdmin re-confirmation.');
    } catch {
      // toast error handled by axios interceptor
    } finally {
      setSubmittingEdit(false);
    }
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
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
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
  const totalPrice = order.price * order.quantity;
  const hasHistory = order.editHistory && order.editHistory.length > 0;

  return (
    <div className="w-full space-y-6">
      {/* Back + Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        </div>

        {/* Edit Order Button */}
        {canEdit && (
          <Button
            onClick={openEditModal}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Order
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

        {/* Status Badge */}
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

      {/* SuperAdmin Action Buttons */}
      {isSuperAdmin && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <span className="text-sm font-semibold text-gray-700">Order Actions:</span>
          <Button
            disabled={updatingStatus || order.status === 'confirmed'}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
            onClick={() => handleUpdateStatus('confirmed')}
          >
            <Check className="mr-1.5 h-4 w-4" />
            Confirm Order
          </Button>
          <Button
            variant="outline"
            disabled={updatingStatus || order.status === 'cancelled'}
            className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-xl"
            onClick={() => handleUpdateStatus('cancelled')}
          >
            <X className="mr-1.5 h-4 w-4" />
            Cancel Order
          </Button>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Product Card ──────────────────────────────────── */}
        <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Package className="h-4 w-4" />
              </div>
              <h2 className="font-semibold text-gray-800">Product</h2>
            </div>

            {/* Product image */}
            {order.productImage?.secure_url ? (
              <div className="mb-5 flex justify-center bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                <img
                  src={order.productImage.secure_url}
                  alt={order.productName}
                  className="max-h-64 w-full object-contain rounded-lg shadow-sm"
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
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-lg font-bold text-purple-700">{totalPrice.toLocaleString()} EGP</span>
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

      {/* ── Edit History Timeline Section ──────────────────────────────── */}
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
                {/* Bullet */}
                <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-purple-500 ring-4 ring-white" />

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-700">
                      Edited by {item.editedBy}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(item.editedAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 break-words mt-1">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Order Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Edit className="h-5 w-5 text-purple-600" />
              Edit Social Media Order
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-6 pt-2">
            {/* Product Section */}
            <div className="space-y-4 rounded-xl border border-purple-100 bg-purple-50/30 p-4">
              <h3 className="text-sm font-semibold text-purple-900">Product Details</h3>

              <div>
                <Label className="text-xs font-medium text-gray-700 mb-1 block">Product Image</Label>
                {editImagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={editImagePreview}
                      alt="preview"
                      className="h-28 w-28 rounded-lg object-cover border border-purple-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => { setEditImageFile(null); setEditImagePreview(null); }}
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center gap-1 h-28 w-full rounded-lg border-2 border-dashed border-purple-200 bg-white cursor-pointer hover:border-purple-400"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-5 w-5 text-purple-400" />
                    <span className="text-xs text-gray-500">Click to upload new image</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setEditImageFile(f);
                    const r = new FileReader();
                    r.onload = () => setEditImagePreview(r.result as string);
                    r.readAsDataURL(f);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-pname" className="text-xs font-medium">Product Name *</Label>
                  <Input
                    id="edit-pname"
                    value={editForm.productName}
                    onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price" className="text-xs font-medium">Price (EGP) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-color" className="text-xs font-medium">Color</Label>
                  <Input
                    id="edit-color"
                    value={editForm.color}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-size" className="text-xs font-medium">Size</Label>
                  <Input
                    id="edit-size"
                    value={editForm.size}
                    onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-qty" className="text-xs font-medium">Quantity *</Label>
                  <Input
                    id="edit-qty"
                    type="number"
                    min="1"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-pnotes" className="text-xs font-medium">Product Notes</Label>
                <Textarea
                  id="edit-pnotes"
                  rows={2}
                  value={editForm.productNotes}
                  onChange={(e) => setEditForm({ ...editForm, productNotes: e.target.value })}
                />
              </div>
            </div>

            {/* Customer Section */}
            <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
              <h3 className="text-sm font-semibold text-blue-900">Customer & Delivery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-cname" className="text-xs font-medium">Customer Name *</Label>
                  <Input
                    id="edit-cname"
                    value={editForm.customerName}
                    onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cphone" className="text-xs font-medium">Phone *</Label>
                  <Input
                    id="edit-cphone"
                    value={editForm.customerPhone}
                    onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-city" className="text-xs font-medium">City / Area *</Label>
                  <Input
                    id="edit-city"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="edit-address" className="text-xs font-medium">Address *</Label>
                  <Input
                    id="edit-address"
                    value={editForm.customerAddress}
                    onChange={(e) => setEditForm({ ...editForm, customerAddress: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-dnotes" className="text-xs font-medium">Delivery Notes</Label>
                <Textarea
                  id="edit-dnotes"
                  rows={2}
                  value={editForm.deliveryNotes}
                  onChange={(e) => setEditForm({ ...editForm, deliveryNotes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingEdit}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {submittingEdit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save & Request Re-Confirmation'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialOrderDetail;
