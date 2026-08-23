import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/csrf', () => ({
  getCSRFTokenFromRequest: vi.fn(),
  verifyCSRFToken: vi.fn(),
}));

vi.mock('@/lib/inventory-management', () => ({
  validateOrderInventory: vi.fn(),
  deductInventoryForOrder: vi.fn(),
}));

vi.mock('@/modules/orders/actions/intake', () => ({
  createIntakeOrder: vi.fn(),
}));

import { getSession } from '@/lib/auth/session';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { deductInventoryForOrder, validateOrderInventory } from '@/lib/inventory-management';
import { createIntakeOrder } from '@/modules/orders/actions/intake';
import { POST } from '@/app/api/dashboard/orders/route';

import type { UserWithRoles } from '@/types/auth';

const getSessionMock = vi.mocked(getSession);
const getCSRFMock = vi.mocked(getCSRFTokenFromRequest);
const verifyCSRFPass = vi.mocked(verifyCSRFToken);
const createIntakeOrderMock = vi.mocked(createIntakeOrder);
const validateInventoryMock = vi.mocked(validateOrderInventory);
const deductInventoryMock = vi.mocked(deductInventoryForOrder);

function sessionWith(...roleNames: string[]): UserWithRoles {
  return {
    id: 'u1',
    name: 'Sam',
    email: null,
    passwordHash: null,
    phoneNumber: null,
    lastLoginAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: roleNames.map((name) => ({ id: 1, name, description: null })),
  };
}

const createdResult = {
  id: 'o1',
  userId: 'p1',
  total: '25.00',
  status: 'PENDING' as const,
  orderType: 'pickup' as const,
  paymentMethod: 'cash' as const,
  trackingCode: 'FF-ABC23456',
};

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    person: { name: 'Ana', phoneNumber: '+54 9 11 2345-6789' },
    items: [{ productId: 1, quantity: 2 }],
    ...overrides,
  };
}

function requestWith(body: unknown) {
  return new NextRequest('http://localhost:3000/api/dashboard/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/dashboard/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCSRFMock.mockResolvedValue('token');
    verifyCSRFPass.mockResolvedValue(true);
    validateInventoryMock.mockResolvedValue(true);
    deductInventoryMock.mockResolvedValue(undefined);
  });

  it('requires authentication', async () => {
    getSessionMock.mockResolvedValue(null);
    const response = await POST(requestWith(validBody()));

    expect(response.status).toBe(401);
    expect(createIntakeOrderMock).not.toHaveBeenCalled();
  });

  it('rejects civilians without operational roles', async () => {
    getSessionMock.mockResolvedValue(sessionWith('customer'));
    const response = await POST(requestWith(validBody()));

    expect(response.status).toBe(403);
    expect((await response.json()).error.code).toBe('FORBIDDEN');
  });

  it('rejects requests without a valid CSRF token', async () => {
    getSessionMock.mockResolvedValue(sessionWith('staff'));
    verifyCSRFPass.mockResolvedValue(false);
    const response = await POST(requestWith(validBody()));

    expect(response.status).toBe(403);
    expect((await response.json()).error.code).toBe('CSRF_INVALID');
  });

  it('rejects empty item lists', async () => {
    getSessionMock.mockResolvedValue(sessionWith('staff'));
    const response = await POST(requestWith(validBody({ items: [] })));

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('VALIDATION_ERROR');
  });

  it('requires an address for delivery orders', async () => {
    getSessionMock.mockResolvedValue(sessionWith('staff'));
    const response = await POST(
      requestWith(validBody({ orderType: 'delivery', deliveryAddress: null }))
    );

    expect(response.status).toBe(400);
    expect(createIntakeOrderMock).not.toHaveBeenCalled();
  });

  it('creates the order and applies inventory best-effort', async () => {
    getSessionMock.mockResolvedValue(sessionWith('staff'));
    createIntakeOrderMock.mockResolvedValue(createdResult);

    const response = await POST(
      requestWith(
        validBody({ orderType: 'delivery', deliveryAddress: 'Calle 1', deliveryNotes: ' ' })
      )
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.trackingCode).toBe(createdResult.trackingCode);
    expect(createIntakeOrderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        person: { name: 'Ana', phoneNumber: '+54 9 11 2345-6789' },
        orderType: 'delivery',
        paymentMethod: 'cash',
        deliveryAddress: 'Calle 1',
      })
    );
    expect(validateInventoryMock).toHaveBeenCalledWith(createdResult.id);
    expect(deductInventoryMock).toHaveBeenCalledWith(createdResult.id);
  });

  it('still answers 201 when inventory bookkeeping explodes', async () => {
    getSessionMock.mockResolvedValue(sessionWith('admin'));
    createIntakeOrderMock.mockResolvedValue(createdResult);
    validateInventoryMock.mockRejectedValue(new Error('inventory down'));

    const response = await POST(requestWith(validBody()));

    expect(response.status).toBe(201);
  });

  it('never deducts stock when validation reports a shortage', async () => {
    getSessionMock.mockResolvedValue(sessionWith('staff'));
    createIntakeOrderMock.mockResolvedValue(createdResult);
    validateInventoryMock.mockResolvedValue(false);

    const response = await POST(requestWith(validBody()));

    expect(response.status).toBe(201);
    expect(deductInventoryMock).not.toHaveBeenCalled();
  });

  it('maps intake failures to an internal error envelope', async () => {
    getSessionMock.mockResolvedValue(sessionWith('admin'));
    createIntakeOrderMock.mockRejectedValue(new Error('Invalid product IDs: 9'));

    const response = await POST(requestWith(validBody()));

    expect(response.status).toBe(500);
    expect((await response.json()).error.code).toBe('INTERNAL_ERROR');
  });
});
