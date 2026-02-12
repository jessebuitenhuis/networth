import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getDecimalSeparator,
  getGroupingSeparator,
  formatLocaleNumber,
  parseLocaleNumber,
} from "./localeNumber";

describe("localeNumber", () => {
  describe("getDecimalSeparator", () => {
    it("returns the locale decimal separator", () => {
      const separator = getDecimalSeparator();
      expect(separator).toMatch(/^[.,]$/);
    });
  });

  describe("getGroupingSeparator", () => {
    it("returns the locale grouping separator", () => {
      const separator = getGroupingSeparator();
      expect([",", ".", " ", ""]).toContain(separator);
    });
  });

  describe("formatLocaleNumber", () => {
    it("formats zero", () => {
      expect(formatLocaleNumber(0)).toBe("0");
    });

    it("formats positive integers", () => {
      const formatted = formatLocaleNumber(1000);
      expect(formatted).toMatch(/^1[,.\s]?000$/);
    });

    it("formats large numbers with grouping", () => {
      const formatted = formatLocaleNumber(1234567);
      expect(parseLocaleNumber(formatted)).toBe(1234567);
    });

    it("formats decimals", () => {
      const formatted = formatLocaleNumber(123.45);
      expect(parseLocaleNumber(formatted)).toBeCloseTo(123.45, 2);
    });

    it("formats with minimum fraction digits", () => {
      const formatted = formatLocaleNumber(100, 2);
      const decimalSep = getDecimalSeparator();
      expect(formatted).toBe(`100${decimalSep}00`);
    });

    it("preserves existing decimals when minimum fraction digits is set", () => {
      const formatted = formatLocaleNumber(100.5, 2);
      const decimalSep = getDecimalSeparator();
      expect(formatted).toBe(`100${decimalSep}50`);
    });
  });

  describe("parseLocaleNumber", () => {
    it("parses zero", () => {
      expect(parseLocaleNumber("0")).toBe(0);
    });

    it("parses empty string as zero", () => {
      expect(parseLocaleNumber("")).toBe(0);
    });

    it("parses simple integers", () => {
      expect(parseLocaleNumber("123")).toBe(123);
    });

    it("parses formatted integers", () => {
      const groupingSep = getGroupingSeparator();
      expect(parseLocaleNumber(`1${groupingSep}000`)).toBe(1000);
    });

    it("parses decimals with locale separator", () => {
      const decimalSep = getDecimalSeparator();
      expect(parseLocaleNumber(`123${decimalSep}45`)).toBeCloseTo(123.45, 2);
    });

    it("parses large formatted numbers", () => {
      const formatted = formatLocaleNumber(1234567.89);
      expect(parseLocaleNumber(formatted)).toBeCloseTo(1234567.89, 2);
    });

    it("handles invalid input", () => {
      expect(parseLocaleNumber("abc")).toBe(0);
    });

    it("strips multiple grouping separators", () => {
      const groupingSep = getGroupingSeparator();
      expect(
        parseLocaleNumber(`1${groupingSep}234${groupingSep}567`)
      ).toBe(1234567);
    });
  });

  describe("round-trip formatting", () => {
    it("preserves values through format and parse", () => {
      const values = [0, 1, 100, 1000, 12345.67, 999999.99];

      values.forEach((value) => {
        const formatted = formatLocaleNumber(value);
        const parsed = parseLocaleNumber(formatted);
        expect(parsed).toBeCloseTo(value, 2);
      });
    });
  });

  describe("edge cases", () => {
    it("handles values with non-standard formatting", () => {
      expect(parseLocaleNumber("1234")).toBe(1234);
      expect(parseLocaleNumber("1234.56")).toBeCloseTo(1234.56, 2);
    });

    it("handles whitespace", () => {
      expect(parseLocaleNumber("  ")).toBe(0);
      expect(parseLocaleNumber(" 123 ")).toBe(123);
    });
  });

  describe("non-English locale support", () => {
    let originalFormatToParts: typeof Intl.NumberFormat.prototype.formatToParts;

    beforeEach(() => {
      originalFormatToParts = Intl.NumberFormat.prototype.formatToParts;
    });

    afterEach(() => {
      Intl.NumberFormat.prototype.formatToParts = originalFormatToParts;
    });

    it("handles comma as decimal separator (European locale)", () => {
      // Mock formatToParts to return comma as decimal separator
      Intl.NumberFormat.prototype.formatToParts = vi.fn(function(this: Intl.NumberFormat, num?: number): Intl.NumberFormatPart[] {
        if (num === 1.1) {
          return [
            { type: "integer", value: "1" },
            { type: "decimal", value: "," },
            { type: "fraction", value: "1" }
          ];
        }
        if (num === 1000) {
          return [
            { type: "integer", value: "1" },
            { type: "group", value: "." },
            { type: "integer", value: "000" }
          ];
        }
        return originalFormatToParts.call(this, num);
      });

      // Test that getDecimalSeparator returns comma
      expect(getDecimalSeparator()).toBe(",");

      // Test that getGroupingSeparator returns period
      expect(getGroupingSeparator()).toBe(".");

      // Test parsing with comma decimal separator
      expect(parseLocaleNumber("123,45")).toBeCloseTo(123.45, 2);
      expect(parseLocaleNumber("1.234,56")).toBeCloseTo(1234.56, 2);
    });

    it("handles no grouping separator", () => {
      Intl.NumberFormat.prototype.formatToParts = vi.fn(function(this: Intl.NumberFormat, num?: number): Intl.NumberFormatPart[] {
        if (num === 1000) {
          return [
            { type: "integer", value: "1000" }
          ];
        }
        return originalFormatToParts.call(this, num);
      });

      expect(getGroupingSeparator()).toBe("");
    });
  });
});
