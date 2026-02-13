import { beforeAll, vi } from "vitest";

/**
 * Suppresses React act() warnings from Radix UI components in tests.
 *
 * Radix UI components (Select, Dialog, etc.) have internal async behavior
 * related to portals and animations that triggers act() warnings in jsdom.
 * These warnings are safe to suppress in tests as they don't affect test
 * reliability.
 *
 * Call this at the top of test files that interact with Radix Select or
 * other Radix components that trigger act() warnings.
 */
export function suppressActWarnings() {
  beforeAll(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    vi.spyOn(console, "error").mockImplementation((...args) => {
      const msg = args[0]?.toString() || "";
      if (
        msg.includes("not wrapped in act(...)") ||
        msg.includes("suspended inside an `act` scope")
      ) {
        return;
      }
      originalError.call(console, ...args);
    });

    vi.spyOn(console, "warn").mockImplementation((...args) => {
      const msg = args[0]?.toString() || "";
      if (
        msg.includes("not wrapped in act(...)") ||
        msg.includes("suspended inside an `act` scope")
      ) {
        return;
      }
      originalWarn.call(console, ...args);
    });
  });
}
