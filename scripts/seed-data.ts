export const ingredientsSeed = [
  {
    name: 'Lettuce',
    price: 0.5,
    isVegetarian: true,
    isVegan: true,
    isAvailable: true
  },
  {
    name: 'Tomato',
    price: 0.7,
    isVegetarian: true,
    isVegan: true,
    isAvailable: true
  },
  {
    name: 'Cheese',
    price: 1.2,
    isVegetarian: true,
    isVegan: false,
    isAvailable: true
  },
  {
    name: 'Bacon',
    price: 1.0,
    isVegetarian: true,
    isVegan: false,
    isAvailable: true
  },
  {
    name: 'Meat',
    price: 2.0,
    isVegetarian: false,
    isVegan: false,
    isAvailable: true
  },
  {
    name: 'Onion',
    price: 0.6,
    isVegetarian: true,
    isVegan: true,
    isAvailable: true
  },
  {
    name: 'Beans',
    price: 0.8,
    isVegetarian: false,
    isVegan: true,
    isAvailable: true
  },
  {
    name: 'Rice',
    price: 0.5,
    isVegetarian: true,
    isVegan: true,
    isAvailable: true
  }
]

export const productsSeed = [
  {
    name: 'Veggie Burger',
    description: 'A delicious vegetarian burger',
    price: 5.99,
    imgSrc:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    imgAlt: 'A veggie burger',
    isVegetarian: true,
    isVegan: false,
    isAvailable: true
  },
  {
    name: 'Vegan Salad',
    description: 'A healthy vegan salad',
    price: 4.99,
    imgSrc:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    imgAlt: 'A vegan salad',
    isVegetarian: true,
    isVegan: true,
    isAvailable: true
  },
  {
    name: 'Cheeseburger',
    description: 'A delicious cheeseburger',
    price: 7.99,
    imgSrc:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    imgAlt: 'A cheeseburger',
    isVegetarian: false,
    isVegan: false,
    isAvailable: true
  },
  {
    name: 'Veggie Wrap',
    description: 'A delicious veggie wrap',
    price: 6.99,
    imgSrc:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    imgAlt: 'A veggie wrap',
    isVegetarian: true,
    isVegan: false,
    isAvailable: true
  },
  {
    name: 'Veggie Pizza',
    description: 'A delicious veggie pizza',
    price: 9.99,
    imgSrc:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    imgAlt: 'A veggie pizza',
    isVegetarian: true,
    isVegan: false,
    isAvailable: true
  },
  {
    name: 'Bean Burrito',
    description: 'A delicious bean burrito',
    price: 8.99,
    imgSrc:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    imgAlt: 'A bean burrito',
    isVegetarian: false,
    isVegan: false,
    isAvailable: true
  }
]

export const productIngredientsSeed = [
  { productId: 1, ingredientId: 1 }, // Cheeseburger with Bread
  { productId: 1, ingredientId: 2 }, // Cheeseburger with Meat
  { productId: 1, ingredientId: 3 }, // Cheeseburger with Cheese

  { productId: 2, ingredientId: 2 }, // Vegan Salad with Tomato
  { productId: 2, ingredientId: 4 }, // Vegan Salad with Lettuce

  { productId: 3, ingredientId: 1 }, // Veggie Burger with Bread
  { productId: 3, ingredientId: 4 }, // Veggie Burger with Lettuce

  { productId: 4, ingredientId: 1 }, // Veggie Wrap with Bread
  { productId: 4, ingredientId: 2 }, // Veggie Wrap with Meat
  { productId: 4, ingredientId: 5 }, // Veggie Wrap with Beans
  { productId: 4, ingredientId: 6 }, // Veggie Wrap with Onion

  { productId: 5, ingredientId: 1 }, // Veggie Pizza with Bread
  { productId: 5, ingredientId: 2 }, // Veggie Pizza with Meat
  { productId: 5, ingredientId: 5 }, // Veggie Pizza with Beans
  { productId: 5, ingredientId: 6 }, // Veggie Pizza with Onion

  { productId: 6, ingredientId: 7 }, // Bean Burrito with Beans
  { productId: 6, ingredientId: 8 } // Bean Burrito with Rice
]

export const ordersSeed = [
  {
    totalAmount: 12.99,
    createdAt: new Date()
  },
  {
    totalAmount: 9.99,
    createdAt: new Date()
  },
  {
    totalAmount: 8.99,
    createdAt: new Date()
  }
]
