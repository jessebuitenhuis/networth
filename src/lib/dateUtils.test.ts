import { describe, expect, it } from "vitest";
import { addDays, addMonths, addYears, endOfMonth, formatDate, toSunday } from "./dateUtils";

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

describe("addYears", () => {
  it("adds positive years", () => {
    expect(formatDate(addYears(d("2024-06-15"), 1))).toBe("2025-06-15");
  });

  it("subtracts with negative years", () => {
    expect(formatDate(addYears(d("2024-06-15"), -2))).toBe("2022-06-15");
  });

  it("clamps leap day to Feb 28 in non-leap year", () => {
    expect(formatDate(addYears(d("2024-02-29"), 1))).toBe("2025-02-28");
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

describe("toSunday", () => {
  it("returns same date if already Sunday", () => {
    // 2024-03-17 is Sunday
    expect(formatDate(toSunday(d("2024-03-17")))).toBe("2024-03-17");
  });

  it("returns previous Sunday for Monday", () => {
    // 2024-03-18 is Monday → previous Sunday is 2024-03-17
    expect(formatDate(toSunday(d("2024-03-18")))).toBe("2024-03-17");
  });

  it("returns previous Sunday for Saturday", () => {
    // 2024-06-15 is Saturday → previous Sunday is 2024-06-09
    expect(formatDate(toSunday(d("2024-06-15")))).toBe("2024-06-09");
  });

  it("crosses month boundary", () => {
    // 2024-07-01 is Monday → previous Sunday is 2024-06-30
    expect(formatDate(toSunday(d("2024-07-01")))).toBe("2024-06-30");
  });
});

describe("endOfMonth", () => {
  it("returns last day of a 31-day month", () => {
    expect(formatDate(endOfMonth(d("2024-07-15")))).toBe("2024-07-31");
  });

  it("returns last day of a 30-day month", () => {
    expect(formatDate(endOfMonth(d("2024-06-15")))).toBe("2024-06-30");
  });

  it("returns Feb 29 for leap year", () => {
    expect(formatDate(endOfMonth(d("2024-02-10")))).toBe("2024-02-29");
  });

  it("returns Feb 28 for non-leap year", () => {
    expect(formatDate(endOfMonth(d("2023-02-10")))).toBe("2023-02-28");
  });
});
