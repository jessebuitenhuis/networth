import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getBrowserLocale, getDefaultCurrency, getCurrencySymbol } from "./getLocale";

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

    it("returns USD for en-US locale", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "en-US" },
        writable: true,
        configurable: true,
      });

      expect(getDefaultCurrency()).toBe("USD");
    });

    it("returns GBP for en-GB locale", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "en-GB" },
        writable: true,
        configurable: true,
      });

      expect(getDefaultCurrency()).toBe("GBP");
    });

    it("returns EUR for European locales", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "de-DE" },
        writable: true,
        configurable: true,
      });

      expect(getDefaultCurrency()).toBe("EUR");
    });

    it("returns USD when navigator is undefined", () => {
      Object.defineProperty(global, "navigator", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(getDefaultCurrency()).toBe("USD");
    });

    it("returns USD for en-CA locale", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "en-CA" },
        writable: true,
        configurable: true,
      });

      expect(getDefaultCurrency()).toBe("USD");
    });

    it("returns JPY for ja locale", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "ja-JP" },
        writable: true,
        configurable: true,
      });

      expect(getDefaultCurrency()).toBe("JPY");
    });

    it("returns CNY for zh-CN locale", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "zh-CN" },
        writable: true,
        configurable: true,
      });

      expect(getDefaultCurrency()).toBe("CNY");
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
  });
});
