/* eslint-disable no-console */
import { db } from '@/db/drizzle'
import {
  ingredients,
  // orderItem,
  orders,
  productIngredients,
  products
} from '@/db/schema'
import {
  ingredientsSeed,
  ordersSeed,
  productIngredientsSeed,
  productsSeed
} from '@/scripts/seed-data'

async function seedProductIngredients() {
  try {
    console.log('Seeding product ingredients...')
    await db.insert(productIngredients).values(productIngredientsSeed)
    console.log('Product ingredients seeded!')
  } catch (error) {
    throw new Error('Failed to seed product ingredients')
  }
}

async function seedDatabase() {
  try {
    console.log('Seeding the database...')
    await db.insert(ingredients).values(ingredientsSeed)
    await db.insert(products).values(productsSeed)
    await db.insert(orders).values(ordersSeed)

    // Seed product-ingredients relationships
    await seedProductIngredients()
    console.log('Database seeded!')
  } catch (error) {
    throw new Error('Failed to seed database')
  }
}

seedDatabase()
