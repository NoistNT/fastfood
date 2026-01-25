import type { CartItem } from '@/modules/orders/types';

import { describe, expect, it } from 'vitest';

import { calculateTotal, toFixed } from '@/modules/orders/utils';

describe('calculateTotal', () => {
  it('calculates total for empty array', () => {
    expect(calculateTotal([])).toBe('0.00');
  });

  it('calculates total for single item', () => {
    const items: CartItem[] = [{ productId: 1, name: 'Test Item', price: '10.50', quantity: 2 }];
    expect(calculateTotal(items)).toBe('21.00');
  });

  it('calculates total for multiple items', () => {
    const items: CartItem[] = [
      { productId: 1, name: 'Burger', price: '10.50', quantity: 2 },
      { productId: 2, name: 'Fries', price: '5.25', quantity: 3 },
      { productId: 3, name: 'Drink', price: '8.99', quantity: 1 },
    ];
    // 10.50 * 2 = 21.00, 5.25 * 3 = 15.75, 8.99 * 1 = 8.99, Total = 45.74
    expect(calculateTotal(items)).toBe('45.74');
  });

  it('handles decimal prices correctly', () => {
    const items: CartItem[] = [
      { productId: 1, name: 'Item1', price: '9.99', quantity: 1 },
      { productId: 2, name: 'Item2', price: '0.01', quantity: 1 },
    ];
    expect(calculateTotal(items)).toBe('10.00');
  });

  it('handles quantity of 0', () => {
    const items: CartItem[] = [
      { productId: 1, name: 'Item1', price: '10.00', quantity: 0 },
      { productId: 2, name: 'Item2', price: '5.00', quantity: 1 },
    ];
    expect(calculateTotal(items)).toBe('5.00');
  });

  it('handles large quantities', () => {
    const items: CartItem[] = [{ productId: 1, name: 'Bulk Item', price: '1.50', quantity: 100 }];
    expect(calculateTotal(items)).toBe('150.00');
  });

  it('converts result to string', () => {
    const items: CartItem[] = [{ productId: 1, name: 'Test Item', price: '10.00', quantity: 1 }];
    const result = calculateTotal(items);
    expect(typeof result).toBe('string');
    expect(result).toBe('10.00');
  });
});

describe('toFixed', () => {
  it('formats number with 2 decimal places', () => {
    expect(toFixed('10')).toBe('10.00');
    expect(toFixed('10.5')).toBe('10.50');
    expect(toFixed('10.123')).toBe('10.12');
    expect(toFixed('10.125')).toBe('10.13');
  });

  it('handles integer strings', () => {
    expect(toFixed('5')).toBe('5.00');
    expect(toFixed('0')).toBe('0.00');
  });

  it('handles decimal strings', () => {
    expect(toFixed('3.14159')).toBe('3.14');
    expect(toFixed('2.999')).toBe('3.00');
  });

  it('handles negative numbers', () => {
    expect(toFixed('-5.5')).toBe('-5.50');
    expect(toFixed('-0')).toBe('0.00');
  });

  it('handles very small decimals', () => {
    expect(toFixed('0.001')).toBe('0.00');
    expect(toFixed('0.009')).toBe('0.01');
  });

  it('handles large numbers', () => {
    expect(toFixed('1234.567')).toBe('1234.57');
    expect(toFixed('999999.999')).toBe('1000000.00');
  });
});
