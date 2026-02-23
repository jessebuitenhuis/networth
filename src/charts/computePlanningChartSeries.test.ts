import { describe, expect, it } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { ChartPeriod } from "@/charts/ChartPeriod";
import type { Transaction } from "@/transactions/Transaction.type";

import { computePlanningChartSeries } from "./computePlanningChartSeries";

const checking: Account = { id: "1", name: "Checking", type: AccountType.Asset };
const creditCard: Account = {
  id: "2",
  name: "Credit Card",
  type: AccountType.Liability,
};

describe("computePlanningChartSeries", () => {
  const today = "2026-02-23";

  it("returns data points spanning the full window", () => {
    const series = computePlanningChartSeries(
      [checking],
      [],
      ChartPeriod.OneWeek,
      0,
      today
    );

    expect(series[0].date).toBe("2026-02-16");
    expect(series[series.length - 1].date).toBe("2026-03-02");
    expect(series).toHaveLength(15); // 14 days + 1
  });

  it("includes actual historical transactions in historical portion", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "1", amount: 1000, date: "2026-02-18", description: "Deposit" },
      { id: "t2", accountId: "1", amount: 500, date: "2026-02-20", description: "Salary" },
    ];

    const series = computePlanningChartSeries(
      [checking],
      transactions,
      ChartPeriod.OneWeek,
      0,
      today
    );

    // Before any transactions
    const feb16 = series.find((p) => p.date === "2026-02-16");
    expect(feb16?.netWorth).toBe(0);

    // After first transaction
    const feb18 = series.find((p) => p.date === "2026-02-18");
    expect(feb18?.netWorth).toBe(1000);

    // After both transactions
    const feb20 = series.find((p) => p.date === "2026-02-20");
    expect(feb20?.netWorth).toBe(1500);
  });

  it("carries initial net worth from transactions before window start", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "1", amount: 5000, date: "2026-01-01", description: "Old deposit" },
      { id: "t2", accountId: "1", amount: 200, date: "2026-02-18", description: "Recent" },
    ];

    const series = computePlanningChartSeries(
      [checking],
      transactions,
      ChartPeriod.OneWeek,
      0,
      today
    );

    // First point should carry the pre-window balance
    expect(series[0].netWorth).toBe(5000);

    // After the in-window transaction
    const feb18 = series.find((p) => p.date === "2026-02-18");
    expect(feb18?.netWorth).toBe(5200);
  });

  it("handles liability accounts correctly", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "1", amount: 3000, date: "2026-02-17", description: "Income" },
      { id: "t2", accountId: "2", amount: 500, date: "2026-02-19", description: "CC charge" },
    ];

    const series = computePlanningChartSeries(
      [checking, creditCard],
      transactions,
      ChartPeriod.OneWeek,
      0,
      today
    );

    const feb17 = series.find((p) => p.date === "2026-02-17");
    expect(feb17?.netWorth).toBe(3000);

    const feb19 = series.find((p) => p.date === "2026-02-19");
    expect(feb19?.netWorth).toBe(2500); // 3000 - 500
  });

  it("shifts window with positive offset", () => {
    const series = computePlanningChartSeries(
      [checking],
      [],
      ChartPeriod.OneWeek,
      1,
      today
    );

    expect(series[0].date).toBe("2026-02-23");
    expect(series[series.length - 1].date).toBe("2026-03-09");
  });

  it("shifts window with negative offset", () => {
    const series = computePlanningChartSeries(
      [checking],
      [],
      ChartPeriod.OneWeek,
      -1,
      today
    );

    expect(series[0].date).toBe("2026-02-09");
    expect(series[series.length - 1].date).toBe("2026-02-23");
  });

  it("includes future one-off transactions in projected portion", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "1", amount: 1000, date: "2026-02-20", description: "Past" },
      { id: "t2", accountId: "1", amount: 2000, date: "2026-02-25", description: "Future" },
    ];

    const series = computePlanningChartSeries(
      [checking],
      transactions,
      ChartPeriod.OneWeek,
      0,
      today
    );

    const feb24 = series.find((p) => p.date === "2026-02-24");
    expect(feb24?.netWorth).toBe(1000);

    const feb25 = series.find((p) => p.date === "2026-02-25");
    expect(feb25?.netWorth).toBe(3000);
  });

  it("uses 1M period with daily granularity", () => {
    const series = computePlanningChartSeries(
      [checking],
      [],
      ChartPeriod.OneMonth,
      0,
      today
    );

    expect(series[0].date).toBe("2026-01-23");
    expect(series[series.length - 1].date).toBe("2026-03-23");
    // 2 months = ~59 days + 1
    expect(series.length).toBeGreaterThan(50);
  });

  it("uses 1Y period with monthly granularity", () => {
    const series = computePlanningChartSeries(
      [checking],
      [],
      ChartPeriod.OneYear,
      0,
      today
    );

    expect(series[0].date).toBe("2025-02-23");
    expect(series[series.length - 1].date).toBe("2027-02-23");
    // Should have roughly 24 monthly points + start + end
    expect(series.length).toBeGreaterThan(20);
    expect(series.length).toBeLessThan(30);
  });

  it("filters out transactions for excluded accounts", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "1", amount: 1000, date: "2026-02-18", description: "Included" },
      { id: "t2", accountId: "3", amount: 5000, date: "2026-02-18", description: "Not included" },
    ];

    // Only pass checking, not the account for id "3"
    const series = computePlanningChartSeries(
      [checking],
      transactions,
      ChartPeriod.OneWeek,
      0,
      today
    );

    const feb18 = series.find((p) => p.date === "2026-02-18");
    expect(feb18?.netWorth).toBe(1000);
  });
});
