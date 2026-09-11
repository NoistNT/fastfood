import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/modules/core/hooks/use-csrf-token', () => ({
  useCSRFToken: () => ({ getToken: vi.fn(async () => 'token') }),
}));

vi.mock('@/lib/toast-notifications', () => ({
  toastNotifications: {
    success: { customerCreated: vi.fn(), customerUpdated: vi.fn() },
    error: { genericError: vi.fn() },
  },
}));

import { CustomerFormDialog } from '@/modules/dashboard/components/customer-form-dialog';

function jsonResponse(payload: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(payload),
  });
}

describe('CustomerFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ignores dismissals while a submission is pending', async () => {
    const user = userEvent.setup();
    let resolveSubmit!: (value: unknown) => void;
    global.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        })
    ) as never;
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();

    render(
      <CustomerFormDialog
        open
        onOpenChange={onOpenChange}
        person={null}
        onSuccess={onSuccess}
      />
    );

    await user.type(await screen.findByLabelText('fullName'), 'Ana');
    await user.click(screen.getByRole('button', { name: 'save' }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // Escape while saving must not close the session.
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onOpenChange).not.toHaveBeenCalled();

    // Once the request settles, the dialog closes normally.
    resolveSubmit(jsonResponse({ success: true, data: { person: { id: 'p1' } } }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onSuccess).toHaveBeenCalled();
  });
});
