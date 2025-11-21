import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FolderOpen, Layers, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/admin/DataTable';
import SubCategoryForm from '@/components/admin/SubCategoryForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EnhancedStatsCard from '@/components/admin/EnhancedStatsCard';
import GradientButton from '@/components/admin/GradientButton';
import EnhancedBadge from '@/components/admin/EnhancedBadge';
import { subCategoryApi, categoryApi, SubCategory, Category } from '@/services/adminApi';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { getCategoryId, getCategoryName } from '@/utils/adminHelpers';

const SubCategoryManagement: React.FC = () => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { dialogState, confirm, closeDialog } = useConfirmDialog();

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const response = await subCategoryApi.getAll();
      setSubCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch subcategories');
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      const form = new FormData();
      if (data.image instanceof File) form.append('image', data.image);
      form.append('nameArabic', data.nameArabic);
      form.append('nameEnglish', data.nameEnglish);
      await subCategoryApi.create(data.categoryId, form);
      toast.success('SubCategory created successfully');
      setShowForm(false);
      fetchSubCategories();
    } catch (error) {
      toast.error('Failed to create subcategory');
      console.error('Error creating subcategory:', error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingSubCategory) return;

    try {
      const form = new FormData();
      if (data.image instanceof File) form.append('image', data.image);
      if (data.nameArabic != null) form.append('nameArabic', data.nameArabic);
      if (data.nameEnglish != null) form.append('nameEnglish', data.nameEnglish);
      await subCategoryApi.update(editingSubCategory._id, form);
      toast.success('SubCategory updated successfully');
      setEditingSubCategory(null);
      setShowForm(false);
      fetchSubCategories();
    } catch (error) {
      toast.error('Failed to update subcategory');
      console.error('Error updating subcategory:', error);
    }
  };

  const handleDelete = (subCategory: SubCategory) => {
    confirm(
      'Delete SubCategory',
      `Are you sure you want to delete "${subCategory.nameEnglish}"? This action cannot be undone.`,
      async () => {
        try {
          await subCategoryApi.delete(subCategory._id);
          toast.success('SubCategory deleted successfully');
          fetchSubCategories();
        } catch (error) {
          toast.error('Failed to delete subcategory');
          console.error('Error deleting subcategory:', error);
        }
      },
      'destructive'
    );
  };

  const handleEdit = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setShowForm(true);
  };

  const filteredSubCategories = (subCategories || []).filter(subCategory => {
    const nameEnglish = subCategory.nameEnglish || '';
    const nameArabic = subCategory.nameArabic || '';
    const matchesSearch =
      nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nameArabic.toLowerCase().includes(searchQuery.toLowerCase());

    const categoryIdValue = getCategoryId(subCategory.categoryId);
    const matchesCategory = !selectedCategory || categoryIdValue === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const columns: Column<SubCategory>[] = [
    {
      key: 'nameEnglish',
      title: 'Name (English)',
      sortable: true,
      render: (value, row) => row.nameEnglish || 'N/A',
    },
    {
      key: 'nameArabic',
      title: 'Name (Arabic)',
      sortable: true,
      render: (value, row) => row.nameArabic || 'N/A',
    },
    {
      key: 'categoryId',
      title: 'Parent Category',
      render: (value, row) => {
        const categoryIdValue = getCategoryId(row.categoryId);
        const categoryName = getCategoryName(
          row.categoryId,
          categories.find(cat => cat._id === categoryIdValue)?.nameEnglish ||
          categories.find(cat => cat._id === categoryIdValue)?.name ||
          'Unknown'
        );
        return (
          <Badge variant="outline">
            {categoryName}
          </Badge>
        );
      },
    },
    {
      key: 'slugEnglish',
      title: 'Slug (English)',
      render: (value) => (
        <div className="font-mono text-sm">{value || 'N/A'}</div>
      ),
    },
    {
      key: 'slugArabic',
      title: 'Slug (Arabic)',
      render: (value) => (
        <div className="font-mono text-sm">{value || 'N/A'}</div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created At',
      render: (value) => new Date(value).toLocaleDateString(),
      sortable: true,
    },
  ];

  const paginatedSubCategories = filteredSubCategories.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Calculate stats using useMemo for performance
  const stats = useMemo(() => {
    const avgPerCategory = categories?.length > 0
      ? Math.round((subCategories?.length || 0) / categories.length)
      : 0;

    const maxSubCategoriesInCategory = categories?.length > 0
      ? Math.max(...categories.map(cat =>
        (subCategories || []).filter(sub => {
          const categoryIdValue = getCategoryId(sub.categoryId);
          return categoryIdValue === cat._id;
        }).length
      ))
      : 0;

    return { avgPerCategory, maxSubCategoriesInCategory };
  }, [categories, subCategories]);

  const categoryFilters = [
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: '', label: 'All Categories' },
        ...categories.map(cat => ({
          value: cat._id,
          label: cat.nameEnglish,
        })),
      ],
      onFilter: setSelectedCategory,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Gradient */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            SubCategory Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage product subcategories and their organization
          </p>
        </div>
        <GradientButton gradient="purple" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add SubCategory
        </GradientButton>
      </div>

      {/* SubCategory Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedStatsCard
          title="Total SubCategories"
          value={subCategories?.length || 0}
          icon={Layers}
          gradient="purple"
          loading={loading}
        />
        <EnhancedStatsCard
          title="Categories"
          value={categories?.length || 0}
          icon={FolderOpen}
          gradient="blue"
          loading={loading}
        />
        <EnhancedStatsCard
          title="Avg per Category"
          value={stats.avgPerCategory}
          icon={TrendingUp}
          gradient="green"
          loading={loading}
        />
        <EnhancedStatsCard
          title="Max in Category"
          value={stats.maxSubCategoriesInCategory}
          icon={Layers}
          gradient="orange"
          loading={loading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SubCategories</CardTitle>
          <CardDescription>
            A list of all product subcategories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedSubCategories}
            columns={columns}
            loading={loading}
            searchable
            searchPlaceholder="Search subcategories..."
            onSearch={setSearchQuery}
            onEdit={handleEdit}
            onDelete={handleDelete}
            pagination={{
              page,
              pageSize,
              total: filteredSubCategories.length,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
            filters={categoryFilters}
          />
        </CardContent>
      </Card>

      {/* SubCategory Form Modal */}
      {
        showForm && (
          <SubCategoryForm
            subCategory={editingSubCategory}
            categories={categories}
            onClose={() => {
              setShowForm(false);
              setEditingSubCategory(null);
            }}
            onSubmit={editingSubCategory ? handleUpdate : handleCreate}
          />
        )
      }

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
    </div >
  );
};

export default SubCategoryManagement;
