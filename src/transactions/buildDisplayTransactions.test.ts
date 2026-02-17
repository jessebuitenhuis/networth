import { describe, expect, it } from "vitest";

import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import type { Transaction } from "@/transactions/Transaction.type";

import { buildDisplayTransactions } from "./buildDisplayTransactions";

const scenarios: Scenario[] = [{ id: "s1", name: "Optimistic" }];

describe("buildDisplayTransactions", () => {
  it("returns empty array when no transactions match the account", () => {
    const result = buildDisplayTransactions(
      [],
      [],
      "acc-1",
      "Checking",
      null,
      scenarios,
      "2026-01-15"
    );

    expect(result).toEqual([]);
  });

  it("maps regular transactions to display items", () => {
    const transactions: Transaction[] = [
      {
        id: "t1",
        accountId: "acc-1",
        amount: 1000,
        date: "2024-01-15",
        description: "Salary",
      },
    ];

    const result = buildDisplayTransactions(
      transactions,
      [],
      "acc-1",
      "Checking",
      null,
      [],
      "2026-01-15"
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "t1",
      description: "Salary",
      accountName: "Checking",
      date: "2024-01-15",
      amount: 1000,
      isRecurring: false,
    });
  });

  it("filters by accountId", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "acc-1", amount: 100, date: "2024-01-15", description: "Match" },
      { id: "t2", accountId: "acc-2", amount: 200, date: "2024-01-16", description: "Other" },
    ];

    const result = buildDisplayTransactions(
      transactions,
      [],
      "acc-1",
      "Checking",
      null,
      [],
      "2026-01-15"
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("t1");
  });

  it("sorts by date newest first", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "acc-1", amount: 100, date: "2024-01-10", description: "Old" },
      { id: "t2", accountId: "acc-1", amount: 200, date: "2024-01-20", description: "New" },
    ];

    const result = buildDisplayTransactions(
      transactions,
      [],
      "acc-1",
      "Checking",
      null,
      [],
      "2026-01-15"
    );

    expect(result[0].description).toBe("New");
    expect(result[1].description).toBe("Old");
  });

  it("includes next recurring occurrence", () => {
    const recurring: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "acc-1",
        amount: 5000,
        description: "Monthly Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-15",
      },
    ];

    const result = buildDisplayTransactions(
      [],
      recurring,
      "acc-1",
      "Checking",
      null,
      [],
      "2026-01-15"
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      description: "Monthly Salary",
      isRecurring: true,
      isProjected: true,
    });
  });

  it("excludes ended recurring transactions", () => {
    const recurring: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "acc-1",
        amount: 5000,
        description: "Expired",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2020-01-15",
        endDate: "2020-06-01",
      },
    ];

    const result = buildDisplayTransactions(
      [],
      recurring,
      "acc-1",
      "Checking",
      null,
      [],
      "2026-01-15"
    );

    expect(result).toEqual([]);
  });

  it("filters by scenario when activeScenarioId is set", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "acc-1", amount: 100, date: "2024-01-15", description: "Baseline" },
      { id: "t2", accountId: "acc-1", amount: 200, date: "2024-01-16", description: "In scenario", scenarioId: "s1" },
      { id: "t3", accountId: "acc-1", amount: 300, date: "2024-01-17", description: "Other scenario", scenarioId: "s2" },
    ];

    const result = buildDisplayTransactions(
      transactions,
      [],
      "acc-1",
      "Checking",
      "s1",
      scenarios,
      "2026-01-15"
    );

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.description)).toContain("Baseline");
    expect(result.map((r) => r.description)).toContain("In scenario");
  });

  it("includes scenarioName for scenario transactions", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "acc-1", amount: 200, date: "2024-01-16", description: "Scenario tx", scenarioId: "s1" },
    ];

    const result = buildDisplayTransactions(
      transactions,
      [],
      "acc-1",
      "Checking",
      "s1",
      scenarios,
      "2026-01-15"
    );

    expect(result[0].scenarioName).toBe("Optimistic");
  });

  it("marks future-dated transactions as projected", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "acc-1", amount: 100, date: "2099-01-01", description: "Future" },
    ];

    const result = buildDisplayTransactions(
      transactions,
      [],
      "acc-1",
      "Checking",
      null,
      [],
      "2026-01-15"
    );

    expect(result[0].isProjected).toBe(true);
  });

  it("attaches sourceTransaction for regular items", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "acc-1", amount: 100, date: "2024-01-15", description: "Test" },
    ];

    const result = buildDisplayTransactions(
      transactions,
      [],
      "acc-1",
      "Checking",
      null,
      [],
      "2026-01-15"
    );

    expect(result[0].sourceTransaction).toBeDefined();
    expect(result[0].sourceTransaction!.id).toBe("t1");
  });

  it("attaches sourceRecurringTransaction for recurring items", () => {
    const recurring: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "acc-1",
        amount: 5000,
        description: "Monthly Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-15",
      },
    ];

    const result = buildDisplayTransactions(
      [],
      recurring,
      "acc-1",
      "Checking",
      null,
      [],
      "2026-01-15"
    );

    expect(result[0].sourceRecurringTransaction).toBeDefined();
    expect(result[0].sourceRecurringTransaction!.id).toBe("r1");
  });
});
