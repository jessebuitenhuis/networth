import { describe, expect, it } from "vitest";

import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";

import { createProjectedTransaction } from "./createProjectedTransaction";

describe("createProjectedTransaction", () => {
  const recurring: RecurringTransaction = {
    id: "rt-1",
    accountId: "acc-1",
    amount: 500,
    description: "Monthly salary",
    frequency: RecurrenceFrequency.Monthly,
    startDate: "2026-01-15",
  };

  it("builds a transaction with composite id", () => {
    const tx = createProjectedTransaction(recurring, "2026-03-15");

    expect(tx).toEqual({
      id: "rt-1-2026-03-15",
      accountId: "acc-1",
      amount: 500,
      date: "2026-03-15",
      description: "Monthly salary",
      isProjected: true,
    });
  });

  it("marks the transaction as projected", () => {
    const tx = createProjectedTransaction(recurring, "2026-06-15");
    expect(tx.isProjected).toBe(true);
  });
});
