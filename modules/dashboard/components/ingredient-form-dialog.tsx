'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/modules/core/ui/dialog';
import { Button } from '@/modules/core/ui/button';
import { Input } from '@/modules/core/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/modules/core/ui/form';
import { queryKeys } from '@/modules/core/hooks/use-api-cache';
import { useCSRFToken } from '@/modules/core/hooks/use-csrf-token';
import { toastNotifications } from '@/lib/toast-notifications';

interface IngredientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IngredientFormDialog({ open, onOpenChange }: IngredientFormDialogProps) {
  const t = useTranslations('Features.dashboard.inventory.form');
  const { getToken } = useCSRFToken();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const formSchema = z.object({
    name: z.string().trim().min(1, t('nameRequired')).max(120),
    unit: z.string().trim().min(1, t('unitRequired')).max(20),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, t('priceInvalid')),
    minThreshold: z
      .string()
      .refine((value) => value.trim() === '' || /^\d+$/.test(value.trim()), t('thresholdInvalid'))
      .optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', unit: '', price: '', minThreshold: '' },
  });

  const handleOpenChange = (next: boolean) => {
    // A pending save owns this session: ignore dismissals until it
    // settles, otherwise a late resolve would close a reopened form.
    if (!next && isSaving) return;
    onOpenChange(next);
  };

  const handleSubmit = form.handleSubmit(async (values: FormValues) => {
    setIsSaving(true);
    try {
      const csrfToken = await getToken();
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({
          name: values.name,
          unit: values.unit,
          price: values.price,
          ...(values.minThreshold?.trim()
            ? { minThreshold: parseInt(values.minThreshold, 10) }
            : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message ?? t('saveFailed'));
      }

      toastNotifications.success.ingredientCreated();
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toastNotifications.error.genericError(
        error instanceof Error ? error.message : t('saveFailed')
      );
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('titleCreate')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ingredient-name">{t('name')}</FormLabel>
                  <FormControl>
                    <Input
                      id="ingredient-name"
                      placeholder={t('name')}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="ingredient-unit">{t('unit')}</FormLabel>
                    <FormControl>
                      <Input
                        id="ingredient-unit"
                        placeholder={t('unitPlaceholder')}
                        autoComplete="off"
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
                    <FormLabel htmlFor="ingredient-price">{t('price')}</FormLabel>
                    <FormControl>
                      <Input
                        id="ingredient-price"
                        inputMode="decimal"
                        placeholder={t('pricePlaceholder')}
                        autoComplete="off"
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
              name="minThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ingredient-threshold">{t('threshold')}</FormLabel>
                  <FormControl>
                    <Input
                      id="ingredient-threshold"
                      type="number"
                      min={0}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  t('save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
