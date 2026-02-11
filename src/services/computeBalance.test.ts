import { describe, expect, it } from "vitest";
import { computeBalance } from "./computeBalance";
import type { Transaction } from "@/models/Transaction";

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
});
