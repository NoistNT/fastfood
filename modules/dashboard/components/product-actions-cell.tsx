'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/modules/core/ui/button';
import { useToast } from '@/modules/core/hooks/use-toast';

type ProductWithIngredients = {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  imageUrl: string;
  ingredients: string[];
  ingredientIds: number[];
};

interface ProductActionsCellProps {
  product: ProductWithIngredients;
  onEdit: (product: ProductWithIngredients) => void;
}

export function ProductActionsCell({ product, onEdit }: ProductActionsCellProps) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('Common');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to archive this product?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${product.id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? 'Failed to delete product');
      }

      toast({
        title: 'Success',
        description: 'Product archived successfully',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        onClick={() => onEdit(product)}
        variant="outline"
        size="sm"
      >
        {t('actions.edit')}
      </Button>
      <Button
        onClick={handleDelete}
        disabled={isDeleting}
        variant="destructive"
        size="sm"
      >
        {isDeleting ? t('actions.archiving') : t('actions.archive')}
      </Button>
    </div>
  );
}
