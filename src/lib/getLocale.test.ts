import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getBrowserLocale, getCurrencySymbol,getDefaultCurrency } from "./getLocale";

describe("getLocale", () => {
  describe("getBrowserLocale", () => {
    it("returns navigator.language when available", () => {
      const mockNavigator = { language: "en-US" };
      vi.stubGlobal("navigator", mockNavigator);

      expect(getBrowserLocale()).toBe("en-US");

      vi.unstubAllGlobals();
    });

    it("returns undefined when navigator is not available", () => {
      vi.stubGlobal("navigator", undefined);

      expect(getBrowserLocale()).toBeUndefined();

      vi.unstubAllGlobals();
    });
  });

  describe("getDefaultCurrency", () => {
    let originalNavigator: typeof navigator;

    beforeEach(() => {
      originalNavigator = global.navigator;
    });

    afterEach(() => {
      Object.defineProperty(global, "navigator", {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    });

    it.each([
      ["en-US", "USD"],
      ["en-GB", "GBP"],
      ["de-DE", "EUR"],
      ["en-CA", "USD"],
      ["ja-JP", "JPY"],
      ["zh-CN", "CNY"],
    ])("returns %s for %s locale", (locale, expected) => {
      Object.defineProperty(global, "navigator", {
        value: { language: locale },
        writable: true,
        configurable: true,
      });
      expect(getDefaultCurrency()).toBe(expected);
    });

    it("returns USD when navigator is undefined", () => {
      Object.defineProperty(global, "navigator", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      expect(getDefaultCurrency()).toBe("USD");
    });
  });

  describe("getCurrencySymbol", () => {
    let originalNavigator: typeof navigator;

    beforeEach(() => {
      originalNavigator = global.navigator;
    });

    afterEach(() => {
      Object.defineProperty(global, "navigator", {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    });

    it("returns a currency symbol string", () => {
      const symbol = getCurrencySymbol();
      expect(typeof symbol).toBe("string");
      expect(symbol.length).toBeGreaterThan(0);
    });

    it("returns € for European locale", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "de-DE" },
        writable: true,
        configurable: true,
      });

      const symbol = getCurrencySymbol();
      expect(symbol).toMatch(/€|EUR/);
    });

    it("returns fallback when symbol not found", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "en-US" },
        writable: true,
        configurable: true,
      });

      const symbol = getCurrencySymbol();
      expect(symbol).toBeTruthy();
    });

    it("returns currency code when formatToParts has no currency type", () => {
      const originalFormatToParts = Intl.NumberFormat.prototype.formatToParts;
      Intl.NumberFormat.prototype.formatToParts = vi.fn(() => [
        { type: "integer", value: "0" },
      ]);

      Object.defineProperty(global, "navigator", {
        value: { language: "en-US" },
        writable: true,
        configurable: true,
      });

      const symbol = getCurrencySymbol();
      expect(symbol).toBe("USD");

      Intl.NumberFormat.prototype.formatToParts = originalFormatToParts;
    });
  });
});
