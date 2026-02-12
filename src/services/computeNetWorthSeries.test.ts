import { describe, expect, it } from "vitest";
import { computeNetWorthSeries } from "./computeNetWorthSeries";
import { ChartPeriod } from "@/models/ChartPeriod";
import { AccountType } from "@/models/AccountType";
import type { Account } from "@/models/Account";
import type { Transaction } from "@/models/Transaction";

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

    it("generates weekly points for SixMonths (180 days)", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.SixMonths, TODAY);
      expect(result[0].date).toBe("2023-12-18");
      expect(result[result.length - 1].date).toBe("2024-06-15");
      // 180 days / 7 ≈ ~26 intervals → 26-27 points
      expect(result.length).toBeGreaterThanOrEqual(26);
      expect(result.length).toBeLessThanOrEqual(27);
    });

    it("generates YTD points from Jan 1 to today", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.YTD, TODAY);
      expect(result[0].date).toBe("2024-01-01");
      expect(result[result.length - 1].date).toBe("2024-06-15");
      // Jan 1 to June 15 = ~167 days, weekly = ~24 points
      expect(result.length).toBeGreaterThanOrEqual(24);
      expect(result.length).toBeLessThanOrEqual(25);
    });

    it("handles YTD when today aligns with weekly interval from Jan 1", () => {
      // Jan 1 + 24*7 = Jun 17 → weekly point lands exactly on today
      const result = computeNetWorthSeries([], [], ChartPeriod.YTD, "2024-06-17");
      expect(result[0].date).toBe("2024-01-01");
      expect(result[result.length - 1].date).toBe("2024-06-17");
    });

    it("handles SixMonths when today aligns with weekly interval", () => {
      // 2024-06-17 - 180 days = 2023-12-20; 180 is not divisible by 7
      // but the "if" guard ensures today is always included
      const result = computeNetWorthSeries([], [], ChartPeriod.SixMonths, "2024-06-17");
      expect(result[result.length - 1].date).toBe("2024-06-17");
    });

    it("generates monthly points for OneYear", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.OneYear, TODAY);
      expect(result[result.length - 1].date).toBe("2024-06-15");
      expect(result[0].date).toBe("2023-06-15");
      expect(result).toHaveLength(13);
    });

    it("generates adaptive spacing for All period based on transaction history", () => {
      const accounts = [makeAccount("1", AccountType.Asset)];
      const transactions = [
        makeTx("1", 100, "2022-01-01"),
        makeTx("1", 200, "2024-06-10"),
      ];
      const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.All, TODAY);
      expect(result[0].date).toBe("2022-01-01");
      expect(result[result.length - 1].date).toBe("2024-06-15");
      // Should use monthly spacing for multi-year ranges
      expect(result.length).toBeGreaterThanOrEqual(20);
    });

    it("uses weekly spacing for All period with short history (< 180 days)", () => {
      const accounts = [makeAccount("1", AccountType.Asset)];
      const transactions = [
        makeTx("1", 100, "2024-03-01"),
        makeTx("1", 200, "2024-06-10"),
      ];
      const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.All, TODAY);
      expect(result[0].date).toBe("2024-03-01");
      expect(result[result.length - 1].date).toBe("2024-06-15");
      // ~107 days / 7 ≈ ~15-16 weekly points
      expect(result.length).toBeGreaterThanOrEqual(15);
      expect(result.length).toBeLessThanOrEqual(17);
    });

    it("falls back to 1 year for All period with no transactions", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.All, TODAY);
      expect(result[0].date).toBe("2023-06-15");
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
