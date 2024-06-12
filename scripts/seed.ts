/* eslint-disable no-console */
import { db } from '@/db/drizzle'
import * as schema from '@/db/schema'

const ingredients = [
  {
    id: 1,
    name: 'Beef',
    price: 3.99,
    isVegetarian: false,
    isVegan: false,
    isAvailable: true
  },
  {
    id: 2,
    name: 'Cheese',
    price: 1.99,
    isVegetarian: false,
    isVegan: false,
    isAvailable: true
  },
  {
    id: 3,
    name: 'Lettuce',
    price: 0.99,
    isVegetarian: true,
    isVegan: false,
    isAvailable: true
  },
  {
    id: 4,
    name: 'Tomato',
    price: 0.99,
    isVegetarian: true,
    isVegan: false,
    isAvailable: true
  },
  {
    id: 5,
    name: 'Onion',
    price: 0.99,
    isVegetarian: true,
    isVegan: false,
    isAvailable: true
  }
]

const burgers = [
  {
    id: 1,
    name: 'Cheeseburger',
    description: 'A delicious cheeseburger.',
    price: 4.99,
    ingredientIds: [1, 2, 3],
    isVegetarian: false,
    isVeg: false,
    img: {
      src: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
      alt: 'Veggieburger image',
      title: 'Veggieburger image'
    },
    isAvailable: true
  },
  {
    id: 2,
    name: 'Veggieburger',
    description: 'A delicious veggieburger.',
    price: 4.99,
    ingredientIds: [2, 3],
    isVegetarian: false,
    isVeg: true,
    img: {
      src: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
      alt: 'Veggieburger image',
      title: 'Veggieburger image'
    },
    isAvailable: true
  },
  {
    id: 3,
    name: 'Vegan burger',
    description: 'A delicious vegan burger.',
    price: 4.99,
    ingredientIds: [3],
    isVegetarian: false,
    isVeg: false,
    img: {
      src: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
      alt: 'Veggieburger image',
      title: 'Veggieburger image'
    },
    isAvailable: true
  },
  {
    id: 4,
    name: 'Hamburger',
    description: 'A delicious hamburger.',
    price: 4.99,
    ingredientIds: [1, 2, 3, 4, 5],
    isVegetarian: false,
    isVeg: false,
    img: {
      src: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
      alt: 'Veggieburger image',
      title: 'Veggieburger image'
    },
    isAvailable: true
  }
]

// const orders = [
//   {
//     id: 1,
//     burgerId: 1,
//     quantity: 1
//   },
//   {
//     id: 2,
//     burgerId: 1,
//     quantity: 2
//   },
//   {
//     id: 3,
//     burgerId: 1,
//     quantity: 3
//   }
// ]

async function main() {
  try {
    console.log('Clearing the database...')
    await Promise.all([
      db.delete(schema.ingredient),
      db.delete(schema.burger)
      // db.delete(schema.order)
    ])

    console.log('Seeding the database...')
    await db.insert(schema.burger).values(burgers)
    await db.insert(schema.ingredient).values(ingredients)
    // await db.insert(schema.order).values(orders)
    console.log('Database seeded!')
  } catch (error) {
    throw new Error('Failed to seed database')
  }
}

main().then(() => process.exit(0))