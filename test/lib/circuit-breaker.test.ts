import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import {
  CircuitBreaker,
  paymentCircuitBreaker,
  databaseCircuitBreaker,
  externalApiCircuitBreaker,
} from '@/lib/circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker(3, 1000); // 3 failures, 1 second timeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in closed state', () => {
    expect(breaker.getState()).toBe('closed');
  });

  it('executes function successfully when closed', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');

    const result = await breaker.execute(mockFn);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(breaker.getState()).toBe('closed');
  });

  it('throws error when function fails', async () => {
    const error = new Error('Test error');
    const mockFn = vi.fn().mockRejectedValue(error);

    await expect(breaker.execute(mockFn)).rejects.toThrow('Test error');
    expect(breaker.getState()).toBe('closed');
  });

  it('opens circuit after failure threshold is reached', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

    // First two failures - should stay closed
    for (let i = 0; i < 2; i++) {
      await expect(breaker.execute(mockFn)).rejects.toThrow();
      expect(breaker.getState()).toBe('closed');
    }

    // Third failure - should open circuit
    await expect(breaker.execute(mockFn)).rejects.toThrow();
    expect(breaker.getState()).toBe('open');
  });

  it('throws circuit open error when circuit is open', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(mockFn)).rejects.toThrow();
    }

    expect(breaker.getState()).toBe('open');

    // Now it should throw circuit breaker error
    await expect(breaker.execute(vi.fn().mockResolvedValue('success'))).rejects.toThrow(
      'Circuit breaker is open'
    );
  });

  it('transitions to half-open after timeout', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(mockFn)).rejects.toThrow();
    }

    expect(breaker.getState()).toBe('open');

    // Advance time past timeout
    vi.advanceTimersByTime(1001);

    // Next call should transition to half-open
    await expect(breaker.execute(vi.fn().mockResolvedValue('success'))).resolves.toBe('success');
    expect(breaker.getState()).toBe('closed');
  });

  it('closes circuit after successful call in half-open state', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(mockFn)).rejects.toThrow();
    }

    expect(breaker.getState()).toBe('open');

    // Advance time past timeout
    vi.advanceTimersByTime(1001);

    // Successful call should close circuit
    await breaker.execute(vi.fn().mockResolvedValue('success'));
    expect(breaker.getState()).toBe('closed');
  });

  it('re-opens circuit after failure in half-open state', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(mockFn)).rejects.toThrow();
    }

    expect(breaker.getState()).toBe('open');

    // Advance time past timeout
    vi.advanceTimersByTime(1001);

    // Failed call should re-open circuit
    await expect(
      breaker.execute(vi.fn().mockRejectedValue(new Error('Fail again')))
    ).rejects.toThrow();
    expect(breaker.getState()).toBe('open');
  });

  it('resets circuit breaker state', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      await breaker.execute(mockFn).catch(() => {});
    }

    expect(breaker.getState()).toBe('open');

    // Reset should close circuit and clear failures
    breaker.reset();
    expect(breaker.getState()).toBe('closed');
  });

  it('handles custom failure threshold and timeout', async () => {
    const customBreaker = new CircuitBreaker(2, 2000);

    const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

    // Should open after 2 failures
    await customBreaker.execute(mockFn).catch(() => {});
    expect(customBreaker.getState()).toBe('closed');

    await customBreaker.execute(mockFn).catch(() => {});
    expect(customBreaker.getState()).toBe('open');
  });
});

describe('Global Circuit Breakers', () => {
  it('exports predefined circuit breakers with correct configurations', () => {
    expect(paymentCircuitBreaker).toBeInstanceOf(CircuitBreaker);
    expect(databaseCircuitBreaker).toBeInstanceOf(CircuitBreaker);
    expect(externalApiCircuitBreaker).toBeInstanceOf(CircuitBreaker);
  });

  it('payment circuit breaker has 3 failure threshold', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Payment failed'));

    // Should stay closed for first 2 failures
    for (let i = 0; i < 2; i++) {
      await expect(paymentCircuitBreaker.execute(mockFn)).rejects.toThrow();
      expect(paymentCircuitBreaker.getState()).toBe('closed');
    }

    // Third failure should open circuit
    await expect(paymentCircuitBreaker.execute(mockFn)).rejects.toThrow();
    expect(paymentCircuitBreaker.getState()).toBe('open');
  });

  it('database circuit breaker has 5 failure threshold', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('DB failed'));

    // Should stay closed for first 4 failures
    for (let i = 0; i < 4; i++) {
      await expect(databaseCircuitBreaker.execute(mockFn)).rejects.toThrow();
      expect(databaseCircuitBreaker.getState()).toBe('closed');
    }

    // Fifth failure should open circuit
    await expect(databaseCircuitBreaker.execute(mockFn)).rejects.toThrow();
    expect(databaseCircuitBreaker.getState()).toBe('open');
  });
});
