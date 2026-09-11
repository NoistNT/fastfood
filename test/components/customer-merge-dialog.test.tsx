import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    if (key === 'description' && params?.name) return `Merge ${params.name}`;
    return key;
  },
}));

vi.mock('@/modules/core/hooks/use-csrf-token', () => ({
  useCSRFToken: () => ({ getToken: vi.fn(async () => 'token') }),
}));

vi.mock('@/lib/toast-notifications', () => ({
  toastNotifications: {
    success: { customerMerged: vi.fn() },
    error: { genericError: vi.fn() },
  },
}));

import { CustomerMergeDialog } from '@/modules/dashboard/components/customer-merge-dialog';

const loser = { id: 'loser-1', name: 'Ana Dupe', email: null, phoneNumber: null };

function jsonResponse(payload: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(payload),
  });
}

describe('CustomerMergeDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears a stale preview and blocks confirm while reloading', async () => {
    const user = userEvent.setup();
    let resolvePreview!: (value: unknown) => void;
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith('/api/customers/search')) {
        return jsonResponse({
          data: {
            people: [{ id: 'winner-1', name: 'Ana Real', email: null, phoneNumber: null }],
          },
        });
      }
      return new Promise((resolve) => {
        resolvePreview = resolve;
      });
    }) as never;
    const onOpenChange = vi.fn();

    render(
      <CustomerMergeDialog
        open
        onOpenChange={onOpenChange}
        loser={loser}
        onSuccess={vi.fn()}
      />
    );

    await user.type(await screen.findByPlaceholderText('searchPlaceholder'), 'Ana');
    await user.click(await screen.findByRole('button', { name: 'select' }));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/customers/merge?'))
    );

    // While the new preview is pending, confirm stays disabled.
    expect(screen.getByRole('button', { name: 'confirm' })).toBeDisabled();

    resolvePreview(
      jsonResponse({
        data: {
          winner: { id: 'winner-1', name: 'Ana Real' },
          loser: { id: 'loser-1', name: 'Ana Dupe' },
          ordersMoving: 2,
          rolesGranting: [],
          tokensInvalidated: 0,
          fieldsFilling: [],
        },
      })
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'confirm' })).toBeEnabled());
  });

  it('routes cancel through the busy guard', async () => {
    const user = userEvent.setup();
    let resolveMerge!: (value: unknown) => void;
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith('/api/customers/search')) {
        return jsonResponse({
          data: {
            people: [{ id: 'winner-1', name: 'Ana Real', email: null, phoneNumber: null }],
          },
        });
      }
      if (url.startsWith('/api/customers/merge?')) {
        return jsonResponse({
          data: {
            winner: { id: 'winner-1', name: 'Ana Real' },
            loser: { id: 'loser-1', name: 'Ana Dupe' },
            ordersMoving: 0,
            rolesGranting: [],
            tokensInvalidated: 0,
            fieldsFilling: [],
          },
        });
      }
      return new Promise((resolve) => {
        resolveMerge = resolve;
      });
    }) as never;
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();

    render(
      <CustomerMergeDialog
        open
        onOpenChange={onOpenChange}
        loser={loser}
        onSuccess={onSuccess}
      />
    );

    await user.type(await screen.findByPlaceholderText('searchPlaceholder'), 'Ana');
    await user.click(await screen.findByRole('button', { name: 'select' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'confirm' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'confirm' }));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/customers/merge',
        expect.objectContaining({ method: 'POST' })
      )
    );

    // Cancel during the pending merge must not close the session.
    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));
    expect(onOpenChange).not.toHaveBeenCalled();

    resolveMerge(jsonResponse({ success: true, data: { merged: {} } }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onSuccess).toHaveBeenCalled();
  });
});
