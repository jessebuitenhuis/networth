import { beforeAll, vi } from "vitest";

export function suppressRechartsWarnings() {
  beforeAll(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    vi.spyOn(console, "error").mockImplementation((...args) => {
      const msg = args[0]?.toString() || "";
      if (msg.includes("width") && msg.includes("height") && msg.includes("chart should be greater than 0")) {
        return;
      }
      if (msg.includes("not wrapped in act(...)")) {
        return;
      }
      if (msg.includes("component suspended inside an `act` scope")) {
        return;
      }
      originalError.call(console, ...args);
    });

    vi.spyOn(console, "warn").mockImplementation((...args) => {
      const msg = args[0]?.toString() || "";
      if (msg.includes("width") && msg.includes("height") && msg.includes("chart should be greater than 0")) {
        return;
      }
      if (msg.includes("not wrapped in act(...)")) {
        return;
      }
      if (msg.includes("component suspended inside an `act` scope")) {
        return;
      }
      originalWarn.call(console, ...args);
    });
  });
}
