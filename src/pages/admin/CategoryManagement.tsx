import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/admin/DataTable';
import CategoryForm from '@/components/admin/CategoryForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EnhancedStatsCard from '@/components/admin/EnhancedStatsCard';
import GradientButton from '@/components/admin/GradientButton';
import EnhancedBadge from '@/components/admin/EnhancedBadge';
import { categoryApi, Category } from '@/services/adminApi';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { dialogState, confirm, closeDialog } = useConfirmDialog();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (formData: FormData) => {
    try {
      await categoryApi.create(formData);
      toast.success('Category created successfully');
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to create category');
      console.error('Error creating category:', error);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editingCategory) return;

    try {
      await categoryApi.update(editingCategory._id, formData);
      toast.success('Category updated successfully');
      setEditingCategory(null);
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update category');
      console.error('Error updating category:', error);
    }
  };

  const handleDelete = (category: Category) => {
    confirm(
      'Delete Category',
      `Are you sure you want to delete "${category.nameEnglish || category.name}"? This action cannot be undone.`,
      async () => {
        try {
          await categoryApi.delete(category._id);
          toast.success('Category deleted successfully');
          fetchCategories();
        } catch (error) {
          toast.error('Failed to delete category');
          console.error('Error deleting category:', error);
        }
      },
      'destructive'
    );
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleView = (category: Category) => {
    // Implement view functionality
    console.log('View category:', category);
  };

  const filteredCategories = categories.filter(category => {
    const nameEnglish = category.nameEnglish || category.name || '';
    const nameArabic = category.nameArabic || '';
    return nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nameArabic.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns: Column<Category>[] = [
    {
      key: 'image',
      title: 'Image',
      render: (value, row) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
          {row.image?.secure_url ? (
            <img
              src={row.image.secure_url}
              alt={row.nameEnglish}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'nameEnglish',
      title: 'Name (English)',
      sortable: true,
      render: (value, row) => row.nameEnglish || row.name || 'N/A',
    },
    {
      key: 'nameArabic',
      title: 'Name (Arabic)',
      sortable: true,
      render: (value, row) => row.nameArabic || 'N/A',
    },
    {
      key: 'subCategories',
      title: 'Sub Categories',
      render: (value) => (
        <EnhancedBadge variant="info">
          {value?.length || 0} subcategories
        </EnhancedBadge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created At',
      render: (value) => new Date(value).toLocaleDateString(),
      sortable: true,
    },
  ];

  const paginatedCategories = filteredCategories.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="space-y-8">
      {/* Header with Gradient */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Category Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage product categories and their subcategories
          </p>
        </div>
        <GradientButton gradient="purple" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </GradientButton>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <EnhancedStatsCard
          title="Total Categories"
          value={categories.length}
          icon={FolderOpen}
          gradient="purple"
          loading={loading}
        />
        <EnhancedStatsCard
          title="With Images"
          value={categories.filter(c => c.image?.secure_url).length}
          icon={Eye}
          gradient="blue"
          loading={loading}
        />
        <EnhancedStatsCard
          title="Total Subcategories"
          value={categories.reduce((sum, cat) => sum + (cat.subCategories?.length || 0), 0)}
          icon={FolderOpen}
          gradient="green"
          loading={loading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            A list of all product categories in your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedCategories}
            columns={columns}
            loading={loading}
            searchable
            searchPlaceholder="Search categories..."
            onSearch={setSearchQuery}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            pagination={{
              page,
              pageSize,
              total: filteredCategories.length,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
          />
        </CardContent>
      </Card>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          onSubmit={editingCategory ? handleUpdate : handleCreate}
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

export default CategoryManagement;
