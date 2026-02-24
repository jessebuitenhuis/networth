import { describe, expect, it } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import type { Category } from "@/categories/Category.type";
import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import type { Transaction } from "@/transactions/Transaction.type";

import { buildAllDisplayTransactions } from "./buildAllDisplayTransactions";

const accounts: Account[] = [
  { id: "a1", name: "Checking", type: AccountType.Asset },
  { id: "a2", name: "Savings", type: AccountType.Asset },
  { id: "a3", name: "Mortgage", type: AccountType.Liability },
];

const scenarios: Scenario[] = [{ id: "s1", name: "Optimistic" }];

const categories: Category[] = [
  { id: "c1", name: "Groceries" },
  { id: "c2", name: "Food", parentCategoryId: undefined },
  { id: "c3", name: "Dining", parentCategoryId: "c2" },
];

describe("buildAllDisplayTransactions", () => {
  it("returns empty array when no transactions exist", () => {
    const result = buildAllDisplayTransactions(
      [],
      [],
      accounts,
      null,
      scenarios,
      categories,
      "2026-01-15"
    );
    expect(result).toEqual([]);
  });

  it("maps transactions across multiple accounts", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 500, date: "2024-01-10", description: "Paycheck" },
      { id: "t2", accountId: "a2", amount: 1000, date: "2024-01-11", description: "Transfer" },
      { id: "t3", accountId: "a3", amount: -200, date: "2024-01-12", description: "Payment" },
    ];

    const result = buildAllDisplayTransactions(
      transactions,
      [],
      accounts,
      null,
      scenarios,
      categories,
      "2026-01-15"
    );

    expect(result).toHaveLength(3);
    expect(result.map((r) => r.accountName)).toContain("Checking");
    expect(result.map((r) => r.accountName)).toContain("Savings");
    expect(result.map((r) => r.accountName)).toContain("Mortgage");
  });

  it("includes accountId on each item", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 500, date: "2024-01-10", description: "Paycheck" },
    ];

    const result = buildAllDisplayTransactions(
      transactions,
      [],
      accounts,
      null,
      [],
      [],
      "2026-01-15"
    );

    expect(result[0].accountId).toBe("a1");
  });

  it("resolves category paths", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 50, date: "2024-01-10", description: "Lunch", categoryId: "c3" },
    ];

    const result = buildAllDisplayTransactions(
      transactions,
      [],
      accounts,
      null,
      [],
      categories,
      "2026-01-15"
    );

    expect(result[0].categoryName).toBe("Food > Dining");
  });

  it("filters by active scenario", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 100, date: "2024-01-10", description: "Baseline" },
      { id: "t2", accountId: "a1", amount: 200, date: "2024-01-11", description: "In scenario", scenarioId: "s1" },
      { id: "t3", accountId: "a1", amount: 300, date: "2024-01-12", description: "Other scenario", scenarioId: "s2" },
    ];

    const result = buildAllDisplayTransactions(
      transactions,
      [],
      accounts,
      "s1",
      scenarios,
      categories,
      "2026-01-15"
    );

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.description)).toContain("Baseline");
    expect(result.map((r) => r.description)).toContain("In scenario");
  });

  it("includes recurring transactions from all accounts", () => {
    const recurring: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "a1",
        amount: 5000,
        description: "Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-15",
      },
      {
        id: "r2",
        accountId: "a2",
        amount: 100,
        description: "Interest",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
      },
    ];

    const result = buildAllDisplayTransactions(
      [],
      recurring,
      accounts,
      null,
      [],
      [],
      "2026-01-15"
    );

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.description)).toContain("Salary");
    expect(result.map((r) => r.description)).toContain("Interest");
  });

  it("sorts by date newest first", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 100, date: "2024-01-05", description: "Old" },
      { id: "t2", accountId: "a2", amount: 200, date: "2024-01-20", description: "New" },
      { id: "t3", accountId: "a1", amount: 300, date: "2024-01-10", description: "Middle" },
    ];

    const result = buildAllDisplayTransactions(
      transactions,
      [],
      accounts,
      null,
      [],
      [],
      "2026-01-15"
    );

    expect(result[0].description).toBe("New");
    expect(result[1].description).toBe("Middle");
    expect(result[2].description).toBe("Old");
  });

  it("skips transactions for unknown accounts", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "unknown", amount: 100, date: "2024-01-10", description: "Orphan" },
      { id: "t2", accountId: "a1", amount: 200, date: "2024-01-11", description: "Valid" },
    ];

    const result = buildAllDisplayTransactions(
      transactions,
      [],
      accounts,
      null,
      [],
      [],
      "2026-01-15"
    );

    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("Valid");
  });

  it("includes scenarioName for scenario transactions", () => {
    const transactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 200, date: "2024-01-10", description: "Scenario tx", scenarioId: "s1" },
    ];

    const result = buildAllDisplayTransactions(
      transactions,
      [],
      accounts,
      "s1",
      scenarios,
      [],
      "2026-01-15"
    );

    expect(result[0].scenarioName).toBe("Optimistic");
  });
});
