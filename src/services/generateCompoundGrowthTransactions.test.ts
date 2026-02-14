import { describe, expect, it } from "vitest";

import { Transaction } from "@/models/Transaction.type";

import { generateCompoundGrowthTransactions } from "./generateCompoundGrowthTransactions";

describe("generateCompoundGrowthTransactions", () => {
  const accountId = "account-1";
  const today = "2024-01-01";

  it("returns empty array when start balance is zero", () => {
    const datePoints = ["2024-01-01", "2024-02-01", "2024-03-01"];
    const result = generateCompoundGrowthTransactions(
      accountId,
      0,
      8,
      [],
      datePoints,
      today,
    );

    expect(result).toEqual([]);
  });

  it("computes correct growth with no future transactions", () => {
    const startBalance = 10000;
    const annualRate = 12;
    const datePoints = ["2024-01-01", "2024-02-01", "2024-03-01"];

    const result = generateCompoundGrowthTransactions(
      accountId,
      startBalance,
      annualRate,
      [],
      datePoints,
      today,
    );

    // First month: 10000 * ((1.12)^(31/365) - 1) ≈ 96.72
    // Second month (leap year, 29 days): 10096.72 * ((1.12)^(29/365) - 1) ≈ 91.32
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("growth-account-1-2024-02-01");
    expect(result[0].accountId).toBe(accountId);
    expect(result[0].amount).toBeCloseTo(96.72, 1);
    expect(result[0].date).toBe("2024-02-01");
    expect(result[0].description).toBe("Expected return");
    expect(result[0].isProjected).toBe(true);

    expect(result[1].id).toBe("growth-account-1-2024-03-01");
    expect(result[1].amount).toBeCloseTo(91.32, 1);
    expect(result[1].date).toBe("2024-03-01");
  });

  it("computes correct growth with future transactions affecting balance", () => {
    const startBalance = 10000;
    const annualRate = 12;
    const datePoints = ["2024-01-01", "2024-02-01", "2024-03-01"];
    const futureTx: Transaction[] = [
      {
        id: "tx-1",
        accountId,
        amount: 5000,
        date: "2024-01-15",
        description: "Deposit",
        isProjected: false,
      },
    ];

    const result = generateCompoundGrowthTransactions(
      accountId,
      startBalance,
      annualRate,
      futureTx,
      datePoints,
      today,
    );

    // First period (Jan 1 - Feb 1):
    // - Start: 10000
    // - Transaction on Jan 15: +5000 -> 15000
    // - Growth on Feb 1: 15000 * ((1.12)^(31/365) - 1) ≈ 145.07
    //
    // Second period (Feb 1 - Mar 1, leap year = 29 days):
    // - Start: 15145.07
    // - Growth on Mar 1: 15145.07 * ((1.12)^(29/365) - 1) ≈ 136.99

    expect(result).toHaveLength(2);
    expect(result[0].amount).toBeCloseTo(145.07, 1);
    expect(result[1].amount).toBeCloseTo(136.99, 1);
  });

  it("generates transactions with correct structure", () => {
    const datePoints = ["2024-01-01", "2024-02-01"];
    const result = generateCompoundGrowthTransactions(
      accountId,
      1000,
      8,
      [],
      datePoints,
      today,
    );

    expect(result[0]).toMatchObject({
      id: "growth-account-1-2024-02-01",
      accountId: "account-1",
      date: "2024-02-01",
      description: "Expected return",
      isProjected: true,
    });
    expect(typeof result[0].amount).toBe("number");
  });

  it("compounds correctly over multiple intervals", () => {
    const startBalance = 10000;
    const annualRate = 12;
    const datePoints = [
      "2024-01-01",
      "2024-02-01",
      "2024-03-01",
      "2024-04-01",
    ];

    const result = generateCompoundGrowthTransactions(
      accountId,
      startBalance,
      annualRate,
      [],
      datePoints,
      today,
    );

    // Verify that each subsequent growth is calculated on the compounded balance
    expect(result).toHaveLength(3);

    // Month 1: 10000 * ((1.12)^(31/365) - 1) ≈ 96.72
    const growth1 = result[0].amount;
    expect(growth1).toBeCloseTo(96.72, 1);

    // Month 2 (leap year, 29 days): 10096.72 * ((1.12)^(29/365) - 1) ≈ 91.32
    const growth2 = result[1].amount;
    expect(growth2).toBeCloseTo(91.32, 1);

    // Month 3: 10188.04 * ((1.12)^(31/365) - 1) ≈ 98.54
    const growth3 = result[2].amount;
    expect(growth3).toBeCloseTo(98.54, 1);
  });

  it("works for positive balances on liability accounts", () => {
    const startBalance = 200000; // Mortgage balance
    const annualRate = 4; // 4% interest
    const datePoints = ["2024-01-01", "2024-02-01"];

    const result = generateCompoundGrowthTransactions(
      accountId,
      startBalance,
      annualRate,
      [],
      datePoints,
      today,
    );

    // Interest: 200000 * ((1.04)^(31/365) - 1) ≈ 667.33
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBeCloseTo(667.33, 1);
    expect(result[0].description).toBe("Expected return");
  });
});
