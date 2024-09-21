import type { products } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

export type Product = InferSelectModel<typeof products>

export type ProductGeneralView = Omit<Product, 'isVegan' | 'isVegetarian'>

export type ProductWithIngredients = Product & { ingredients: string[] }
