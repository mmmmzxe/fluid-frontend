import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/admin/DataTable';
import CategoryForm from '@/components/admin/CategoryForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
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
        <Badge variant="secondary">
          {value?.length || 0} subcategories
        </Badge>
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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
            Category Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize and manage your product categories
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30 transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <FolderOpen className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active categories
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <FolderOpen className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredCategories.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Matching search
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Page</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
              <FolderOpen className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paginatedCategories.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Items on page {page}
            </p>
          </CardContent>
        </Card>
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
