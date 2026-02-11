import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

afterEach(cleanup);

// Suppress Recharts dimension warnings in tests (jsdom doesn't calculate layout)
beforeAll(() => {
  const originalError = console.error;
  const originalWarn = console.warn;

  vi.spyOn(console, "error").mockImplementation((...args) => {
    const msg = args[0]?.toString() || "";
    if (msg.includes("width") && msg.includes("height") && msg.includes("chart should be greater than 0")) {
      return;
    }
    originalError.call(console, ...args);
  });

  vi.spyOn(console, "warn").mockImplementation((...args) => {
    const msg = args[0]?.toString() || "";
    if (msg.includes("width") && msg.includes("height") && msg.includes("chart should be greater than 0")) {
      return;
    }
    originalWarn.call(console, ...args);
  });
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
