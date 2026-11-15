import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devuelve el valor inicial de inmediato', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 300));

    expect(result.current).toBe('a');
  });

  it('solo actualiza cuando el valor deja de cambiar durante el retardo', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'l' },
    });

    rerender({ value: 'le' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'lea' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('l');

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('lea');
  });
});
