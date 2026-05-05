import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAuthRequired } from '@/hooks/useAuthRequired';

describe('useAuthRequired', () => {
  it('starts with modal closed', () => {
    const { result } = renderHook(() => useAuthRequired());

    expect(result.current.showAuthModal).toBe(false);
  });

  it('opens modal when openAuthModal is called', () => {
    const { result } = renderHook(() => useAuthRequired());

    act(() => {
      result.current.openAuthModal();
    });

    expect(result.current.showAuthModal).toBe(true);
  });

  it('closes modal when closeAuthModal is called', () => {
    const { result } = renderHook(() => useAuthRequired());

    act(() => {
      result.current.openAuthModal();
    });

    expect(result.current.showAuthModal).toBe(true);

    act(() => {
      result.current.closeAuthModal();
    });

    expect(result.current.showAuthModal).toBe(false);
  });

  it('is stable when open/close are called repeatedly', () => {
    const { result } = renderHook(() => useAuthRequired());

    act(() => {
      result.current.openAuthModal();
      result.current.openAuthModal();
    });

    expect(result.current.showAuthModal).toBe(true);

    act(() => {
      result.current.closeAuthModal();
      result.current.closeAuthModal();
    });

    expect(result.current.showAuthModal).toBe(false);
  });
});
