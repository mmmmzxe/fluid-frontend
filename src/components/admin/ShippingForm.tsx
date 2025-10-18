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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shipping } from '@/services/adminApi';

const shippingSchema = z.object({
  government: z.string().min(1, 'Government is required'),
  price: z.number().min(0, 'Price must be positive'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  shipping?: Shipping | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({ shipping, onClose, onSubmit }) => {
  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      government: shipping?.government || '',
      price: shipping?.price || 0,
    },
  });

  const handleSubmit = (data: ShippingFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {shipping ? 'Edit Shipping Option' : 'Create New Shipping Option'}
          </DialogTitle>
          <DialogDescription>
            {shipping 
              ? 'Update the shipping option information below.'
              : 'Fill in the details to create a new shipping option.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="government"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Government</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cairo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {shipping ? 'Update Shipping Option' : 'Create Shipping Option'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ShippingForm;


