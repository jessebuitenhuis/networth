import { describe, expect, it } from "vitest";

import { addDays, addMonths, addYears, endOfMonth, formatDate, toSunday } from "./dateUtils";

function d(s: string): Date {
  return new Date(s + "T00:00:00");
}

describe("addDays", () => {
  it.each([
    ["2024-06-10", 5, "2024-06-15"],
    ["2024-06-10", -3, "2024-06-07"],
    ["2024-01-30", 3, "2024-02-02"],
  ])("addDays(%s, %i) = %s", (date, days, expected) => {
    expect(formatDate(addDays(d(date), days))).toBe(expected);
  });

  it("returns a new Date instance", () => {
    const original = d("2024-06-10");
    expect(addDays(original, 1)).not.toBe(original);
  });
});

describe("addMonths", () => {
  it.each([
    ["2024-01-15", 3, "2024-04-15"],
    ["2024-06-15", -2, "2024-04-15"],
    ["2024-01-31", 1, "2024-02-29"],
    ["2023-01-31", 1, "2023-02-28"],
    ["2024-02-29", -12, "2023-02-28"],
  ])("addMonths(%s, %i) = %s", (date, months, expected) => {
    expect(formatDate(addMonths(d(date), months))).toBe(expected);
  });
});

describe("addYears", () => {
  it.each([
    ["2024-06-15", 1, "2025-06-15"],
    ["2024-06-15", -2, "2022-06-15"],
    ["2024-02-29", 1, "2025-02-28"],
  ])("addYears(%s, %i) = %s", (date, years, expected) => {
    expect(formatDate(addYears(d(date), years))).toBe(expected);
  });
});

describe("formatDate", () => {
  it.each([
    [new Date("2024-06-15"), "2024-06-15"],
    [d("2024-01-05"), "2024-01-05"],
  ])("formats as YYYY-MM-DD", (date, expected) => {
    expect(formatDate(date)).toBe(expected);
  });
});

describe("toSunday", () => {
  it.each([
    ["2024-03-17", "2024-03-17"],
    ["2024-03-18", "2024-03-17"],
    ["2024-06-15", "2024-06-09"],
    ["2024-07-01", "2024-06-30"],
  ])("toSunday(%s) = %s", (date, expected) => {
    expect(formatDate(toSunday(d(date)))).toBe(expected);
  });
});

describe("endOfMonth", () => {
  it.each([
    ["2024-07-15", "2024-07-31"],
    ["2024-06-15", "2024-06-30"],
    ["2024-02-10", "2024-02-29"],
    ["2023-02-10", "2023-02-28"],
  ])("endOfMonth(%s) = %s", (date, expected) => {
    expect(formatDate(endOfMonth(d(date)))).toBe(expected);
  });
});
