'use client';

import type { IngredientOption } from '@/modules/core/hooks/use-api-cache';
import type { ProductWithIngredients } from '@/modules/products/types';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/modules/core/ui/dialog';
import { Button } from '@/modules/core/ui/button';
import { Checkbox } from '@/modules/core/ui/checkbox';
import { Switch } from '@/modules/core/ui/switch';
import { Input } from '@/modules/core/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/modules/core/ui/form';
import { useCSRFToken } from '@/modules/core/hooks/use-csrf-token';
import { toastNotifications } from '@/lib/toast-notifications';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductWithIngredients;
  ingredients: IngredientOption[];
  onSuccess: () => void;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  ingredients,
  onSuccess,
}: ProductFormDialogProps) {
  const t = useTranslations('Features.dashboard.products.form');
  const tProducts = useTranslations('Features.dashboard.products');
  const { getToken } = useCSRFToken();
  const [isSaving, setIsSaving] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, t('nameRequired')),
    price: z
      .string()
      .min(1, t('priceInvalid'))
      .refine((val) => parseFloat(val) > 0, { message: t('priceInvalid') }),
    description: z.string().optional(),
    imageUrl: z.union([z.literal(''), z.url(t('imageUrlInvalid'))]).optional(),
    available: z.boolean(),
    ingredientIds: z.array(z.number()),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name ?? '',
      price: product?.price ?? '',
      description: product?.description ?? '',
      imageUrl: product?.imageUrl ?? '',
      available: product?.available ?? true,
      ingredientIds: product?.ingredientIds ?? [],
    },
  });

  const toggleIngredient = (id: number, checked: boolean) => {
    const current = form.getValues('ingredientIds');
    form.setValue(
      'ingredientIds',
      checked ? Array.from(new Set([...current, id])) : current.filter((i) => i !== id),
      { shouldValidate: true }
    );
  };

  const handleSubmit = form.handleSubmit(async (values: FormValues) => {
    setIsSaving(true);
    try {
      const csrfToken = await getToken();
      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          price: values.price,
          imageUrl: values.imageUrl,
          available: values.available,
          ingredientIds: values.ingredientIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message ?? 'Failed to save product');
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
      setIsSaving(false);
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? t('editProductTitle') : t('addProductTitle')}</DialogTitle>
          <DialogDescription>
            {product ? tProducts('editProductDescription') : tProducts('addProductDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="product-name">{t('name')}</FormLabel>
                    <FormControl>
                      <Input
                        id="product-name"
                        placeholder={t('namePlaceholder')}
                        {...field}
                      />
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
                    <FormLabel htmlFor="product-price">{t('price')}</FormLabel>
                    <FormControl>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={t('pricePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="product-imageUrl">{t('imageUrl')}</FormLabel>
                  <FormControl>
                    <Input
                      id="product-imageUrl"
                      type="url"
                      placeholder={t('imageUrlPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="product-description">{t('description')}</FormLabel>
                  <FormControl>
                    <Input
                      id="product-description"
                      placeholder={t('descriptionPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{t('available')}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ingredientIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ingredients')}</FormLabel>
                  <FormDescription>{t('ingredientsHint')}</FormDescription>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-md border p-3">
                      {ingredients.length === 0 ? (
                        <p className="col-span-2 text-sm text-muted-foreground">
                          {t('ingredientsEmpty')}
                        </p>
                      ) : (
                        ingredients.map((ingredient) => (
                          <label
                            key={ingredient.id}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <Checkbox
                              checked={field.value.includes(ingredient.id)}
                              onCheckedChange={(checked) =>
                                toggleIngredient(ingredient.id, checked === true)
                              }
                            />
                            <span>
                              {ingredient.name}
                              <span className="text-muted-foreground"> ({ingredient.unit})</span>
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? t('saving') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
