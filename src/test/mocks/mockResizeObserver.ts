import { vi } from "vitest";

export function mockResizeObserver() {
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
}
