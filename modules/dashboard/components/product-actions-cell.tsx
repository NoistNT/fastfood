'use client';

import type { ProductWithIngredients } from '@/modules/products/types';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/modules/core/ui/button';
import { ConfirmationDialog } from '@/modules/core/ui/confirmation-dialog';
import { useToast } from '@/modules/core/hooks/use-toast';

interface ProductActionsCellProps {
  product: ProductWithIngredients;
  onEdit: (product: ProductWithIngredients) => void;
}

export function ProductActionsCell({ product, onEdit }: ProductActionsCellProps) {
  const router = useRouter();
  const { toast } = useToast();
  const common = useTranslations('Common');
  const t = useTranslations('Features.dashboard.products');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleArchive = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${product.id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message ?? t('archive.failed'));
      }

      toast({ title: t('archive.success') });
      setConfirmOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: t('archive.failed'),
        description: error instanceof Error ? error.message : t('archive.failed'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        <Button
          onClick={() => onEdit(product)}
          variant="outline"
          size="sm"
        >
          {common('actions.edit')}
        </Button>
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={isDeleting}
          variant="destructive"
          size="sm"
        >
          {common('actions.archive')}
        </Button>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('archive.title')}
        description={t('archive.description')}
        confirmText={t('archive.confirm')}
        cancelText={t('archive.cancel')}
        onConfirm={handleArchive}
        isLoading={isDeleting}
      />
    </>
  );
}
