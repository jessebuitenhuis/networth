import { describe, expect, it } from "vitest";

import type { Transaction } from "@/transactions/Transaction.type";

import { isTransactionProjected } from "./isTransactionProjected";

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "t1",
    accountId: "a1",
    amount: 100,
    date: "2024-06-10",
    description: "Test",
    ...overrides,
  };
}

const TODAY = "2024-06-15";

describe("isTransactionProjected", () => {
  it.each([
    { overrides: { date: "2024-06-10" }, expected: false, desc: "past date" },
    { overrides: { date: "2024-06-15" }, expected: false, desc: "today's date" },
    { overrides: { date: "2024-06-16" }, expected: true, desc: "future date" },
    { overrides: { date: "2024-06-10", isProjected: true } as Partial<Transaction>, expected: true, desc: "isProjected flag true" },
    { overrides: { date: "2024-06-20", isProjected: false } as Partial<Transaction>, expected: true, desc: "future with isProjected false" },
  ])("returns $expected for $desc", ({ overrides, expected }) => {
    expect(isTransactionProjected(makeTx(overrides), TODAY)).toBe(expected);
  });

  it("defaults today to current date when not provided", () => {
    const farFuture = makeTx({ date: "2099-01-01" });
    expect(isTransactionProjected(farFuture)).toBe(true);

    const farPast = makeTx({ date: "2000-01-01" });
    expect(isTransactionProjected(farPast)).toBe(false);
  });
});
