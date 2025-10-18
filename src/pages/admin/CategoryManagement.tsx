import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/admin/DataTable';
import CategoryForm from '@/components/admin/CategoryForm';
import { categoryApi, Category } from '@/services/adminApi';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const handleDelete = async (category: Category) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await categoryApi.delete(category._id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
      console.error('Error deleting category:', error);
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground">
            Manage your product categories and subcategories
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
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
    </div>
  );
};

export default CategoryManagement;
