import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, vi } from "vitest";

afterEach(cleanup);

const defaultFetchMock = async (url: string) => {
  if (url === "/api/scenarios") {
    return {
      ok: true,
      json: async () => ({ scenarios: [], activeScenarioId: null }),
    };
  }
  return { ok: true, status: 200, json: async () => [] };
};

globalThis.fetch = vi.fn(defaultFetchMock) as unknown as typeof globalThis.fetch;

beforeEach(() => {
  (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(defaultFetchMock);
});

Object.defineProperty(window, "innerWidth", {
  writable: true,
  value: 1024,
});

Element.prototype.hasPointerCapture = () => false;
Element.prototype.setPointerCapture = () => {};
Element.prototype.releasePointerCapture = () => {};
Element.prototype.scrollIntoView = () => {};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

beforeAll(() => {
  vi.spyOn(console, "error").mockImplementation((...args) => {
    const message = args[0]?.toString() || "";

    throw new Error(
      `Unexpected console.error during test:\n${message}\n\nFix the underlying issue or explicitly suppress this specific error if unavoidable.`
    );
  });

  vi.spyOn(console, "warn").mockImplementation((...args) => {
    const message = args[0]?.toString() || "";

    throw new Error(
      `Unexpected console.warn during test:\n${message}\n\nFix the underlying issue or explicitly suppress this specific warning if unavoidable.`
    );
  });
});
