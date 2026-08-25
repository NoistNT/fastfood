'use client';

import type { CheckoutDetails, OrderType } from '@/modules/orders/types';

import { useTranslations } from 'next-intl';

import { Input } from '@/modules/core/ui/input';
import { Label } from '@/modules/core/ui/label';

export interface CheckoutFormState {
  fullName: string;
  phoneNumber: string;
  email: string;
  orderType: OrderType;
  deliveryAddress: string;
  deliveryNotes: string;
}

export const emptyCheckoutDetails: CheckoutFormState = {
  fullName: '',
  phoneNumber: '',
  email: '',
  orderType: 'pickup',
  deliveryAddress: '',
  deliveryNotes: '',
};

interface CheckoutDetailsFormProps {
  value: CheckoutFormState;
  onChange: (patch: Partial<CheckoutFormState>) => void;
}

/**
 * Contact + fulfillment details for storefront checkout. Shown to everyone:
 * signed-in buyers get it prefilled from their session and guests type it
 * once. Address appears only for delivery, mirroring staff intake rules.
 */
export function CheckoutDetailsForm({ value, onChange }: CheckoutDetailsFormProps) {
  const t = useTranslations('Features.orders.checkout');
  const radioLabelClass = 'flex items-center gap-2 text-sm';
  const isDelivery = value.orderType === 'delivery';

  return (
    <section
      className="space-y-4 rounded-lg border p-4"
      aria-labelledby="checkout-details-title"
    >
      <h2
        id="checkout-details-title"
        className="text-sm font-medium"
      >
        {t('title')}
      </h2>

      <div
        className="flex gap-4"
        role="radiogroup"
        aria-label={t('orderType')}
      >
        <label className={radioLabelClass}>
          <input
            type="radio"
            name="orderType"
            value="pickup"
            checked={!isDelivery}
            onChange={() => onChange({ orderType: 'pickup' })}
          />
          {t('pickup')}
        </label>
        <label className={radioLabelClass}>
          <input
            type="radio"
            name="orderType"
            value="delivery"
            checked={isDelivery}
            onChange={() => onChange({ orderType: 'delivery' })}
          />
          {t('delivery')}
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="checkout-name">{t('fullName')}</Label>
          <Input
            id="checkout-name"
            placeholder={t('fullName')}
            autoComplete="name"
            required
            value={value.fullName}
            onChange={(event) => onChange({ fullName: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="checkout-phone">{t('phone')}</Label>
          <Input
            id="checkout-phone"
            type="tel"
            placeholder={t('phone')}
            autoComplete="tel"
            required
            value={value.phoneNumber}
            onChange={(event) => onChange({ phoneNumber: event.target.value })}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="checkout-email">{t('email')}</Label>
          <Input
            id="checkout-email"
            type="email"
            placeholder={t('emailOptional')}
            autoComplete="email"
            value={value.email}
            onChange={(event) => onChange({ email: event.target.value })}
          />
        </div>
        {isDelivery && (
          <>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="checkout-address">{t('address')}</Label>
              <Input
                id="checkout-address"
                placeholder={t('address')}
                autoComplete="street-address"
                required
                value={value.deliveryAddress}
                onChange={(event) => onChange({ deliveryAddress: event.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="checkout-notes">{t('notes')}</Label>
              <Input
                id="checkout-notes"
                placeholder={t('notes')}
                value={value.deliveryNotes}
                onChange={(event) => onChange({ deliveryNotes: event.target.value })}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/** Narrows form state into the API payload shape. */
export function toCheckoutDetails(state: CheckoutFormState): CheckoutDetails {
  return {
    person: {
      fullName: state.fullName.trim(),
      phoneNumber: state.phoneNumber.trim(),
      ...(state.email.trim() ? { email: state.email.trim() } : {}),
    },
    orderType: state.orderType,
    ...(state.orderType === 'delivery'
      ? {
          deliveryAddress: state.deliveryAddress.trim(),
          ...(state.deliveryNotes.trim() ? { deliveryNotes: state.deliveryNotes.trim() } : {}),
        }
      : {}),
  };
}
