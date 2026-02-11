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
    const result = computeNetWorthSeries([], [], ChartPeriod.Week, TODAY);
    result.forEach((p) => expect(p.netWorth).toBe(0));
  });

  it("returns all-zero points with no transactions", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const result = computeNetWorthSeries(accounts, [], ChartPeriod.Week, TODAY);
    result.forEach((p) => expect(p.netWorth).toBe(0));
  });

  describe("date range generation", () => {
    it("generates 8 daily points for Week (today + 7 prior days)", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.Week, TODAY);
      expect(result).toHaveLength(8);
      expect(result[0].date).toBe("2024-06-08");
      expect(result[7].date).toBe("2024-06-15");
    });

    it("generates 31 daily points for Month", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.Month, TODAY);
      expect(result).toHaveLength(31);
      expect(result[0].date).toBe("2024-05-16");
      expect(result[30].date).toBe("2024-06-15");
    });

    it("generates weekly points for Quarter", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.Quarter, TODAY);
      expect(result[result.length - 1].date).toBe("2024-06-15");
      expect(result[0].date).toBe("2024-03-17");
      // 90 days / 7 = ~13 intervals → 14 points
      expect(result).toHaveLength(14);
    });

    it("generates monthly points for Year", () => {
      const result = computeNetWorthSeries([], [], ChartPeriod.Year, TODAY);
      expect(result[result.length - 1].date).toBe("2024-06-15");
      expect(result[0].date).toBe("2023-06-15");
      expect(result).toHaveLength(13);
    });
  });

  it("reflects a single transaction on its date", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [makeTx("1", 1000, "2024-06-12")];
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.Week, TODAY);

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
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.Week, TODAY);

    result.forEach((p) => expect(p.netWorth).toBe(5000));
  });

  it("accumulates multiple transactions over time", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [
      makeTx("1", 100, "2024-06-10"),
      makeTx("1", 200, "2024-06-12"),
      makeTx("1", 300, "2024-06-14"),
    ];
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.Week, TODAY);

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
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.Week, TODAY);

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
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.Week, TODAY);

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
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.Week, TODAY);

    expect(result.find((p) => p.date === "2024-06-10")!.netWorth).toBe(1000);
    expect(result.find((p) => p.date === "2024-06-12")!.netWorth).toBe(3000);
  });

  it("ignores transactions for unknown accounts", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [
      makeTx("1", 1000, "2024-06-10"),
      makeTx("unknown", 9999, "2024-06-10"),
    ];
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.Week, TODAY);

    expect(result.find((p) => p.date === "2024-06-10")!.netWorth).toBe(1000);
  });

  it("handles Year period with varying month lengths", () => {
    const accounts = [makeAccount("1", AccountType.Asset)];
    const transactions = [makeTx("1", 100, "2023-01-01")];
    const result = computeNetWorthSeries(accounts, transactions, ChartPeriod.Year, "2024-02-29");

    // Feb 29 leap year → 12 months back clamps to Feb 28
    expect(result[result.length - 1].date).toBe("2024-02-29");
    expect(result[0].date).toBe("2023-02-28");
    // Transaction before period → all points should have the balance
    result.forEach((p) => expect(p.netWorth).toBe(100));
  });
});
