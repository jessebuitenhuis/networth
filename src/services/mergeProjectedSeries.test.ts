import { describe, expect,it } from "vitest";

import type { NetWorthDataPoint } from "@/models/NetWorthDataPoint.type";

import { mergeProjectedSeries } from "./mergeProjectedSeries";

describe("mergeProjectedSeries", () => {
  it("returns empty array when seriesMap is empty", () => {
    const result = mergeProjectedSeries(new Map());
    expect(result).toEqual([]);
  });

  it("single series produces points with date + that series key", () => {
    const baselineData: NetWorthDataPoint[] = [
      { date: "2026-01-01", netWorth: 1000 },
      { date: "2026-01-02", netWorth: 1100 },
    ];

    const seriesMap = new Map([["baseline", baselineData]]);
    const result = mergeProjectedSeries(seriesMap);

    expect(result).toEqual([
      { date: "2026-01-01", baseline: 1000 },
      { date: "2026-01-02", baseline: 1100 },
    ]);
  });

  it("two series with identical dates merges correctly", () => {
    const baselineData: NetWorthDataPoint[] = [
      { date: "2026-01-01", netWorth: 1000 },
      { date: "2026-01-02", netWorth: 1100 },
    ];
    const scenarioData: NetWorthDataPoint[] = [
      { date: "2026-01-01", netWorth: 1500 },
      { date: "2026-01-02", netWorth: 1600 },
    ];

    const seriesMap = new Map([
      ["baseline", baselineData],
      ["scenario_abc", scenarioData],
    ]);
    const result = mergeProjectedSeries(seriesMap);

    expect(result).toEqual([
      { date: "2026-01-01", baseline: 1000, scenario_abc: 1500 },
      { date: "2026-01-02", baseline: 1100, scenario_abc: 1600 },
    ]);
  });

  it("preserves ascending date order", () => {
    const baselineData: NetWorthDataPoint[] = [
      { date: "2026-01-01", netWorth: 1000 },
      { date: "2026-01-02", netWorth: 1100 },
      { date: "2026-01-03", netWorth: 1200 },
    ];

    const seriesMap = new Map([["baseline", baselineData]]);
    const result = mergeProjectedSeries(seriesMap);

    expect(result[0].date).toBe("2026-01-01");
    expect(result[1].date).toBe("2026-01-02");
    expect(result[2].date).toBe("2026-01-03");
  });

  it("multiple series all appear as separate keys", () => {
    const series1: NetWorthDataPoint[] = [
      { date: "2026-01-01", netWorth: 1000 },
    ];
    const series2: NetWorthDataPoint[] = [
      { date: "2026-01-01", netWorth: 2000 },
    ];
    const series3: NetWorthDataPoint[] = [
      { date: "2026-01-01", netWorth: 3000 },
    ];

    const seriesMap = new Map([
      ["baseline", series1],
      ["scenario_1", series2],
      ["scenario_2", series3],
    ]);
    const result = mergeProjectedSeries(seriesMap);

    expect(result).toEqual([
      {
        date: "2026-01-01",
        baseline: 1000,
        scenario_1: 2000,
        scenario_2: 3000,
      },
    ]);
  });
});
