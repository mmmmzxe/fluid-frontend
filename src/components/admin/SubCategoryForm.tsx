import React from 'react';
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
import { SubCategory, Category } from '@/services/adminApi';

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
  const form = useForm<SubCategoryFormData>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      nameEnglish: subCategory?.nameEnglish || '',
      nameArabic: subCategory?.nameArabic || '',
      categoryId: subCategory?.categoryId || '',
    },
  });

  const handleSubmit = (data: SubCategoryFormData) => {
    const submitData = {
      ...data,
      _id: subCategory?._id,
    };
    onSubmit(submitData);
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
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {subCategory ? 'Update SubCategory' : 'Create SubCategory'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SubCategoryForm;


