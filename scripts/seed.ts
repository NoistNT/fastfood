import { db } from '@/db/drizzle';
import { ingredients, productIngredients, products } from '@/db/schema';
import { ingredientsSeed, productIngredientsSeed, productsSeed } from '@/scripts/seed-data';

async function seedDatabase() {
  try {
    console.log('Seeding database');
    console.log('Seeding ingredients');
    await db.insert(ingredients).values(ingredientsSeed);
    console.log('Seeding products');
    await db.insert(products).values(productsSeed);
    console.log('Seeding product-ingredients');
    await db.insert(productIngredients).values(productIngredientsSeed);
    console.log('Database seeded!');
  } catch (error) {
    throw new Error('Failed to seed database');
  }
}

seedDatabase();
