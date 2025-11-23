import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Truck, DollarSign, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/admin/DataTable';
import ShippingForm from '@/components/admin/ShippingForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EnhancedStatsCard from '@/components/admin/EnhancedStatsCard';
import GradientButton from '@/components/admin/GradientButton';
import { shippingApi, Shipping } from '@/services/adminApi';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

interface ShippingFormData {
  government: string;
  price: number;
}

const ShippingManagement: React.FC = () => {
  const [shippingOptions, setShippingOptions] = useState<Shipping[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingShipping, setEditingShipping] = useState<Shipping | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { dialogState, confirm, closeDialog } = useConfirmDialog();

  const fetchShippingOptions = async () => {
    try {
      setLoading(true);
      const response = await shippingApi.getAll();
      setShippingOptions(response.data);
    } catch (error) {
      toast.error('Failed to fetch shipping options');
      console.error('Error fetching shipping options:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingOptions();
  }, []);

  const handleCreate = async (data: ShippingFormData) => {
    try {
      await shippingApi.createGov({ government: data.government, price: Number(data.price) });
      toast.success('Shipping option created successfully');
      setShowForm(false);
      fetchShippingOptions();
    } catch (error) {
      toast.error('Failed to create shipping option');
      console.error('Error creating shipping option:', error);
    }
  };

  const handleUpdate = async (data: ShippingFormData) => {
    if (!editingShipping) return;

    try {
      await shippingApi.updateGov(editingShipping._id, {
        government: data.government,
        price: data.price != null ? Number(data.price) : undefined,
      });
      toast.success('Shipping option updated successfully');
      setEditingShipping(null);
      setShowForm(false);
      fetchShippingOptions();
    } catch (error) {
      toast.error('Failed to update shipping option');
      console.error('Error updating shipping option:', error);
    }
  };

  const handleDelete = (shipping: Shipping) => {
    confirm(
      'Delete Shipping Option',
      `Are you sure you want to delete shipping option for "${shipping.government}"? This action cannot be undone.`,
      async () => {
        try {
          await shippingApi.delete(shipping._id);
          toast.success('Shipping option deleted successfully');
          fetchShippingOptions();
        } catch (error) {
          toast.error('Failed to delete shipping option');
          console.error('Error deleting shipping option:', error);
        }
      },
      'destructive'
    );
  };

  const handleEdit = (shipping: Shipping) => {
    setEditingShipping(shipping);
    setShowForm(true);
  };

  const filteredShippingOptions = (shippingOptions || []).filter(shipping =>
    (shipping.government || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Shipping>[] = [
    {
      key: 'government' as any,
      title: 'Government',
      sortable: true,
      render: (value) => value || 'N/A',
    },
    {
      key: 'price',
      title: 'Price',
      sortable: true,
      render: (value) => (
        <div className="font-medium">L.E {value ? Number(value).toFixed(2) : '0.00'}</div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created At',
      sortable: true,
      render: (value) => (value ? new Date(value).toLocaleDateString() : '—'),
    },
  ];

  const paginatedShippingOptions = filteredShippingOptions.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="space-y-8">
      {/* Header with Gradient */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Shipping Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage shipping options and delivery methods
          </p>
        </div>
        <GradientButton gradient="purple" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Shipping Option
        </GradientButton>
      </div>

      {/* Shipping Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <EnhancedStatsCard
          title="Total Options"
          value={shippingOptions?.length || 0}
          icon={Truck}
          gradient="purple"
          loading={loading}
        />
        <EnhancedStatsCard
          title="Average Cost"
          value={`L.E ${(shippingOptions.length > 0 ? shippingOptions.reduce((sum, s) => sum + (s.price || 0), 0) / shippingOptions.length : 0).toFixed(2)}`}
          icon={DollarSign}
          gradient="green"
          loading={loading}
        />
        <EnhancedStatsCard
          title="Covered Regions"
          value={shippingOptions?.length || 0}
          icon={MapPin}
          gradient="blue"
          loading={loading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Options</CardTitle>
          <CardDescription>
            A list of all shipping options available to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedShippingOptions}
            columns={columns}
            loading={loading}
            searchable
            searchPlaceholder="Search shipping options..."
            onSearch={setSearchQuery}
            onEdit={handleEdit}
            onDelete={handleDelete}
            pagination={{
              page,
              pageSize,
              total: filteredShippingOptions.length,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
          />
        </CardContent>
      </Card>

      {/* Shipping Form Modal */}
      {showForm && (
        <ShippingForm
          shipping={editingShipping}
          onClose={() => {
            setShowForm(false);
            setEditingShipping(null);
          }}
          onSubmit={editingShipping ? handleUpdate : handleCreate}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={dialogState.open}
        onOpenChange={closeDialog}
        title={dialogState.title}
        description={dialogState.description}
        onConfirm={dialogState.onConfirm}
        variant={dialogState.variant}
        confirmText="Delete"
      />
    </div>
  );
};

export default ShippingManagement;
