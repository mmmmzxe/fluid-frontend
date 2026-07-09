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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Loader2 } from 'lucide-react';
import { SubCategory, Category } from '@/services/adminApi';
import { compressImage } from '@/utils/imageCompression';
import { normalizeImageUrl } from '@/lib/utils';
import { getCategoryId } from '@/utils/adminHelpers';

const subCategorySchema = z.object({
  nameEnglish: z.string().min(1, 'English name is required'),
  nameArabic: z.string().min(1, 'Arabic name is required'),
  categoryId: z.string().min(1, 'Category is required'),
});

type SubCategoryFormData = z.infer<typeof subCategorySchema>;

interface SubCategoryFormProps {
  subCategory?: SubCategory | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const SubCategoryForm: React.FC<SubCategoryFormProps> = ({ 
  subCategory, 
  categories, 
  onClose, 
  onSubmit 
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    normalizeImageUrl(subCategory?.image?.secure_url) || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SubCategoryFormData>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      nameEnglish: subCategory?.nameEnglish || '',
      nameArabic: subCategory?.nameArabic || '',
      categoryId: getCategoryId(subCategory?.categoryId) || '',
    },
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const compressedFile = await compressImage(file);
        setImageFile(compressedFile);

        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original file
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (data: SubCategoryFormData) => {
    setIsSubmitting(true);
    const submitData = {
      ...data,
      image: imageFile,
      _id: subCategory?._id,
    };
    try {
      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {subCategory ? 'Edit SubCategory' : 'Create New SubCategory'}
          </DialogTitle>
          <DialogDescription>
            {subCategory 
              ? 'Update the subcategory information below.'
              : 'Fill in the details to create a new subcategory.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SubCategory Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nameEnglish"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SubCategory Name (English)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter English name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nameArabic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SubCategory Name (Arabic)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Arabic name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent category" />
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

                {/* Image Upload */}
                <div className="space-y-2">
                  <FormLabel>SubCategory Image</FormLabel>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="subcategory-image-upload"
                      />
                      <label
                        htmlFor="subcategory-image-upload"
                        className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isCompressing ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}
                      >
                        {imagePreview ? (
                          <div className="relative w-full h-full">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={removeImage}
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
                              {isCompressing ? 'Processing image...' : 'Click to upload image'}
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    {subCategory ? 'Updating...' : 'Creating...'}
                  </>
                ) : isCompressing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  subCategory ? 'Update SubCategory' : 'Create SubCategory'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SubCategoryForm;


