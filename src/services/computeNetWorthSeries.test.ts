import { describe, expect, it } from "vitest";

import type { Account } from "@/models/Account.type";
import { AccountType } from "@/models/AccountType";
import { ChartPeriod } from "@/models/ChartPeriod";
import type { Transaction } from "@/models/Transaction.type";

import { computeNetWorthSeries } from "./computeNetWorthSeries";

const TODAY = "2024-06-15";

function makeAccount(id: string, type: AccountType): Account {
  return { id, name: `Account ${id}`, type };
}

function makeTx(
  accountId: string,
  amount: number,
  date: string
): Transaction {
  return { id: `t-${accountId}-${date}`, accountId, amount, date, description: "" };
}

describe("computeNetWorthSeries", () => {
  it("returns all-zero points with no accounts", () => {
    const result = computeNetWorthSeries([], [], ChartPeriod.OneWeek, TODAY);
    result.forEach((p) => expect(p.netWorth).toBe(0));
  });

  it("returns all-zero points with no transactions", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const result = computeNetWorthSeries(accounts, [], ChartPeriod.OneWeek, TODAY);
    result.forEach((p) => expect(p.netWorth).toBe(0));
  });

  describe("date range generation", () => {
    it("generates 8 daily points for OneWeek (today + 7 prior days)", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.OneWeek, TODAY);
      expect(result).toHaveLength(8);
      expect(result[0].date).toBe("2024-06-08");
      expect(result[7].date).toBe("2024-06-15");
    });

    it("generates MTD points from the 1st of the month to today", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.MTD, TODAY);
      expect(result[0].date).toBe("2024-06-01");
      expect(result[result.length - 1].date).toBe("2024-06-15");
      expect(result).toHaveLength(15);
    });

    it("generates 31 daily points for OneMonth", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.OneMonth, TODAY);
      expect(result).toHaveLength(31);
      expect(result[0].date).toBe("2024-05-16");
      expect(result[30].date).toBe("2024-06-15");
    });

    it("generates weekly points for ThreeMonths (90 days)", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.ThreeMonths, TODAY);
      expect(result[result.length - 1].date).toBe("2024-06-15");
      expect(result[0].date).toBe("2024-03-17");
      expect(result).toHaveLength(14);
    });

    it("ensures ThreeMonths includes exact today date when not aligned", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.ThreeMonths, "2024-06-18");
      const lastDate = result[result.length - 1].date;
      expect(lastDate).toBe("2024-06-18");
    });

    it("handles ThreeMonths when today aligns with weekly interval", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.ThreeMonths, "2024-03-17");
      const lastDate = result[result.length - 1].date;
      expect(lastDate).toBe("2024-03-17");
    });

    it("generates weekly points for SixMonths (180 days), snapped to Sunday", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.SixMonths, TODAY);
      expect(result[0].date).toBe("2023-12-17");
      expect(result[result.length - 1].date).toBe("2024-06-15");
      // Sunday-aligned: Dec 17 to Jun 9 = 26 weekly + today = 27 points
      expect(result).toHaveLength(27);
    });

    it("generates YTD points from next Sunday after Jan 1 to today", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.YTD, TODAY);
      // Jan 1 2024 is Monday, next Sunday = Jan 7
      expect(result[0].date).toBe("2024-01-07");
      expect(result[result.length - 1].date).toBe("2024-06-15");
      // Jan 7 to Jun 9 = 23 weekly + today = 24 points
      expect(result).toHaveLength(24);
    });

    it("handles YTD when today aligns with weekly interval from first Sunday", () => {
      // Jan 1 2024 is Monday, first Sunday = Jan 7. Jan 7 + 23*7 = Jun 16
      const result = computeNetWorthSeries([], [], ChartPeriod.YTD, "2024-06-16");
      expect(result[0].date).toBe("2024-01-07");
      expect(result[result.length - 1].date).toBe("2024-06-16");
    });

    it("handles SixMonths when today aligns with weekly interval", () => {
      // 2024-06-17 - 180 days = 2023-12-20; 180 is not divisible by 7
      // but the "if" guard ensures today is always included
      const result = computeNetWorthSeries([], [], ChartPeriod.SixMonths, "2024-06-17");
      expect(result[result.length - 1].date).toBe("2024-06-17");
    });

    it("handles SixMonths when today is a Sunday", () => {
      // 2024-06-16 is Sunday → last weekly point equals today, no extra point needed
      const result = computeNetWorthSeries([], [], ChartPeriod.SixMonths, "2024-06-16");
      expect(result[result.length - 1].date).toBe("2024-06-16");
    });

    it("handles YTD when Jan 1 is a Sunday", () => {
      // Jan 1, 2023 is Sunday → start = Jan 1 (day === 0 branch)
      const result = computeNetWorthSeries([], [], ChartPeriod.YTD, "2023-06-15");
      expect(result[0].date).toBe("2023-01-01");
    });

    it("handles All monthly when today is end of month", () => {
      const accounts = [makeAccount("1", AccountType.Asset)];
      const transactions = [makeTx("1", 100, "2022-01-01")];
      // Today = Jun 30 → aligns with end-of-month, no extra point
      const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.All, "2024-06-30");
      expect(result[result.length - 1].date).toBe("2024-06-30");
    });

    it("generates end-of-month points for OneYear", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.OneYear, TODAY);
      expect(result[result.length - 1].date).toBe("2024-06-15");
      // 12 end-of-month points (Jun 2023 through May 2024) + today
      expect(result[0].date).toBe("2023-06-30");
      expect(result).toHaveLength(13);
    });

    it("generates end-of-month spacing for All period based on transaction history", () => {
      const accounts = [makeAccount("1", AccountType.Asset)];
      const transactions = [
        makeTx("1", 100, "2022-01-01"),
        makeTx("1", 200, "2024-06-10"),
      ];
      const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.All, TODAY);
      // startMonth = Dec 2021 (one month before first tx), endOfMonth = Dec 31
      expect(result[0].date).toBe("2021-12-31");
      expect(result[result.length - 1].date).toBe("2024-06-15");
      // Dec 2021 to Jun 2024 = 31 end-of-month + today = 32 points
      expect(result.length).toBeGreaterThanOrEqual(31);
    });

    it("uses Sunday-snapped weekly spacing for All period with short history (< 180 days)", () => {
      const accounts = [makeAccount("1", AccountType.Asset)];
      const transactions = [
        makeTx("1", 100, "2024-03-01"),
        makeTx("1", 200, "2024-06-10"),
      ];
      const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.All, TODAY);
      // 2024-03-01 is Friday (day=5), toSunday = Feb 25
      expect(result[0].date).toBe("2024-02-25");
      expect(result[result.length - 1].date).toBe("2024-06-15");
      // Feb 25 to Jun 9 = 16 weekly + today = 17 points
      expect(result.length).toBeGreaterThanOrEqual(16);
      expect(result.length).toBeLessThanOrEqual(17);
    });

    it("All period starts with $0 net worth before the first transaction (monthly spacing)", () => {
      const accounts = [makeAccount("1", AccountType.Asset)];
      const transactions = [makeTx("1", 1000, "2022-01-15")];
      const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.All, "2024-06-15");

      // First data point should have $0 net worth
      expect(result[0].netWorth).toBe(0);
      // First data point should be before the transaction date
      expect(new Date(result[0].date).getTime()).toBeLessThan(new Date("2022-01-15").getTime());
    });

    it("All period starts with $0 net worth before the first transaction (weekly spacing)", () => {
      const accounts = [makeAccount("1", AccountType.Asset)];
      // 2024-06-09 is a Sunday
      const transactions = [makeTx("1", 500, "2024-06-09")];
      const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.All, "2024-06-15");

      // First data point should have $0 net worth
      expect(result[0].netWorth).toBe(0);
      // First data point should be before the transaction date (even when tx is on a Sunday)
      expect(new Date(result[0].date).getTime()).toBeLessThan(new Date("2024-06-09").getTime());
    });

    it("falls back to 1 year end-of-month for All period with no transactions", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.All, TODAY);
      // fallback = Jun 15, 2023 → startMonth = Jun 2023 → endOfMonth = Jun 30
      expect(result[0].date).toBe("2023-06-30");
      expect(result[result.length - 1].date).toBe("2024-06-15");
    });

    it("generates daily points for Custom period with customRange", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.Custom, TODAY, {
        start: "2024-06-01",
        end: "2024-06-10",
      });
      expect(result[0].date).toBe("2024-06-01");
      expect(result[result.length - 1].date).toBe("2024-06-10");
      expect(result).toHaveLength(10);
    });

    it("returns single point for Custom period without range", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.Custom, TODAY);
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe(TODAY);
    });
  });

  it("reflects a single transaction on its date", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [makeTx("1", 1000, "2024-06-12")];
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.OneWeek, TODAY);

    const before = result.find((p) => p.date === "2024-06-11")!;
    const onDate = result.find((p) => p.date === "2024-06-12")!;
    const after = result.find((p) => p.date === "2024-06-13")!;

    expect(before.netWorth).toBe(0);
    expect(onDate.netWorth).toBe(1000);
    expect(after.netWorth).toBe(1000);
  });

  it("includes transactions before the period in the starting balance", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [makeTx("1", 5000, "2020-01-01")];
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.OneWeek, TODAY);

    result.forEach((p) => expect(p.netWorth).toBe(5000));
  });

  it("accumulates multiple transactions over time", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [
      makeTx("1", 100, "2024-06-10"),
      makeTx("1", 200, "2024-06-12"),
      makeTx("1", 300, "2024-06-14"),
    ];
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.OneWeek, TODAY);

    expect(result.find((p) => p.date === "2024-06-09")!.netWorth).toBe(0);
    expect(result.find((p) => p.date === "2024-06-10")!.netWorth).toBe(100);
    expect(result.find((p) => p.date === "2024-06-11")!.netWorth).toBe(100);
    expect(result.find((p) => p.date === "2024-06-12")!.netWorth).toBe(300);
    expect(result.find((p) => p.date === "2024-06-14")!.netWorth).toBe(600);
    expect(result.find((p) => p.date === "2024-06-15")!.netWorth).toBe(600);
  });

  it("handles multiple transactions on the same date", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [
      makeTx("1", 100, "2024-06-12"),
      { id: "t-1-dup", accountId: "1", amount: 250, date: "2024-06-12", description: "" },
    ];
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.OneWeek, TODAY);

    expect(result.find((p) => p.date === "2024-06-12")!.netWorth).toBe(350);
  });

  it("computes assets minus liabilities", () => {
    const accounts = [
      makeAccount("a", AccountType.Asset),
      makeAccount("l", AccountType.Liability),
    ];
    const transactions = [
      makeTx("a", 5000, "2024-06-10"),
      makeTx("l", 2000, "2024-06-10"),
    ];
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.OneWeek, TODAY);

    expect(result.find((p) => p.date === "2024-06-10")!.netWorth).toBe(3000);
  });

  it("handles multiple accounts of the same type", () => {
    const accounts = [
      makeAccount("a1", AccountType.Asset),
      makeAccount("a2", AccountType.Asset),
    ];
    const transactions = [
      makeTx("a1", 1000, "2024-06-10"),
      makeTx("a2", 2000, "2024-06-12"),
    ];
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.OneWeek, TODAY);

    expect(result.find((p) => p.date === "2024-06-10")!.netWorth).toBe(1000);
    expect(result.find((p) => p.date === "2024-06-12")!.netWorth).toBe(3000);
  });

  it("ignores transactions for unknown accounts", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [
      makeTx("1", 1000, "2024-06-10"),
      makeTx("unknown", 9999, "2024-06-10"),
    ];
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.OneWeek, TODAY);

    expect(result.find((p) => p.date === "2024-06-10")!.netWorth).toBe(1000);
  });

  it("handles OneYear period with varying month lengths", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [makeTx("1", 100, "2023-01-01")];
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.OneYear, "2024-02-29");

    // Feb 29 leap year → 12 months back clamps to Feb 28
    expect(result[result.length - 1].date).toBe("2024-02-29");
    expect(result[0].date).toBe("2023-02-28");
    // Transaction before period → all points should have the balance
    result.forEach((p) => expect(p.netWorth).toBe(100));
  });
});
