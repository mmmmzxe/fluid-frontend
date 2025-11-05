import React, { useState, useRef } from 'react';
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
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import { Product, Category, SubCategory } from '@/services/adminApi';
import { ColorPicker } from '@/components/ui/color-picker';

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

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onClose, onSubmit }) => {
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [subImageFiles, setSubImageFiles] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(
    product?.mainImage?.secure_url || null
  );
  const [subImagePreviews, setSubImagePreviews] = useState<string[]>(
    product?.subImages?.map(img => img.secure_url) || []
  );
  const [variants, setVariants] = useState<Array<{
    color: string;
    size: Array<{ size: string; stock: number }>;
    stock: number;
  }>>(
    (product?.variants || []).map(v => ({
      color: v.color,
      size: (v.size || []).map(s => ({ size: s.size || '', stock: s.stock })),
      stock: 0, // default stock; do not read v.stock
    }))
  );
  // Subcategories are derived from the selected category
  
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

  // Compress image in-browser via canvas (keeps aspect ratio)
  const compressImage = async (file: File, maxWidth = 1280, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, '.jpg'), { type: 'image/jpeg' });
          resolve(compressed);
        }, 'image/jpeg', quality);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMainImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setMainImageFile(compressed);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMainImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(compressed);
    }
  };

  const handleSubImagesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const compressedFiles = await Promise.all(files.map(f => compressImage(f)));
      setSubImageFiles(prev => [...prev, ...compressedFiles]);
      compressedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSubImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
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
    setSubImageFiles(prev => prev.filter((_, i) => i !== index));
    setSubImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { color: '', size: [{ size: '', stock: 0 }], stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setVariants(prev => prev.map((variant, i) => 
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

  const removeVariantSize = (variantIndex: number, sizeIndex: number) => {
    setVariants(prev => prev.map((variant, i) => 
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

  const handleSubmit = (data: ProductFormData) => {
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
    
    subImageFiles.forEach((file, index) => {
      formData.append('subImages', file);
    });

    if (variants.length > 0) {
      formData.append('variants', JSON.stringify(variants));
    }

    onSubmit(formData);
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                        <FormLabel>Price ($)</FormLabel>
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
                    />
                    <label
                      htmlFor="main-image-upload"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
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
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Click to upload main image
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
                    />
                    <label
                      htmlFor="sub-images-upload"
                      className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Click to upload additional images
                        </span>
                      </div>
                    </label>
                  </div>
                  {subImagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {subImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removeSubImage(index)}
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
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {variants.map((variant, variantIndex) => (
                  <div key={variantIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variant {variantIndex + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeVariant(variantIndex)}
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
                        />
                      </div>
                    
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addVariantSize(variantIndex)}
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
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeVariantSize(variantIndex, sizeIndex)}
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {product ? 'Update Product' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;


