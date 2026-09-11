'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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
import { Input } from '@/modules/core/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/modules/core/ui/form';
import { useCSRFToken } from '@/modules/core/hooks/use-csrf-token';
import { toastNotifications } from '@/lib/toast-notifications';

export interface DirectoryPerson {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
}

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: DirectoryPerson | null;
  onSuccess: () => void;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  person,
  onSuccess,
}: CustomerFormDialogProps) {
  const t = useTranslations('Features.dashboard.customers.form');
  const { getToken } = useCSRFToken();
  const [isSaving, setIsSaving] = useState(false);

  const formSchema = z.object({
    name: z.string().trim().min(1, t('nameRequired')).max(120),
    phoneNumber: z.string().trim().max(40).optional(),
    email: z
      .string()
      .trim()
      .refine((value) => value === '' || /.+@.+\..+/.test(value), t('emailInvalid'))
      .optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', phoneNumber: '', email: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: person?.name ?? '',
        phoneNumber: person?.phoneNumber ?? '',
        email: person?.email ?? '',
      });
    }
  }, [open, person, form]);

  const handleSubmit = form.handleSubmit(async (values: FormValues) => {
    setIsSaving(true);
    try {
      const csrfToken = await getToken();
      const url = person ? `/api/customers/${person.id}/edit` : '/api/customers';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({
          name: values.name,
          phoneNumber: values.phoneNumber,
          email: values.email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message ?? t('saveFailed'));
      }

      if (person) {
        toastNotifications.success.customerUpdated();
      } else {
        toastNotifications.success.customerCreated();
      }

      onSuccess();
      onOpenChange(false);
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
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{person ? t('titleEdit') : t('titleCreate')}</DialogTitle>
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
                  <FormLabel htmlFor="person-name">{t('fullName')}</FormLabel>
                  <FormControl>
                    <Input
                      id="person-name"
                      placeholder={t('fullName')}
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="person-phone">{t('phone')}</FormLabel>
                  <FormControl>
                    <Input
                      id="person-phone"
                      type="tel"
                      placeholder={t('phone')}
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="person-email">{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      id="person-email"
                      type="email"
                      placeholder={t('emailOptional')}
                      autoComplete="email"
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
                onClick={() => onOpenChange(false)}
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
