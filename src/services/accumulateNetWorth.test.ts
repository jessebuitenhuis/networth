import { describe, expect, it } from "vitest";

import { AccountType } from "@/models/AccountType";
import type { Transaction } from "@/models/Transaction.type";

import { accumulateNetWorth } from "./accumulateNetWorth";

describe("accumulateNetWorth", () => {
  const accountTypes = new Map<string, AccountType>([
    ["asset-1", AccountType.Asset],
    ["liability-1", AccountType.Liability],
  ]);

  it("returns zero net worth when there are no transactions", () => {
    const result = accumulateNetWorth(
      ["2026-01-01", "2026-01-02"],
      [],
      accountTypes
    );

    expect(result).toEqual([
      { date: "2026-01-01", netWorth: 0 },
      { date: "2026-01-02", netWorth: 0 },
    ]);
  });

  it("accumulates asset transactions as positive", () => {
    const transactions: Transaction[] = [
      { id: "1", accountId: "asset-1", amount: 1000, date: "2026-01-01", description: "" },
      { id: "2", accountId: "asset-1", amount: 500, date: "2026-01-02", description: "" },
    ];

    const result = accumulateNetWorth(
      ["2026-01-01", "2026-01-02", "2026-01-03"],
      transactions,
      accountTypes
    );

    expect(result).toEqual([
      { date: "2026-01-01", netWorth: 1000 },
      { date: "2026-01-02", netWorth: 1500 },
      { date: "2026-01-03", netWorth: 1500 },
    ]);
  });

  it("accumulates liability transactions as negative", () => {
    const transactions: Transaction[] = [
      { id: "1", accountId: "liability-1", amount: 500, date: "2026-01-01", description: "" },
    ];

    const result = accumulateNetWorth(
      ["2026-01-01", "2026-01-02"],
      transactions,
      accountTypes
    );

    expect(result).toEqual([
      { date: "2026-01-01", netWorth: -500 },
      { date: "2026-01-02", netWorth: -500 },
    ]);
  });

  it("uses initialNetWorth as starting value", () => {
    const result = accumulateNetWorth(
      ["2026-01-01"],
      [],
      accountTypes,
      5000
    );

    expect(result).toEqual([{ date: "2026-01-01", netWorth: 5000 }]);
  });

  it("groups multiple transactions on the same date", () => {
    const transactions: Transaction[] = [
      { id: "1", accountId: "asset-1", amount: 100, date: "2026-01-01", description: "" },
      { id: "2", accountId: "asset-1", amount: 200, date: "2026-01-01", description: "" },
    ];

    const result = accumulateNetWorth(
      ["2026-01-01"],
      transactions,
      accountTypes
    );

    expect(result).toEqual([{ date: "2026-01-01", netWorth: 300 }]);
  });
});
