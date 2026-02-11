import { describe, expect, it } from "vitest";
import { addDays, addMonths, formatDate } from "./dateUtils";

function d(s: string): Date {
  return new Date(s + "T00:00:00");
}

describe("addDays", () => {
  it("adds positive days", () => {
    expect(formatDate(addDays(d("2024-06-10"), 5))).toBe("2024-06-15");
  });

  it("subtracts with negative days", () => {
    expect(formatDate(addDays(d("2024-06-10"), -3))).toBe("2024-06-07");
  });

  it("crosses month boundary", () => {
    expect(formatDate(addDays(d("2024-01-30"), 3))).toBe("2024-02-02");
  });

  it("returns a new Date instance", () => {
    const original = d("2024-06-10");
    const result = addDays(original, 1);
    expect(result).not.toBe(original);
  });
});

describe("addMonths", () => {
  it("adds positive months", () => {
    expect(formatDate(addMonths(d("2024-01-15"), 3))).toBe("2024-04-15");
  });

  it("subtracts with negative months", () => {
    expect(formatDate(addMonths(d("2024-06-15"), -2))).toBe("2024-04-15");
  });

  it("clamps when target month has fewer days (Jan 31 + 1m = Feb 29 leap)", () => {
    expect(formatDate(addMonths(d("2024-01-31"), 1))).toBe("2024-02-29");
  });

  it("clamps when target month has fewer days (Jan 31 + 1m = Feb 28 non-leap)", () => {
    expect(formatDate(addMonths(d("2023-01-31"), 1))).toBe("2023-02-28");
  });

  it("handles leap year Feb 29 back 12 months", () => {
    expect(formatDate(addMonths(d("2024-02-29"), -12))).toBe("2023-02-28");
  });
});

describe("formatDate", () => {
  it("formats as YYYY-MM-DD", () => {
    expect(formatDate(new Date("2024-06-15"))).toBe("2024-06-15");
  });

  it("pads single-digit month and day", () => {
    expect(formatDate(d("2024-01-05"))).toBe("2024-01-05");
  });
});
