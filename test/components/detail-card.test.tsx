import type { ProductWithIngredients } from '@/modules/products/types';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  getTranslations: () => Promise.resolve((key: string) => key),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

import DetailCard from '@/modules/products/components/detail-card';

const product: ProductWithIngredients = {
  id: 1,
  name: 'Classic Burger',
  description: 'A tasty burger',
  price: '8.99',
  imageUrl: null,
  available: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ingredients: ['Lettuce', 'Tomato'],
  ingredientIds: [1, 2],
};

describe('DetailCard', () => {
  it('renders name, price, description, and ingredients', async () => {
    render(await DetailCard({ product }));

    expect(screen.getByRole('heading', { name: 'Classic Burger' })).toBeInTheDocument();
    expect(screen.getByText('$8.99')).toBeInTheDocument();
    expect(screen.getByText('A tasty burger')).toBeInTheDocument();
    expect(screen.getByText('Lettuce')).toBeInTheDocument();
    expect(screen.getByText('Tomato')).toBeInTheDocument();
  });

  it('renders the purchase footer when available', async () => {
    render(await DetailCard({ product }));

    expect(
      screen.getByRole('button', { name: 'Add Classic Burger to order for $8.99' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View details for Classic Burger' })
    ).toBeInTheDocument();
  });

  it('renders the out-of-stock footer when unavailable', async () => {
    render(await DetailCard({ product: { ...product, available: false } }));

    expect(
      screen.getByRole('button', { name: 'Classic Burger is out of stock' })
    ).toBeInTheDocument();
  });

  it('omits the ingredients section when empty', async () => {
    render(await DetailCard({ product: { ...product, ingredients: [] } }));

    expect(screen.queryByText('ingredients')).not.toBeInTheDocument();
  });
});
