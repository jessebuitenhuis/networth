import { describe, expect,it } from "vitest";

import { ChartPeriod } from "@/charts/ChartPeriod";
import { formatDate } from "@/lib/dateUtils";

import { shiftDateByPeriod } from "./shiftDateByPeriod";

describe("shiftDateByPeriod", () => {
  const base = new Date("2026-02-23T00:00:00");

  it.each([
    [ChartPeriod.OneWeek, 1, "2026-03-02"],
    [ChartPeriod.OneWeek, -1, "2026-02-16"],
    [ChartPeriod.OneMonth, 1, "2026-03-23"],
    [ChartPeriod.OneMonth, -1, "2026-01-23"],
    [ChartPeriod.ThreeMonths, 1, "2026-05-23"],
    [ChartPeriod.ThreeMonths, -1, "2025-11-23"],
    [ChartPeriod.SixMonths, 1, "2026-08-23"],
    [ChartPeriod.SixMonths, -1, "2025-08-23"],
    [ChartPeriod.OneYear, 1, "2027-02-23"],
    [ChartPeriod.OneYear, -1, "2025-02-23"],
  ])(
    "%s with steps=%d returns %s",
    (period, steps, expected) => {
      expect(formatDate(shiftDateByPeriod(base, period, steps))).toBe(expected);
    }
  );

  it("returns the same date for All period", () => {
    expect(formatDate(shiftDateByPeriod(base, ChartPeriod.All, 5))).toBe("2026-02-23");
  });

  it("returns the same date for Custom period", () => {
    expect(formatDate(shiftDateByPeriod(base, ChartPeriod.Custom, 3))).toBe("2026-02-23");
  });

  it("handles zero steps", () => {
    expect(formatDate(shiftDateByPeriod(base, ChartPeriod.OneMonth, 0))).toBe("2026-02-23");
  });

  it("handles multiple steps forward", () => {
    expect(formatDate(shiftDateByPeriod(base, ChartPeriod.OneWeek, 3))).toBe("2026-03-16");
  });
});
