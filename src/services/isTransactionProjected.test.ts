import { describe, expect, it } from "vitest";
import { isTransactionProjected } from "./isTransactionProjected";
import type { Transaction } from "@/models/Transaction";

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
  it("returns false for a past date", () => {
    expect(isTransactionProjected(makeTx({ date: "2024-06-10" }), TODAY)).toBe(false);
  });

  it("returns false for today's date", () => {
    expect(isTransactionProjected(makeTx({ date: "2024-06-15" }), TODAY)).toBe(false);
  });

  it("returns true for a future date", () => {
    expect(isTransactionProjected(makeTx({ date: "2024-06-16" }), TODAY)).toBe(true);
  });

  it("returns true when isProjected flag is true", () => {
    expect(
      isTransactionProjected(makeTx({ date: "2024-06-10", isProjected: true }), TODAY)
    ).toBe(true);
  });

  it("returns true when date is future even if isProjected is false", () => {
    expect(
      isTransactionProjected(makeTx({ date: "2024-06-20", isProjected: false }), TODAY)
    ).toBe(true);
  });

  it("defaults today to current date when not provided", () => {
    const farFuture = makeTx({ date: "2099-01-01" });
    expect(isTransactionProjected(farFuture)).toBe(true);

    const farPast = makeTx({ date: "2000-01-01" });
    expect(isTransactionProjected(farPast)).toBe(false);
  });
});
