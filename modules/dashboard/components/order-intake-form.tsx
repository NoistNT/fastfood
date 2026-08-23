'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { ArrowLeft, Loader2, Plus, Search, X } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/modules/core/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/modules/core/ui/form';
import { Input } from '@/modules/core/ui/input';
import { toast } from '@/modules/core/hooks/use-toast';
import { useCSRFToken } from '@/modules/core/hooks/use-csrf-token';
import { toastNotifications } from '@/lib/toast-notifications';

interface PickerPerson {
  id: string;
  name: string;
  phoneNumber: string | null;
  hasCredentials: boolean;
}

interface ProductOption {
  id: number;
  name: string;
  price: string;
}

type CustomerMode = 'existing' | 'new';

const SEARCH_MIN_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

export default function OrderIntakeForm() {
  const t = useTranslations('Features.dashboard.orders.intake');
  const router = useRouter();
  const { getToken } = useCSRFToken();
  const [isSaving, setIsSaving] = useState(false);

  const [customerMode, setCustomerMode] = useState<CustomerMode>('existing');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PickerPerson[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PickerPerson | null>(null);

  const [products, setProducts] = useState<ProductOption[]>([]);

  const intakeSchema = useMemo(
    () =>
      z
        .object({
          personName: z.string().trim().min(1, t('customerRequired')).max(120),
          personPhone: z.string().trim().max(40).optional(),
          items: z
            .array(
              z.object({
                productId: z.number().int().positive(),
                quantity: z.number().int().min(1).max(99),
              })
            )
            .min(1, t('itemsRequired')),
          orderType: z.enum(['pickup', 'delivery']),
          paymentMethod: z.enum(['cash', 'card', 'online']),
          deliveryAddress: z.string().trim().max(500).optional(),
          deliveryNotes: z.string().trim().max(500).optional(),
        })
        .superRefine((value, ctx) => {
          if (value.orderType === 'delivery' && !value.deliveryAddress?.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: ['deliveryAddress'],
              message: t('addressRequired'),
            });
          }
        }),
    [t]
  );

  type FormValues = z.infer<typeof intakeSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      personName: '',
      personPhone: '',
      items: [],
      orderType: 'pickup',
      paymentMethod: 'cash',
      deliveryAddress: '',
      deliveryNotes: '',
    },
  });

  const items = useWatch({ control: form.control, name: 'items' });
  const orderType = useWatch({ control: form.control, name: 'orderType' });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/products')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('failed'))))
      .then((body) => {
        if (cancelled) return;
        const rows = Array.isArray(body?.data) ? body.data : [];
        setProducts(
          rows
            .filter(
              (product: ProductOption & { available?: boolean }) => product.available !== false
            )
            .map((product: ProductOption) => ({
              id: product.id,
              name: product.name,
              price: product.price,
            }))
        );
      })
      .catch(() => {
        console.error('Product list failed to load for intake form');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (customerMode !== 'existing' || searchQuery.trim().length < SEARCH_MIN_LENGTH) {
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/customers/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error('failed'))))
        .then((body) => {
          setSearchResults(Array.isArray(body?.data?.people) ? body.data.people : []);
        })
        .catch((error: unknown) => {
          if ((error as Error)?.name !== 'AbortError') {
            console.error('Customer search failed with a request error');
          }
        })
        .finally(() => setIsSearching(false));
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [customerMode, searchQuery]);

  const choosePerson = (person: PickerPerson) => {
    setSelectedPerson(person);
    form.setValue('personName', person.name, { shouldValidate: true });
    form.setValue('personPhone', person.phoneNumber ?? '', { shouldValidate: false });
  };

  const switchCustomerMode = (mode: CustomerMode) => {
    setCustomerMode(mode);
    setSelectedPerson(null);
    setSearchQuery('');
    setSearchResults([]);
    form.setValue('personName', '');
    form.setValue('personPhone', '');
  };

  const addItemRow = () => {
    if (products.length === 0) return;
    form.setValue('items', [...items, { productId: products[0].id, quantity: 1 }], {
      shouldValidate: true,
    });
  };

  const updateItemRow = (
    index: number,
    patch: Partial<{ productId: number; quantity: number }>
  ) => {
    form.setValue(
      'items',
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
      { shouldValidate: true }
    );
  };

  const removeItemRow = (index: number) => {
    form.setValue(
      'items',
      items.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const estimatedTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      return sum + (product ? parseFloat(product.price) * item.quantity : 0);
    }, 0);
  }, [items, products]);

  const handleSubmit = form.handleSubmit(async (values: FormValues) => {
    setIsSaving(true);
    try {
      const csrfToken = await getToken();
      const response = await fetch('/api/dashboard/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({
          person: {
            name: values.personName,
            phoneNumber: values.personPhone ?? null,
          },
          items: values.items,
          orderType: values.orderType,
          paymentMethod: values.paymentMethod,
          deliveryAddress: orderType === 'delivery' ? values.deliveryAddress : null,
          deliveryNotes: orderType === 'delivery' ? values.deliveryNotes : null,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error?.message ?? 'Failed to create order');
      }

      toast({ description: t('successToast') });
      router.push('/dashboard/orders');
    } catch (error) {
      toastNotifications.error.genericError(
        error instanceof Error ? error.message : 'Failed to create order'
      );
    } finally {
      setIsSaving(false);
    }
  });

  const radioLabelClass = 'flex items-center gap-2 text-sm';
  const searchTooShort = searchQuery.trim().length < SEARCH_MIN_LENGTH;
  const visibleResults = searchTooShort ? [] : searchResults;

  return (
    <div className="space-y-6">
      <Button
        asChild
        variant="ghost"
        size="sm"
      >
        <Link href="/dashboard/orders">
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t('back')}
        </Link>
      </Button>

      <Form {...form}>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
        >
          <fieldset className="space-y-3 rounded-md border p-4">
            <legend className="px-1 text-sm font-medium">{t('customer')}</legend>

            <div className="flex gap-2">
              <Button
                type="button"
                variant={customerMode === 'existing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchCustomerMode('existing')}
              >
                {t('customerExisting')}
              </Button>
              <Button
                type="button"
                variant={customerMode === 'new' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchCustomerMode('new')}
              >
                {t('customerNew')}
              </Button>
            </div>

            {customerMode === 'existing' && !selectedPerson && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="pl-8"
                    aria-label={t('searchPlaceholder')}
                  />
                </div>
                {isSearching && <p className="text-sm text-muted-foreground">{t('searching')}</p>}
                {!isSearching && !searchTooShort && visibleResults.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('searchEmpty')}</p>
                )}
                {visibleResults.length > 0 && (
                  <ul className="divide-y rounded-md border">
                    {visibleResults.map((person) => (
                      <li key={person.id}>
                        <button
                          type="button"
                          onClick={() => choosePerson(person)}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                        >
                          <span>{person.name}</span>
                          <span className="text-muted-foreground">{person.phoneNumber ?? ''}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {customerMode === 'existing' && selectedPerson && (
              <div className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span>
                  <span className="text-muted-foreground">{t('selectedLabel')}: </span>
                  {selectedPerson.name}
                  {selectedPerson.phoneNumber ? ` · ${selectedPerson.phoneNumber}` : ''}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => switchCustomerMode('existing')}
                >
                  {t('change')}
                </Button>
              </div>
            )}

            {customerMode === 'new' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="personName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="intake-name">{t('name')}</FormLabel>
                      <FormControl>
                        <Input
                          id="intake-name"
                          placeholder={t('name')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="intake-phone">{t('phone')}</FormLabel>
                      <FormControl>
                        <Input
                          id="intake-phone"
                          placeholder={t('phone')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {customerMode === 'existing' && !selectedPerson && (
              <FormField
                control={form.control}
                name="personName"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </fieldset>

          <fieldset className="space-y-3 rounded-md border p-4">
            <legend className="px-1 text-sm font-medium">{t('items')}</legend>

            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('itemsRequired')}</p>
            )}

            <ul className="space-y-2">
              {items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2"
                >
                  <select
                    aria-label={t('items')}
                    value={item.productId}
                    onChange={(event) =>
                      updateItemRow(index, { productId: Number(event.target.value) })
                    }
                    className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} · ${product.price}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    aria-label={t('quantity')}
                    value={item.quantity}
                    onChange={(event) =>
                      updateItemRow(index, { quantity: Number(event.target.value) })
                    }
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t('removeItem')}
                    onClick={() => removeItemRow(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItemRow}
                disabled={products.length === 0}
              >
                <Plus className="mr-1 h-4 w-4" />
                {t('addItem')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('estimatedTotal')}: ${estimatedTotal.toFixed(2)}
              </span>
            </div>
            <FormField
              control={form.control}
              name="items"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>

          <div className="grid gap-6 sm:grid-cols-2">
            <fieldset className="space-y-3 rounded-md border p-4">
              <legend className="px-1 text-sm font-medium">{t('delivery')}</legend>
              <FormField
                control={form.control}
                name="orderType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-4">
                        <label className={radioLabelClass}>
                          <input
                            type="radio"
                            name={field.name}
                            value="pickup"
                            checked={field.value === 'pickup'}
                            onChange={() => field.onChange('pickup')}
                            className="accent-primary"
                          />
                          {t('pickup')}
                        </label>
                        <label className={radioLabelClass}>
                          <input
                            type="radio"
                            name={field.name}
                            value="delivery"
                            checked={field.value === 'delivery'}
                            onChange={() => field.onChange('delivery')}
                            className="accent-primary"
                          />
                          {t('delivery')}
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {orderType === 'delivery' && (
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="intake-address">{t('address')}</FormLabel>
                        <FormControl>
                          <Input
                            id="intake-address"
                            placeholder={t('addressPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="intake-notes">{t('notes')}</FormLabel>
                        <FormControl>
                          <Input
                            id="intake-notes"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </fieldset>

            <fieldset className="space-y-3 rounded-md border p-4">
              <legend className="px-1 text-sm font-medium">{t('payment')}</legend>
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-4">
                        {(['cash', 'card', 'online'] as const).map((method) => (
                          <label
                            key={method}
                            className={radioLabelClass}
                          >
                            <input
                              type="radio"
                              name={field.name}
                              value={method}
                              checked={field.value === method}
                              onChange={() => field.onChange(method)}
                              className="accent-primary"
                            />
                            {t(method)}
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving || products.length === 0}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? t('submitting') : t('submit')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
