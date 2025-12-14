import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Upload, Loader2, Trash2, Edit } from 'lucide-react';
import { compressImage } from '@/utils/imageCompression';
import { Product, Category, SubCategory, productApi } from '@/services/adminApi';
import { ColorPicker } from '@/components/ui/color-picker';
import { toast } from 'sonner';

const productSchema = z.object({
  titleEnglish: z.string().min(1, 'English title is required'),
  titleArabic: z.string().min(1, 'Arabic title is required'),
  descriptionEnglish: z.string().min(1, 'English description is required'),
  descriptionArabic: z.string().min(1, 'Arabic description is required'),
  price: z.number().min(0, 'Price must be positive'),
  discount: z.number().min(0).optional(),
  discountType: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

// Variant form types for editing existing variants
interface EditVariantData {
  variantId: string;
  sizeId: string;
  stock: number;
  color: string;
  size: string;
}

// Variant form types for adding new variants
interface NewVariantData {
  color: string;
  size: Array<{ size: string; stock: string }>;
}

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  onRefresh?: () => void; // Callback to refresh product data after variant operations
}

const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onClose, onSubmit: onSubmitProp, onRefresh }) => {
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  // State for sub images (both existing and new)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(
    product?.mainImage?.secure_url || null
  );

  const [activeSubImages, setActiveSubImages] = useState<Array<{
    type: 'existing' | 'new';
    id: string;
    url: string;
    file?: File; // only for new
    publicId?: string; // only for existing
  }>>([]);
  
  const [deletedSubImages, setDeletedSubImages] = useState<string[]>([]);

  useEffect(() => {
    if (product?.subImages) {
      setActiveSubImages(product.subImages.map((img: any) => ({
        type: 'existing',
        id: img._id || img.public_id,
        url: img.secure_url,
        publicId: img.public_id
      })));
    } else {
      setActiveSubImages([]);
    }
    setDeletedSubImages([]);
  }, [product]);

  // State for editing existing variants (with IDs from API)
  const [existingVariants, setExistingVariants] = useState<Array<{
    variantId: string;
    color: string;
    sizes: Array<{ sizeId: string; size: string; stock: number }>;
  }>>(
    (product?.variants || []).map(v => ({
      variantId: v._id,
      color: v.color,
      sizes: (v.size || []).map(s => ({
        sizeId: s._id,
        size: s.size || '',
        stock: s.stock
      })),
    }))
  );


  useEffect(() => {
    if (product?.variants) {
      setExistingVariants(
        product.variants.map(v => ({
          variantId: v._id,
          color: v.color,
          sizes: (v.size || []).map(s => ({
            sizeId: s._id,
            size: s.size || '',
            stock: s.stock
          })),
        }))
      );
    }
  }, [product?.variants]);

  // State for new variants to add (without IDs)
  const [newVariants, setNewVariants] = useState<Array<{
    color: string;
    size: Array<{ size: string; stock: number }>;
  }>>([]);

  // Legacy variants state for create mode (when no product exists)
  const [variants, setVariants] = useState<Array<{
    color: string;
    size: Array<{ size: string; stock: number }>;
    stock: number;
  }>>(
    !product ? [] : []
  );

  // Modal states for variant editing
  const [editingVariant, setEditingVariant] = useState<{
    variantId: string;
    sizeId: string;
    color: string;
    size: string;
    stock: number;
  } | null>(null);
  const [isEditVariantSubmitting, setIsEditVariantSubmitting] = useState(false);
  const [isAddVariantSubmitting, setIsAddVariantSubmitting] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const subImagesInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      titleEnglish: product?.titleEnglish || '',
      titleArabic: product?.titleArabic || '',
      descriptionEnglish: product?.descriptionEnglish || '',
      descriptionArabic: product?.descriptionArabic || '',
      price: product?.price || 0,
      discount: product?.discount || 0,
      discountType: product?.discountType || 'percentage',
      category: product?.category || '',
      subCategory: product?.subCategory || '',
    },
  });

  // Reset subcategory when category changes
  React.useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === 'category') {
        form.setValue('subCategory', '');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const selectedCategoryId = form.watch('category');
  const derivedSubCategories: SubCategory[] = React.useMemo(() => {
    const selected = categories.find(c => c._id === selectedCategoryId) as any;
    return (selected?.subCategories || []) as SubCategory[];
  }, [categories, selectedCategoryId]);

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setIsCompressing(true);
        const file = e.target.files[0];
        const compressedFile = await compressImage(file);
        setMainImageFile(compressedFile);

        const reader = new FileReader();
        reader.onloadend = () => {
          setMainImagePreview(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original file if compression fails
        const file = e.target.files[0];
        setMainImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setMainImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        setIsCompressing(true);
        const files = Array.from(e.target.files);
        const compressedFiles = await Promise.all(
          files.map(file => compressImage(file))
        );

        const newImages = await Promise.all(
          compressedFiles.map(async (file) => {
            const url = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
            return {
              type: 'new' as const,
              id: Math.random().toString(36).substr(2, 9),
              url,
              file
            };
          })
        );

        setActiveSubImages(prev => [...prev, ...newImages]);
      } catch (error) {
        console.error('Error compressing images:', error);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const removeMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview(null);
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = '';
    }
  };

  const removeSubImage = (index: number) => {
    setActiveSubImages(prev => {
      const imgToRemove = prev[index];
      if (imgToRemove.type === 'existing' && imgToRemove.publicId) {
        setDeletedSubImages(d => [...d, imgToRemove.publicId!]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const addVariant = () => {
    if (product) {
      // Edit mode: add to newVariants
      setNewVariants(prev => [...prev, { color: '', size: [{ size: '', stock: 0 }] }]);
    } else {
      // Create mode: add to variants
      setVariants(prev => [...prev, { color: '', size: [{ size: '', stock: 0 }], stock: 0 }]);
    }
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewVariant = (index: number) => {
    setNewVariants(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setVariants(prev => prev.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const updateNewVariant = (index: number, field: string, value: any) => {
    setNewVariants(prev => prev.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const addVariantSize = (variantIndex: number) => {
    setVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? { ...variant, size: [...variant.size, { size: '', stock: 0 }] }
        : variant
    ));
  };

  const addNewVariantSize = (variantIndex: number) => {
    setNewVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? { ...variant, size: [...variant.size, { size: '', stock: 0 }] }
        : variant
    ));
  };

  const removeVariantSize = (variantIndex: number, sizeIndex: number) => {
    setVariants(prev => prev.filter((variant, i) =>
      i === variantIndex
        ? { ...variant, size: variant.size.filter((_, j) => j !== sizeIndex) }
        : variant
    ));
  };

  const removeNewVariantSize = (variantIndex: number, sizeIndex: number) => {
    setNewVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? { ...variant, size: variant.size.filter((_, j) => j !== sizeIndex) }
        : variant
    ));
  };

  const updateVariantSize = (variantIndex: number, sizeIndex: number, field: string, value: any) => {
    setVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? {
          ...variant,
          size: variant.size.map((size, j) =>
            j === sizeIndex ? { ...size, [field]: value } : size
          )
        }
        : variant
    ));
  };

  const updateNewVariantSize = (variantIndex: number, sizeIndex: number, field: string, value: any) => {
    setNewVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? {
          ...variant,
          size: variant.size.map((size, j) =>
            j === sizeIndex ? { ...size, [field]: value } : size
          )
        }
        : variant
    ));
  };

  // Handle editing existing variant via PATCH API
  const handleEditVariant = async () => {
    if (!editingVariant || !product) return;

    setIsEditVariantSubmitting(true);
    try {
      await productApi.editVariant(product._id, {
        variantId: editingVariant.variantId,
        sizeId: editingVariant.sizeId,
        stock: editingVariant.stock,
        color: editingVariant.color,
        size: editingVariant.size,
      });
      toast.success('Variant updated successfully');
      setEditingVariant(null);
      // Refresh product data
      onRefresh?.();
    } catch (error) {
      console.error('Error updating variant:', error);
      toast.error('Failed to update variant');
    } finally {
      setIsEditVariantSubmitting(false);
    }
  };

  // Handle adding new variants to existing product via POST API
  const handleAddNewVariants = async () => {
    if (!product || newVariants.length === 0) return;

    setIsAddVariantSubmitting(true);
    try {
      const variantsPayload = newVariants.map(v => ({
        color: v.color,
        size: v.size.map(s => ({
          size: s.size,
          stock: String(s.stock),
        })),
      }));

      await productApi.addVariant(product._id, { variants: variantsPayload });
      toast.success('Variants added successfully');
      setNewVariants([]);
      // Refresh product data
      onRefresh?.();
    } catch (error) {
      console.error('Error adding variants:', error);
      toast.error('Failed to add variants');
    } finally {
      setIsAddVariantSubmitting(false);
    }
  };

  // Open edit modal for a specific variant size
  const openEditVariantModal = (variantId: string, sizeId: string, color: string, size: string, stock: number) => {
    setEditingVariant({ variantId, sizeId, color, size, stock });
  };

  // State for adding size to existing variant
  const [addingSizeToVariant, setAddingSizeToVariant] = useState<{
    variantId: string;
    color: string;
    sizes: Array<{ size: string; stock: string }>;
  } | null>(null);
  const [isAddSizeSubmitting, setIsAddSizeSubmitting] = useState(false);
  const [isDeletingSizeId, setIsDeletingSizeId] = useState<string | null>(null);
  const [isDeletingVariantId, setIsDeletingVariantId] = useState<string | null>(null);

  // Handle deleting an entire variant from a product
  const handleDeleteVariant = async (variantId: string) => {
    if (!product) return;

    setIsDeletingVariantId(variantId);
    try {
      await productApi.deleteVariant(product._id, variantId);
      toast.success('Variant deleted successfully');
      // Update local state
      setExistingVariants(prev => prev.filter(v => v.variantId !== variantId));
      // Refresh product data
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Failed to delete variant');
    } finally {
      setIsDeletingVariantId(null);
    }
  };

  // Handle deleting a size from an existing variant
  const handleDeleteSizeOfVariant = async (variantId: string, sizeId: string) => {
    if (!product) return;

    setIsDeletingSizeId(sizeId);
    try {
      await productApi.deleteSizeOfVariant(product._id, variantId, sizeId);
      toast.success('Size deleted successfully');
      // Update local state
      setExistingVariants(prev => prev.map(v => 
        v.variantId === variantId 
          ? { ...v, sizes: v.sizes.filter(s => s.sizeId !== sizeId) }
          : v
      ));
      // Refresh product data
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting size:', error);
      toast.error('Failed to delete size');
    } finally {
      setIsDeletingSizeId(null);
    }
  };

  // Open modal to add size to existing variant
  const openAddSizeModal = (variantId: string, color: string) => {
    setAddingSizeToVariant({
      variantId,
      color,
      sizes: [{ size: '', stock: '' }]
    });
  };

  // Add a new size input to the add size modal
  const addSizeInput = () => {
    if (!addingSizeToVariant) return;
    setAddingSizeToVariant({
      ...addingSizeToVariant,
      sizes: [...addingSizeToVariant.sizes, { size: '', stock: '' }]
    });
  };

  // Update size input in add size modal
  const updateSizeInput = (index: number, field: 'size' | 'stock', value: string) => {
    if (!addingSizeToVariant) return;
    setAddingSizeToVariant({
      ...addingSizeToVariant,
      sizes: addingSizeToVariant.sizes.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      )
    });
  };

  // Remove size input from add size modal
  const removeSizeInput = (index: number) => {
    if (!addingSizeToVariant) return;
    setAddingSizeToVariant({
      ...addingSizeToVariant,
      sizes: addingSizeToVariant.sizes.filter((_, i) => i !== index)
    });
  };

  // Handle adding sizes to existing variant via API
  const handleAddSizeToVariant = async () => {
    if (!product || !addingSizeToVariant) return;

    const validSizes = addingSizeToVariant.sizes.filter(s => s.size.trim() && s.stock.trim());
    if (validSizes.length === 0) {
      toast.error('Please add at least one valid size');
      return;
    }

    setIsAddSizeSubmitting(true);
    try {
      await productApi.addSizeToVariant(product._id, addingSizeToVariant.variantId, {
        size: validSizes
      });
      toast.success('Sizes added successfully');
      setAddingSizeToVariant(null);
      // Refresh product data
      onRefresh?.();
    } catch (error) {
      console.error('Error adding sizes:', error);
      toast.error('Failed to add sizes');
    } finally {
      setIsAddSizeSubmitting(false);
    }
  };

  const _handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('titleEnglish', data.titleEnglish);
    formData.append('titleArabic', data.titleArabic);
    formData.append('descriptionEnglish', data.descriptionEnglish);
    formData.append('descriptionArabic', data.descriptionArabic);
    formData.append('price', data.price.toString());
    formData.append('discount', (data.discount || 0).toString());
    formData.append('discountType', data.discountType || 'percentage');
    formData.append('category', data.category);
    if (data.subCategory) formData.append('subCategory', data.subCategory);

    if (mainImageFile) {
      formData.append('mainImage', mainImageFile);
    }

    activeSubImages.forEach((img) => {
      if (img.type === 'new' && img.file) {
        formData.append('subImages', img.file);
      } else if (img.type === 'existing') {
        // Send existing subImages as JSON strings so the backend receives them in the body
        // This helps prevent overwriting with an empty array if the backend expects the full list
        formData.append('subImages', JSON.stringify({
          public_id: img.publicId,
          secure_url: img.url,
          _id: img.id
        }));
      }
    });

    if (deletedSubImages.length > 0) {
      formData.append('deletedSubImages', JSON.stringify(deletedSubImages));
    }

    if (variants.length > 0) {
      formData.append('variants', JSON.stringify(variants));
    }

    try {
      await onSubmitProp(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Create New Product'}
          </DialogTitle>
          <DialogDescription>
            {product
              ? 'Update the product information below.'
              : 'Fill in the details to create a new product.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(_handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="titleEnglish"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Title (English)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter English title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="titleArabic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Title (Arabic)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Arabic title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="descriptionEnglish"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (English)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter English description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descriptionArabic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Arabic)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter Arabic description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (L.E)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.nameEnglish}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub Category (optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCategoryId || derivedSubCategories.length === 0}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedCategoryId ? (derivedSubCategories.length ? 'Select subcategory' : 'No subcategories') : 'Select a category first'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {derivedSubCategories.map((sub) => (
                              <SelectItem key={sub._id} value={sub._id}>
                                {sub.nameEnglish || sub.nameArabic || sub._id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <FormLabel>Main Image</FormLabel>
                  <div className="mt-2">
                    <input
                      ref={mainImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="hidden"
                      id="main-image-upload"
                      disabled={isCompressing}
                    />
                    <label
                      htmlFor="main-image-upload"
                      className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isCompressing ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      {mainImagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={mainImagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeMainImage}
                            disabled={isCompressing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          {isCompressing ? (
                            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                          ) : (
                            <Upload className="h-8 w-8 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-500">
                            {isCompressing ? 'Processing image...' : 'Click to upload main image'}
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <FormLabel>Additional Images</FormLabel>
                  <div className="mt-2">
                    <input
                      ref={subImagesInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleSubImagesChange}
                      className="hidden"
                      id="sub-images-upload"
                      disabled={isCompressing}
                    />
                    <label
                      htmlFor="sub-images-upload"
                      className={`flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isCompressing ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        {isCompressing ? (
                          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                        ) : (
                          <Upload className="h-6 w-6 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-500">
                          {isCompressing ? 'Processing images...' : 'Click to upload additional images'}
                        </span>
                      </div>
                    </label>
                  </div>
                  {activeSubImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {activeSubImages.map((img, index) => (
                        <div key={img.id} className="relative">
                          <img
                            src={img.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removeSubImage(index)}
                            disabled={isCompressing}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Variants</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant} disabled={isCompressing}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Variants (Edit Mode Only) */}
                {product && existingVariants.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">Existing Variants</h4>
                    {existingVariants.map((variant) => (
                      <div key={variant.variantId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: variant.color }}
                            />
                            <span className="font-medium">{variant.color}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openAddSizeModal(variant.variantId, variant.color)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Size
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteVariant(variant.variantId)}
                              disabled={isDeletingVariantId === variant.variantId}
                            >
                              {isDeletingVariantId === variant.variantId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {variant.sizes.map((size) => (
                            <div key={size.sizeId} className="flex items-center justify-between bg-background p-2 rounded">
                              <div className="flex items-center gap-4">
                                <span className="font-medium">Size: {size.size}</span>
                                <span className="text-muted-foreground">Stock: {size.stock}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditVariantModal(variant.variantId, size.sizeId, variant.color, size.size, size.stock)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteSizeOfVariant(variant.variantId, size.sizeId)}
                                  disabled={isDeletingSizeId === size.sizeId}
                                >
                                  {isDeletingSizeId === size.sizeId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Variants (Edit Mode) */}
                {product && newVariants.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">New Variants to Add</h4>
                    {newVariants.map((variant, variantIndex) => (
                      <div key={variantIndex} className="border rounded-lg p-4 space-y-4 border-dashed border-green-500">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-green-600">New Variant</h4>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeNewVariant(variantIndex)}
                            disabled={isCompressing}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <FormLabel>Color</FormLabel>
                            <ColorPicker
                              value={variant.color}
                              onChange={(color) => updateNewVariant(variantIndex, 'color', color)}
                              placeholder="Enter color"
                              disabled={isCompressing}
                            />
                          </div>

                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addNewVariantSize(variantIndex)}
                              disabled={isCompressing}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Size
                            </Button>
                          </div>
                        </div>

                        {variant.size.map((size, sizeIndex) => (
                          <div key={sizeIndex} className="grid grid-cols-2 gap-4">
                            <div>
                              <FormLabel>Size</FormLabel>
                              <Input
                                value={size.size}
                                onChange={(e) => updateNewVariantSize(variantIndex, sizeIndex, 'size', e.target.value)}
                                placeholder="Enter size"
                                disabled={isCompressing}
                              />
                            </div>
                            <div className="flex items-end space-x-2">
                              <div className="flex-1">
                                <FormLabel>Stock</FormLabel>
                                <Input
                                  type="number"
                                  value={size.stock}
                                  onChange={(e) => updateNewVariantSize(variantIndex, sizeIndex, 'stock', parseInt(e.target.value) || 0)}
                                  placeholder="0"
                                  disabled={isCompressing}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeNewVariantSize(variantIndex, sizeIndex)}
                                disabled={isCompressing}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                    <Button
                      type="button"
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleAddNewVariants}
                      disabled={isAddVariantSubmitting || newVariants.some(v => !v.color || v.size.length === 0)}
                    >
                      {isAddVariantSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding Variants...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Save New Variants
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Create Mode Variants */}
                {!product && variants.map((variant, variantIndex) => (
                  <div key={variantIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variant {variantIndex + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeVariant(variantIndex)}
                        disabled={isCompressing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <FormLabel>Color</FormLabel>
                        <ColorPicker
                          value={variant.color}
                          onChange={(color) => updateVariant(variantIndex, 'color', color)}
                          placeholder="Enter color"
                          disabled={isCompressing}
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addVariantSize(variantIndex)}
                          disabled={isCompressing}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Size
                        </Button>
                      </div>
                    </div>

                    {variant.size.map((size, sizeIndex) => (
                      <div key={sizeIndex} className="grid grid-cols-2 gap-4">
                        <div>
                          <FormLabel>Size</FormLabel>
                          <Input
                            value={size.size}
                            onChange={(e) => updateVariantSize(variantIndex, sizeIndex, 'size', e.target.value)}
                            placeholder="Enter size"
                            disabled={isCompressing}
                          />
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <FormLabel>Stock</FormLabel>
                            <Input
                              type="number"
                              value={size.stock}
                              onChange={(e) => updateVariantSize(variantIndex, sizeIndex, 'stock', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              disabled={isCompressing}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeVariantSize(variantIndex, sizeIndex)}
                            disabled={isCompressing}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Edit Variant Modal */}
            {editingVariant && (
              <Dialog open={!!editingVariant} onOpenChange={() => setEditingVariant(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Variant</DialogTitle>
                    <DialogDescription>
                      Update the variant details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <FormLabel>Color</FormLabel>
                      <ColorPicker
                        value={editingVariant.color}
                        onChange={(color) => setEditingVariant({ ...editingVariant, color })}
                        placeholder="Choose color"
                      />
                    </div>
                    <div>
                      <FormLabel>Size</FormLabel>
                      <Input
                        value={editingVariant.size}
                        onChange={(e) => setEditingVariant({ ...editingVariant, size: e.target.value })}
                        placeholder="Enter size"
                      />
                    </div>
                    <div>
                      <FormLabel>Stock</FormLabel>
                      <Input
                        type="number"
                        value={editingVariant.stock}
                        onChange={(e) => setEditingVariant({ ...editingVariant, stock: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingVariant(null)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90"
                      onClick={handleEditVariant}
                      disabled={isEditVariantSubmitting}
                    >
                      {isEditVariantSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Variant'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Add Size to Variant Modal */}
            {addingSizeToVariant && (
              <Dialog open={!!addingSizeToVariant} onOpenChange={() => setAddingSizeToVariant(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Size to Variant</DialogTitle>
                    <DialogDescription>
                      Add new sizes to the <span className="font-semibold">{addingSizeToVariant.color}</span> variant.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {addingSizeToVariant.sizes.map((sizeItem, index) => (
                      <div key={index} className="flex items-end gap-2">
                        <div className="flex-1">
                          <FormLabel>Size</FormLabel>
                          <Input
                            value={sizeItem.size}
                            onChange={(e) => updateSizeInput(index, 'size', e.target.value)}
                            placeholder="e.g. XL, M, 42"
                          />
                        </div>
                        <div className="flex-1">
                          <FormLabel>Stock</FormLabel>
                          <Input
                            type="number"
                            value={sizeItem.stock}
                            onChange={(e) => updateSizeInput(index, 'stock', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        {addingSizeToVariant.sizes.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSizeInput(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSizeInput}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Size
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddingSizeToVariant(null)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90"
                      onClick={handleAddSizeToVariant}
                      disabled={isAddSizeSubmitting}
                    >
                      {isAddSizeSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Sizes'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isCompressing}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90"
                disabled={isSubmitting || isCompressing}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {product ? 'Updating...' : 'Creating...'}
                  </>
                ) : isCompressing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Images...
                  </>
                ) : (
                  product ? 'Update Product' : 'Create Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;


