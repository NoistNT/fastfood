'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/modules/core/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/modules/core/ui/dialog';
import { Input } from '@/modules/core/ui/input';
import { Label } from '@/modules/core/ui/label';
import { toastNotifications } from '@/lib/toast-notifications';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: {
    id: number;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    available: boolean;
    ingredientIds: number[];
  };
  onSuccess: () => void;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductFormDialogProps) {
  const t = useTranslations('Features.dashboard.products');

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    available: boolean;
    ingredientIds: number[];
  }>({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    available: true,
    ingredientIds: [],
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        available: product.available,
        ingredientIds: product.ingredientIds,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        available: true,
        ingredientIds: [],
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? 'Failed to save product');
      }

      if (product) {
        toastNotifications.success.productUpdated();
      } else {
        toastNotifications.success.productCreated();
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toastNotifications.error.genericError(
        error instanceof Error ? error.message : 'Failed to save product'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string | boolean | number[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? t('editProduct') : t('addProduct')}</DialogTitle>
          <DialogDescription>
            {product ? t('editProductDescription') : t('addProductDescription')}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => updateFormData('price', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => updateFormData('imageUrl', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="available">Available</Label>
              <Input
                id="available"
                type="checkbox"
                checked={formData.available}
                onChange={(e) => updateFormData('available', e.target.checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? product
                  ? 'Updating...'
                  : 'Creating...'
                : product
                  ? 'Update'
                  : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
