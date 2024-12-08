import type { InferSelectModel } from 'drizzle-orm';

import type { products } from '@/db/schema';

export type Product = InferSelectModel<typeof products>;

export type ProductGeneralView = Omit<Product, 'isVegan' | 'isVegetarian'>;

export type ProductWithIngredients = Product & { ingredients: string[] };
