import { describe, expect, it } from "vitest";

import { ChartPeriod } from "@/models/ChartPeriod";

import { formatTick, getTickFormat } from "./formatXAxisTick";

describe("getTickFormat", () => {
  it("returns weekday for OneWeek", () => {
    expect(getTickFormat(ChartPeriod.OneWeek)).toBe("weekday");
  });

  it("returns dayMonth for daily periods", () => {
    expect(getTickFormat(ChartPeriod.MTD)).toBe("dayMonth");
    expect(getTickFormat(ChartPeriod.OneMonth)).toBe("dayMonth");
    expect(getTickFormat(ChartPeriod.Custom)).toBe("dayMonth");
  });

  it("returns dayMonth for weekly periods", () => {
    expect(getTickFormat(ChartPeriod.ThreeMonths)).toBe("dayMonth");
    expect(getTickFormat(ChartPeriod.SixMonths)).toBe("dayMonth");
    expect(getTickFormat(ChartPeriod.YTD)).toBe("dayMonth");
  });

  it("returns monthYear for OneYear", () => {
    expect(getTickFormat(ChartPeriod.OneYear)).toBe("monthYear");
  });

  it("returns monthYear for All with monthly-spaced data", () => {
    const data = [{ date: "2022-01-31" }, { date: "2022-02-28" }];
    expect(getTickFormat(ChartPeriod.All, data)).toBe("monthYear");
  });

  it("returns dayMonth for All with weekly-spaced data", () => {
    const data = [{ date: "2024-03-03" }, { date: "2024-03-10" }];
    expect(getTickFormat(ChartPeriod.All, data)).toBe("dayMonth");
  });

  it("defaults to monthYear for All with no data", () => {
    expect(getTickFormat(ChartPeriod.All)).toBe("monthYear");
  });
});

describe("formatTick", () => {
  it("returns short weekday", () => {
    expect(formatTick("2024-06-15", "weekday")).toMatch(/sat/i);
  });

  it("returns day and month", () => {
    const result = formatTick("2024-06-15", "dayMonth");
    expect(result).toMatch(/jun/i);
    expect(result).toMatch(/15/);
  });

  it("returns month and year", () => {
    const result = formatTick("2024-06-15", "monthYear");
    expect(result).toMatch(/jun/i);
    expect(result).toMatch(/24/);
  });
});
