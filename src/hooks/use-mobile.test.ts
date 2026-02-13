import { act,renderHook } from '@testing-library/react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  let listeners: Map<string, EventListener[]>;

  beforeEach(() => {
    listeners = new Map();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn((event: string, listener: EventListener) => {
          if (!listeners.has(query)) {
            listeners.set(query, []);
          }
          listeners.get(query)?.push(listener);
        }),
        removeEventListener: vi.fn((event: string, listener: EventListener) => {
          const queryListeners = listeners.get(query);
          if (queryListeners) {
            const index = queryListeners.indexOf(listener);
            if (index > -1) {
              queryListeners.splice(index, 1);
            }
          }
        }),
        dispatchEvent: vi.fn((event: Event) => {
          const queryListeners = listeners.get(query);
          queryListeners?.forEach((listener) => listener(event));
          return true;
        }),
      })),
    });
  });

  it('returns false when window width is >= 768px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('returns true when window width is < 768px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('updates when window is resized across mobile breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      const mql = window.matchMedia('(max-width: 767px)');
      mql.dispatchEvent(new Event('change'));
    });

    expect(result.current).toBe(true);
  });

  it('updates when window is resized from mobile to desktop', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      const mql = window.matchMedia('(max-width: 767px)');
      mql.dispatchEvent(new Event('change'));
    });

    expect(result.current).toBe(false);
  });

  it('cleans up event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());

    const query = '(max-width: 767px)';
    expect(listeners.get(query)?.length).toBe(1);

    unmount();

    expect(listeners.get(query)?.length).toBe(0);
  });
});
