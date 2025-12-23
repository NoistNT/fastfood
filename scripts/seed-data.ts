import { hash } from 'bcrypt';

import { ORDER_STATUS } from '@/modules/orders/types';

const mockPassword = await hash('P4$$W0rD', 10);
const imgSrc =
  'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80';

export const ingredientsSeed = [
  {
    name: 'Lettuce',
    unit: 'pieces',
    price: '0.5',
    isAvailable: true,
  },
  {
    name: 'Tomato',
    unit: 'pieces',
    price: '0.7',
    isAvailable: true,
  },
  {
    name: 'Cheese',
    unit: 'kg',
    price: '1.2',
    isAvailable: true,
  },
  {
    name: 'Bacon',
    unit: 'kg',
    price: '1.0',
    isAvailable: true,
  },
  {
    name: 'Meat',
    unit: 'kg',
    price: '2.0',
    isAvailable: true,
  },
  {
    name: 'Onion',
    unit: 'pieces',
    price: '0.6',
    isAvailable: true,
  },
  {
    name: 'Beans',
    unit: 'kg',
    price: '0.8',
    isAvailable: true,
  },
  {
    name: 'Rice',
    unit: 'kg',
    price: '0.5',
    isAvailable: true,
  },
  {
    name: 'Bread',
    unit: 'loaves',
    price: '1.5',
    isAvailable: true,
  },
  {
    name: 'Chicken',
    unit: 'kg',
    price: '3.0',
    isAvailable: true,
  },
  {
    name: 'Fish',
    unit: 'kg',
    price: '4.0',
    isAvailable: true,
  },
  {
    name: 'Pasta',
    unit: 'kg',
    price: '1.0',
    isAvailable: true,
  },
  {
    name: 'Olive Oil',
    unit: 'liters',
    price: '5.0',
    isAvailable: true,
  },
  {
    name: 'Salt',
    unit: 'kg',
    price: '0.5',
    isAvailable: true,
  },
  {
    name: 'Pepper',
    unit: 'kg',
    price: '1.0',
    isAvailable: true,
  },
];

export const inventorySeed = [
  {
    ingredientId: 1, // Lettuce
    quantity: '50.00',
    minThreshold: '10.00',
  },
  {
    ingredientId: 2, // Tomato
    quantity: '30.00',
    minThreshold: '5.00',
  },
  {
    ingredientId: 3, // Cheese
    quantity: '20.00',
    minThreshold: '5.00',
  },
  {
    ingredientId: 4, // Bacon
    quantity: '15.00',
    minThreshold: '3.00',
  },
  {
    ingredientId: 5, // Meat
    quantity: '25.00',
    minThreshold: '5.00',
  },
  {
    ingredientId: 6, // Onion
    quantity: '40.00',
    minThreshold: '10.00',
  },
  {
    ingredientId: 7, // Beans
    quantity: '60.00',
    minThreshold: '10.00',
  },
  {
    ingredientId: 8, // Rice
    quantity: '50.00',
    minThreshold: '10.00',
  },
  {
    ingredientId: 9, // Bread
    quantity: '60.00',
    minThreshold: '10.00',
  },
  {
    ingredientId: 10, // Chicken
    quantity: '20.00',
    minThreshold: '5.00',
  },
  {
    ingredientId: 11, // Fish
    quantity: '15.00',
    minThreshold: '3.00',
  },
  {
    ingredientId: 12, // Pasta
    quantity: '30.00',
    minThreshold: '5.00',
  },
  {
    ingredientId: 13, // Olive Oil
    quantity: '10.00',
    minThreshold: '2.00',
  },
  {
    ingredientId: 14, // Salt
    quantity: '20.00',
    minThreshold: '5.00',
  },
  {
    ingredientId: 15, // Pepper
    quantity: '20.00',
    minThreshold: '5.00',
  },
];

export const productsSeed = [
  {
    name: 'Classic Burger',
    description: 'Juicy beef burger with lettuce and tomato',
    price: '8.99',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Cheese Burger',
    description: 'Beef burger with cheese, lettuce and tomato',
    price: '9.99',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Bacon Burger',
    description: 'Beef burger with bacon, cheese, lettuce and tomato',
    price: '10.99',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Chicken Sandwich',
    description: 'Grilled chicken sandwich with lettuce and tomato',
    price: '7.99',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Fish Sandwich',
    description: 'Fried fish sandwich with lettuce and tomato',
    price: '9.49',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Caesar Salad',
    description: 'Fresh salad with chicken, lettuce, tomato and caesar dressing',
    price: '6.99',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Pasta Carbonara',
    description: 'Creamy pasta with bacon and parmesan',
    price: '11.49',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Rice Bowl',
    description: 'Steamed rice with vegetables and choice of protein',
    price: '7.49',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Pizza Margherita',
    description: 'Classic pizza with tomato sauce, mozzarella and basil',
    price: '12.99',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Pizza Pepperoni',
    description: 'Pizza with tomato sauce, mozzarella and pepperoni',
    price: '13.99',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Pizza Veggie',
    description: 'Pizza with tomato sauce, mozzarella and vegetables',
    price: '11.99',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Fries',
    description: 'Crispy french fries',
    price: '3.99',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Onion Rings',
    description: 'Crispy onion rings',
    price: '4.49',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Rice Bowl',
    description: 'Steamed rice with vegetables and choice of protein',
    price: '7.49',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Pizza Margherita',
    description: 'Classic pizza with tomato sauce, mozzarella and basil',
    price: '12.99',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Pizza Pepperoni',
    description: 'Pizza with tomato sauce, mozzarella and pepperoni',
    price: '13.99',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Pizza Veggie',
    description: 'Pizza with tomato sauce, mozzarella and vegetables',
    price: '11.99',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Fries',
    description: 'Crispy french fries',
    price: '3.99',
    imageUrl: imgSrc,
    available: true,
  },
  {
    name: 'Onion Rings',
    description: 'Crispy onion rings',
    price: '4.49',
    imageUrl: imgSrc,
    available: true,
  },
];

