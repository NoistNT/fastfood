import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: vi.fn(),
  }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/modules/core/hooks/use-csrf-token', () => ({
  useCSRFToken: () => ({ getToken: vi.fn(async () => 'token') }),
}));

vi.mock('@/modules/core/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/lib/toast-notifications', () => ({
  toastNotifications: {
    error: { genericError: vi.fn() },
  },
}));

import { toastNotifications } from '@/lib/toast-notifications';
import OrderIntakeForm from '@/modules/dashboard/components/order-intake-form';

const people = [{ id: 'p1', name: 'Ana', phoneNumber: '5491123456789', hasCredentials: false }];

function jsonResponse(payload: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(payload),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith('/api/products')) {
      return jsonResponse({
        data: [
          { id: 1, name: 'Burger', price: '10.00', available: true },
          { id: 2, name: 'Fries', price: '5.50', available: true },
        ],
      });
    }
    if (url.includes('/api/customers/search')) {
      return jsonResponse({ data: { people } });
    }
    if (url === '/api/dashboard/orders') {
      return jsonResponse({ data: { id: 'o1' } });
    }
    return jsonResponse({ data: {} }, false);
  }) as unknown as typeof fetch;
});

async function renderReadyForm() {
  render(<OrderIntakeForm />);
  await screen.findByPlaceholderText('searchPlaceholder');
  await waitFor(() => expect(screen.getByRole('button', { name: 'addItem' })).toBeEnabled());
  const user = userEvent.setup();
  return user;
}

describe('OrderIntakeForm', () => {
  it('blocks submission without a customer and without items', async () => {
    const user = await renderReadyForm();

    await user.click(screen.getByRole('button', { name: 'submit' }));

    expect(await screen.findAllByText('customerRequired')).not.toHaveLength(0);
    expect(await screen.findAllByText('itemsRequired')).not.toHaveLength(0);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('requires a delivery address for delivery orders', async () => {
    const user = await renderReadyForm();
    await user.click(screen.getByRole('button', { name: 'customerNew' }));
    await user.type(screen.getByLabelText('name'), 'Ana');
    await user.click(await screen.findByRole('button', { name: 'addItem' }));
    await user.click(screen.getByRole('radio', { name: 'delivery' }));
    await user.click(screen.getByRole('button', { name: 'submit' }));

    expect(await screen.findByText('addressRequired')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('submits the intake payload and redirects on success', async () => {
    const user = await renderReadyForm();
    await user.click(screen.getByRole('button', { name: 'customerNew' }));
    await user.type(screen.getByLabelText('name'), 'Ana');
    await user.type(screen.getByLabelText('phone'), '5491123456789');
    await user.click(await screen.findByRole('button', { name: 'addItem' }));
    await user.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => {
      expect(screen.getByLabelText('name')).toHaveValue('Ana');
      expect(toastNotifications.error.genericError).not.toHaveBeenCalled();
    });

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard/orders'));

    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      ([url]) => String(url) === '/api/dashboard/orders'
    );
    expect(call).toBeTruthy();

    const [, init] = call as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body.person).toEqual({ name: 'Ana', phoneNumber: '5491123456789' });
    expect(body.items).toHaveLength(1);
    expect(body.orderType).toBe('pickup');
    expect(body.paymentMethod).toBe('cash');

    const headers = init.headers as Record<string, string>;
    expect(headers['x-csrf-token']).toBe('token');
  });

  it('searches customers by query with results rendered for selection', async () => {
    const user = userEvent.setup();
    render(<OrderIntakeForm />);

    const searchBox = await screen.findByPlaceholderText('searchPlaceholder');
    await user.type(searchBox, 'ana');

    expect(await screen.findByRole('button', { name: /Ana/ })).toBeInTheDocument();
  });

  it('blocks submission when selection is changed without reselecting a customer', async () => {
    const user = userEvent.setup();
    render(<OrderIntakeForm />);

    const searchBox = await screen.findByPlaceholderText('searchPlaceholder');
    await user.type(searchBox, 'ana');
    await user.click(await screen.findByRole('button', { name: /Ana/ }));

    await user.click(await screen.findByRole('button', { name: 'change' }));

    await user.click(screen.getByRole('button', { name: 'submit' }));

    expect(await screen.findAllByText('customerRequired')).not.toHaveLength(0);
    expect(pushMock).not.toHaveBeenCalled();
  });
});
