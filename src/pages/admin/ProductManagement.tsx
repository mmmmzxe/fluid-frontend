import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Package } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/admin/DataTable';
import ProductForm from '@/components/admin/ProductForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { productApi, categoryApi, Product, Category } from '@/services/adminApi';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const { dialogState, confirm, closeDialog } = useConfirmDialog();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAllNoCache();
      const all = response.data || [];
      let filtered = selectedCategory ? all.filter(p => (p as any).category === selectedCategory) : all;
      if (selectedSubCategory) {
        filtered = filtered.filter(p => {
          const sub = (p as any).subCategory || (p as any).subcategory || (p as any).subCategoryId;
          return sub === selectedSubCategory;
        });
      }
      setProducts(filtered);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error fetching products:', error);
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
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, selectedSubCategory]);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubCategory('');
  }, [selectedCategory]);

  const handleCreate = async (formData: FormData) => {
    try {
      await productApi.create(formData);
      toast.success('Product created successfully');
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to create product');
      console.error('Error creating product:', error);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editingProduct) return;

    try {
      await productApi.update(editingProduct._id, formData);
      toast.success('Product updated successfully');
      setEditingProduct(null);
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = (product: Product) => {
    confirm(
      'Delete Product',
      `Are you sure you want to delete "${product.titleEnglish}"? This action cannot be undone.`,
      async () => {
        try {
          await productApi.delete(product._id);
          toast.success('Product deleted successfully');
          fetchProducts();
        } catch (error) {
          toast.error('Failed to delete product');
          console.error('Error deleting product:', error);
        }
      },
      'destructive'
    );
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleView = (product: Product) => {
    // Implement view functionality
    console.log('View product:', product);
  };

  const filteredProducts = products.filter(product => {
    const titleEnglish = product.titleEnglish || '';
    const titleArabic = product.titleArabic || '';
    const descriptionEnglish = product.descriptionEnglish || '';
    return titleEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      titleArabic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      descriptionEnglish.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns: Column<Product>[] = [
    {
      key: 'mainImage',
      title: 'Image',
      render: (value, row) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          {row.mainImage?.secure_url ? (
            <img
              src={row.mainImage.secure_url}
              alt={row.titleEnglish}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="h-6 w-6" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'titleEnglish',
      title: 'Product Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">{row.titleArabic || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'price',
      title: 'Price',
      render: (value, row) => (
        <div>
          <div className="font-medium">${row.finalPrice}</div>
          {row.discount && (
            <div className="text-sm text-muted-foreground line-through">
              ${value}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'stock',
      title: 'Stock',
      render: (value) => (
        <Badge variant={value > 10 ? 'default' : value > 0 ? 'secondary' : 'destructive'}>
          {value || 0} units
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'category',
      title: 'Category',
      render: (value) => (
        <Badge variant="outline">
          {categories.find(cat => cat._id === value)?.nameEnglish || 'Unknown'}
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

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

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
    {
      key: 'subCategory',
      label: 'Subcategory',
      options: [
        { value: '', label: selectedCategory ? 'All Subcategories' : 'Select a category first' },
        ...(((categories.find(c => c._id === selectedCategory) as any)?.subCategories || [])
          .map((sub: any) => ({ value: sub._id, label: sub.nameEnglish || sub.nameArabic })))
      ],
      onFilter: setSelectedSubCategory,
      disabled: !selectedCategory,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your product catalog, inventory, and pricing
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            A list of all products in your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedProducts}
            columns={columns}
            loading={loading}
            searchable
            searchPlaceholder="Search products..."
            onSearch={setSearchQuery}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            pagination={{
              page,
              pageSize,
              total: filteredProducts.length,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
            filters={categoryFilters}
          />
        </CardContent>
      </Card>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSubmit={editingProduct ? handleUpdate : handleCreate}
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

export default ProductManagement;
