import { describe, expect, it } from "vitest";

import type { Transaction } from "@/models/Transaction.type";

import { computeBalance } from "./computeBalance";

describe("computeBalance", () => {
  it("returns 0 when no transactions for account", () => {
    expect(computeBalance("a1", [])).toBe(0);
  });

  it("sums positive and negative amounts for matching accountId", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Opening" },
      { id: "t2", accountId: "a1", amount: -200, date: "2024-01-02", description: "Groceries" },
      { id: "t3", accountId: "a1", amount: 500, date: "2024-01-03", description: "Salary" },
    ];

    expect(computeBalance("a1", transactions)).toBe(1300);
  });

  it("ignores transactions for other accounts", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Opening" },
      { id: "t2", accountId: "a2", amount: 5000, date: "2024-01-01", description: "Other" },
    ];

    expect(computeBalance("a1", transactions)).toBe(1000);
  });

  it("excludes transactions after asOfDate", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Past" },
      { id: "t2", accountId: "a1", amount: 500, date: "2024-06-15", description: "Today" },
      { id: "t3", accountId: "a1", amount: 200, date: "2024-12-01", description: "Future" },
    ];

    expect(computeBalance("a1", transactions, "2024-06-15")).toBe(1500);
  });

  it("includes transactions on asOfDate boundary", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2024-06-15", description: "Boundary" },
    ];

    expect(computeBalance("a1", transactions, "2024-06-15")).toBe(1000);
  });

  it("returns 0 when all transactions are after asOfDate", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2099-01-01", description: "Future" },
    ];

    expect(computeBalance("a1", transactions, "2024-06-15")).toBe(0);
  });
});
