import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { useToast, toast } from '@/modules/core/hooks/use-toast';

// Mock timers
beforeEach(() => {
  vi.useFakeTimers();
});

describe('useToast', () => {
  it('returns initial state with empty toasts', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
    expect(result.current.toast).toBeInstanceOf(Function);
    expect(result.current.dismiss).toBeInstanceOf(Function);
  });

  it('adds a toast when toast function is called', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'Test description',
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: 'Test Toast',
      description: 'Test description',
      open: true,
    });
    expect(result.current.toasts[0].id).toBeDefined();
  });

  it('limits toasts to TOAST_LIMIT', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Toast 1' });
      result.current.toast({ title: 'Toast 2' });
      result.current.toast({ title: 'Toast 3' });
    });

    expect(result.current.toasts).toHaveLength(1); // TOAST_LIMIT = 1
    expect(result.current.toasts[0].title).toBe('Toast 3'); // Most recent
  });

  it('dismisses a specific toast', () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;
    act(() => {
      const { id } = result.current.toast({ title: 'Test Toast' });
      toastId = id;
    });

    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('dismisses all toasts when no id provided', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Toast 1' });
      result.current.toast({ title: 'Toast 2' });
    });

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts.every((toast) => !toast.open)).toBe(true);
  });

  it('returns toast control functions', () => {
    const { result } = renderHook(() => useToast());

    let toastControls!: ReturnType<typeof result.current.toast>;
    act(() => {
      toastControls = result.current.toast({
        title: 'Test Toast',
      });
    });

    // TypeScript should infer the type now
    expect(toastControls).toHaveProperty('id');
    expect(toastControls).toHaveProperty('dismiss');
    expect(typeof toastControls.update).toBe('function');
    expect(typeof toastControls.dismiss).toBe('function');
  });

  it('updates toast properties', () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;
    act(() => {
      const { id, update } = result.current.toast({
        title: 'Original Title',
      });
      toastId = id;

      update({
        id,
        title: 'Updated Title',
        description: 'Updated description',
      });
    });

    const updatedToast = result.current.toasts.find((t) => t.id === toastId);
    expect(updatedToast?.title).toBe('Updated Title');
    expect(updatedToast?.description).toBe('Updated description');
  });

  it('handles toast with action', () => {
    const { result } = renderHook(() => useToast());

    const mockAction = (<button key="action">Action</button>) as any;

    act(() => {
      result.current.toast({
        title: 'Action Toast',
        action: mockAction,
      });
    });

    expect(result.current.toasts[0].action).toBe(mockAction);
  });

  it('generates unique IDs for toasts', () => {
    const { result } = renderHook(() => useToast());

    const ids: string[] = [];
    act(() => {
      ids.push(result.current.toast({ title: 'Toast 1' }).id);
      ids.push(result.current.toast({ title: 'Toast 2' }).id);
      ids.push(result.current.toast({ title: 'Toast 3' }).id);
    });

    expect(new Set(ids).size).toBe(ids.length); // All IDs are unique
  });
});

describe('toast function', () => {
  it('creates toast independently of hook', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({
        title: 'Direct Toast',
        description: 'Created directly',
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Direct Toast');
  });

  it('returns control functions from direct toast call', () => {
    const toastControls = toast({
      title: 'Direct Toast',
    });

    expect(toastControls).toHaveProperty('id');
    expect(toastControls).toHaveProperty('dismiss');
    expect(toastControls).toHaveProperty('update');
  });
});
