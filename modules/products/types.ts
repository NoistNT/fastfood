import type { Product } from '@/types/db';

export type { Product };

export type ProductWithIngredients = Product & { ingredients: string[] };
