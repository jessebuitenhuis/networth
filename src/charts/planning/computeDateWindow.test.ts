import { describe, expect, it } from "vitest";

import { ChartPeriod } from "@/charts/ChartPeriod";

import { computeDateWindow } from "./computeDateWindow";

describe("computeDateWindow", () => {
  const today = new Date("2026-02-23T00:00:00");

  it("returns one period back and one period forward for offset=0", () => {
    const { start, end } = computeDateWindow(ChartPeriod.OneWeek, 0, today);
    expect(start.toISOString().slice(0, 10)).toBe("2026-02-16");
    expect(end.toISOString().slice(0, 10)).toBe("2026-03-02");
  });

  it("shifts window forward with positive offset", () => {
    const { start, end } = computeDateWindow(ChartPeriod.OneWeek, 1, today);
    expect(start.toISOString().slice(0, 10)).toBe("2026-02-23");
    expect(end.toISOString().slice(0, 10)).toBe("2026-03-09");
  });

  it("shifts window backward with negative offset", () => {
    const { start, end } = computeDateWindow(ChartPeriod.OneWeek, -1, today);
    expect(start.toISOString().slice(0, 10)).toBe("2026-02-09");
    expect(end.toISOString().slice(0, 10)).toBe("2026-02-23");
  });

  it("works with 1M period", () => {
    const { start, end } = computeDateWindow(ChartPeriod.OneMonth, 0, today);
    expect(start.toISOString().slice(0, 10)).toBe("2026-01-23");
    expect(end.toISOString().slice(0, 10)).toBe("2026-03-23");
  });
});
