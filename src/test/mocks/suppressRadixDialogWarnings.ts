import { beforeAll, vi } from "vitest";

/**
 * Suppresses Radix UI Dialog accessibility warnings in tests.
 *
 * Radix Dialog checks for DialogTitle presence during render, but in jsdom
 * this check can happen before React has fully mounted the title, causing
 * false positives. Since we properly include DialogTitle in our components,
 * these warnings are safe to suppress in tests.
 *
 * Call this at the top of test files that render Radix Dialog components.
 */
export function suppressRadixDialogWarnings() {
  beforeAll(() => {
    const originalError = console.error;

    vi.spyOn(console, "error").mockImplementation((...args) => {
      const msg = args[0]?.toString() || "";
      if (msg.includes("DialogContent` requires a `DialogTitle`")) {
        return;
      }
      originalError.call(console, ...args);
    });
  });
}
