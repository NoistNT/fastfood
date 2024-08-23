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
    description:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis dolor molestias, sunt eaque nemo!. Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
    price: 4.99,
    ingredientIds: [1, 2, 3],
    isVegetarian: true,
    isVeg: false,
    imgSrc:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    imgAlt: 'Veggieburger image',
    isAvailable: true
  },
  {
    id: 2,
    name: 'Veggieburger',
    description:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis dolor molestias, sunt eaque nemo!. Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
    price: 4.99,
    ingredientIds: [2, 3],
    isVegetarian: false,
    isVeg: true,
    imgSrc:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    imgAlt: 'Veggieburger image',
    isAvailable: true
  },
  {
    id: 3,
    name: 'Vegan burger',
    description:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis dolor molestias, sunt eaque nemo!. Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
    price: 4.99,
    ingredientIds: [3],
    isVegetarian: false,
    isVeg: false,
    imgSrc:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    imgAlt: 'Veggieburger image',
    isAvailable: true
  },
  {
    id: 4,
    name: 'Hamburger',
    description:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis dolor molestias, sunt eaque nemo!. Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
    price: 4.99,
    ingredientIds: [1, 2, 3, 4, 5],
    isVegetarian: false,
    isVeg: false,
    imgSrc:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    imgAlt: 'Veggieburger image',
    isAvailable: true
  }
]

const orderItems = [
  {
    id: 1,
    orderId: 1,
    burgerId: 1,
    quantity: 1
  },
  {
    id: 2,
    orderId: 1,
    burgerId: 2,
    quantity: 2
  },
  {
    id: 3,
    orderId: 1,
    burgerId: 3,
    quantity: 1
  },
  {
    id: 4,
    orderId: 2,
    burgerId: 4,
    quantity: 2
  },
  {
    id: 5,
    orderId: 2,
    burgerId: 1,
    quantity: 1
  }
]

const createdAt = new Date() as unknown as string

const orders = [
  {
    id: 1,
    totalAmount: 37.99,
    orderItemIds: [1, 2, 3],
    createdAt
  },
  {
    id: 2,
    totalAmount: 9.99,
    orderItemIds: [1, 2, 3],
    createdAt
  }
]

async function main() {
  try {
    console.log('Clearing the database...')
    await Promise.all([
      db.delete(schema.ingredients),
      db.delete(schema.burgers),
      db.delete(schema.orders),
      db.delete(schema.orderItem)
    ])

    console.log('Seeding the database...')
    await db.insert(schema.burgers).values(burgers)
    await db.insert(schema.ingredients).values(ingredients)
    await db.insert(schema.orders).values(orders)
    await db.insert(schema.orderItem).values(orderItems)
    console.log('Database seeded!')
  } catch (error) {
    throw new Error('Failed to seed database')
  }
}

main().then(() => process.exit(0))
