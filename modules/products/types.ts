import type { Product } from '@/types/db';

export type { Product };

export type ProductGeneralView = Omit<Product, 'isVegan' | 'isVegetarian'>;

export type ProductWithIngredients = Product & { ingredients: string[] };