export const productIngredientsSeed = [
  // Classic Burger
  { productId: 1, ingredientId: 5 }, // Meat
  { productId: 1, ingredientId: 1 }, // Lettuce
  { productId: 1, ingredientId: 2 }, // Tomato

  // Spicy Tofu Salad
  { productId: 2, ingredientId: 1 }, // Lettuce
  { productId: 2, ingredientId: 2 }, // Tomato
  { productId: 2, ingredientId: 9 }, // Tofu

  // Chicken Caesar Wrap
  { productId: 3, ingredientId: 5 }, // Meat (Chicken)
  { productId: 3, ingredientId: 1 }, // Lettuce
  { productId: 3, ingredientId: 2 }, // Tomato

  // Falafel Pita
  { productId: 4, ingredientId: 6 }, // Onion
  { productId: 4, ingredientId: 1 }, // Lettuce
  { productId: 4, ingredientId: 10 }, // Falafel

  // BBQ Chicken Pizza
  { productId: 5, ingredientId: 5 }, // Meat (Chicken)
  { productId: 5, ingredientId: 6 }, // Onion
  { productId: 5, ingredientId: 3 }, // Cheese

  // Grilled Veggie Panini
  { productId: 6, ingredientId: 1 }, // Lettuce
  { productId: 6, ingredientId: 6 }, // Onion
  { productId: 6, ingredientId: 3 }, // Cheese

  // Veggie Burger
  { productId: 7, ingredientId: 1 }, // Lettuce
  { productId: 7, ingredientId: 2 }, // Tomato
  { productId: 7, ingredientId: 3 }, // Cheese

  // Vegan Salad
  { productId: 8, ingredientId: 1 }, // Lettuce
  { productId: 8, ingredientId: 2 }, // Tomato

  // Cheeseburger
  { productId: 9, ingredientId: 5 }, // Meat
  { productId: 9, ingredientId: 3 }, // Cheese
  { productId: 9, ingredientId: 2 }, // Tomato
  { productId: 9, ingredientId: 6 }, // Onion

  // Veggie Wrap
  { productId: 10, ingredientId: 1 }, // Lettuce
  { productId: 10, ingredientId: 6 }, // Onion
  { productId: 10, ingredientId: 7 }, // Beans

  // Veggie Pizza
  { productId: 11, ingredientId: 1 }, // Lettuce
  { productId: 11, ingredientId: 6 }, // Onion
  { productId: 11, ingredientId: 3 }, // Cheese

  // Bean Burrito
  { productId: 12, ingredientId: 7 }, // Beans
  { productId: 12, ingredientId: 8 }, // Rice
];

export const usersSeed = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    passwordHash: mockPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    passwordHash: mockPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    passwordHash: mockPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Bob Brown',
    email: 'bob.brown@example.com',
    passwordHash: mockPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const rolesSeed = [
  {
    name: 'admin',
    description: 'Administrator',
  },
  {
    name: 'customer',
    description: 'Customer',
  },
];

export const userRolesSeed = [
  {
    userEmail: 'john.doe@example.com',
    roleName: 'admin',
  },
  {
    userEmail: 'jane.smith@example.com',
    roleName: 'customer',
  },
  {
    userEmail: 'alice.johnson@example.com',
    roleName: 'customer',
  },
  {
    userEmail: 'bob.brown@example.com',
    roleName: 'customer',
  },
];
export const ordersSeed = [
  {
    userEmail: 'jane.smith@example.com',
    total: '29.99',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: ORDER_STATUS.PENDING,
  },
  {
    userEmail: 'alice.johnson@example.com',
    total: '15.49',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: ORDER_STATUS.PENDING,
  },
  {
    userEmail: 'bob.brown@example.com',
    total: '21.99',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: ORDER_STATUS.PENDING,
  },
  {
    userEmail: 'jane.smith@example.com',
    total: '17.99',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: ORDER_STATUS.PENDING,
  },
];

export const orderItemsSeed = [
  {
    orderIndex: 0,
    productId: 1,
    quantity: 2,
  },
  {
    orderIndex: 0,
    productId: 2,
    quantity: 1,
  },
  {
    orderIndex: 1,
    productId: 3,
    quantity: 1,
  },
  {
    orderIndex: 2,
    productId: 4,
    quantity: 1,
  },
  {
    orderIndex: 3,
    productId: 5,
    quantity: 1,
  },
];
