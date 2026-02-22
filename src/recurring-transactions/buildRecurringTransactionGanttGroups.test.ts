import { describe, expect, it } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import type { Category } from "@/categories/Category.type";
import type { Scenario } from "@/scenarios/Scenario.type";

import { buildRecurringTransactionGanttGroups } from "./buildRecurringTransactionGanttGroups";
import { RecurrenceFrequency } from "./RecurrenceFrequency";
import type { RecurringTransaction } from "./RecurringTransaction.type";

const categories: Category[] = [
  { id: "cat-housing", name: "Housing" },
  { id: "cat-mortgage", name: "Mortgage", parentCategoryId: "cat-housing" },
  { id: "cat-income", name: "Income" },
];

const accounts: Account[] = [
  { id: "acc-1", name: "Checking", type: AccountType.Asset },
];

const scenarios: Scenario[] = [{ id: "scen-1", name: "Optimistic" }];

describe("buildRecurringTransactionGanttGroups", () => {
  it("returns empty array for no recurring transactions", () => {
    const result = buildRecurringTransactionGanttGroups(
      [],
      categories,
      accounts,
      scenarios,
    );
    expect(result).toEqual([]);
  });

  it("groups by root category and sorts alphabetically with Uncategorized last", () => {
    const rts: RecurringTransaction[] = [
      {
        id: "rt-1",
        accountId: "acc-1",
        amount: -1500,
        description: "Mortgage",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2020-01-01",
        endDate: "2045-12-31",
        categoryId: "cat-mortgage",
      },
      {
        id: "rt-2",
        accountId: "acc-1",
        amount: 5000,
        description: "Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2020-01-01",
        categoryId: "cat-income",
      },
      {
        id: "rt-3",
        accountId: "acc-1",
        amount: -100,
        description: "Misc",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2023-06-01",
      },
    ];

    const result = buildRecurringTransactionGanttGroups(
      rts,
      categories,
      accounts,
      scenarios,
    );

    expect(result).toHaveLength(3);
    expect(result[0].label).toBe("Housing");
    expect(result[1].label).toBe("Income");
    expect(result[2].label).toBe("Uncategorized");
  });

  it("sets color to green for positive amounts and red for negative", () => {
    const rts: RecurringTransaction[] = [
      {
        id: "rt-pos",
        accountId: "acc-1",
        amount: 1000,
        description: "Income",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2020-01-01",
        categoryId: "cat-income",
      },
      {
        id: "rt-neg",
        accountId: "acc-1",
        amount: -500,
        description: "Expense",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2020-01-01",
        categoryId: "cat-income",
      },
    ];

    const result = buildRecurringTransactionGanttGroups(
      rts,
      categories,
      accounts,
      scenarios,
    );

    expect(result[0].items[0].color).toBe("green");
    expect(result[0].items[1].color).toBe("red");
  });

  it("sets dashed to true for scenario items", () => {
    const rts: RecurringTransaction[] = [
      {
        id: "rt-baseline",
        accountId: "acc-1",
        amount: -500,
        description: "Baseline",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2020-01-01",
        categoryId: "cat-income",
      },
      {
        id: "rt-scenario",
        accountId: "acc-1",
        amount: -500,
        description: "Scenario",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2020-01-01",
        categoryId: "cat-income",
        scenarioId: "scen-1",
      },
    ];

    const result = buildRecurringTransactionGanttGroups(
      rts,
      categories,
      accounts,
      scenarios,
    );

    expect(result[0].items[0].dashed).toBe(false);
    expect(result[0].items[1].dashed).toBe(true);
  });

  it("sets endDate to null for ongoing items", () => {
    const rts: RecurringTransaction[] = [
      {
        id: "rt-ongoing",
        accountId: "acc-1",
        amount: 5000,
        description: "Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2020-01-01",
        categoryId: "cat-income",
      },
    ];

    const result = buildRecurringTransactionGanttGroups(
      rts,
      categories,
      accounts,
      scenarios,
    );

    expect(result[0].items[0].endDate).toBeNull();
  });

  it("sorts items within groups by startDate", () => {
    const rts: RecurringTransaction[] = [
      {
        id: "rt-later",
        accountId: "acc-1",
        amount: -500,
        description: "Later",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2023-06-01",
        categoryId: "cat-income",
      },
      {
        id: "rt-earlier",
        accountId: "acc-1",
        amount: -500,
        description: "Earlier",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2020-01-01",
        categoryId: "cat-income",
      },
    ];

    const result = buildRecurringTransactionGanttGroups(
      rts,
      categories,
      accounts,
      scenarios,
    );

    expect(result[0].items[0].id).toBe("rt-earlier");
    expect(result[0].items[1].id).toBe("rt-later");
  });

  it("includes frequency in the item label", () => {
    const rts: RecurringTransaction[] = [
      {
        id: "rt-1",
        accountId: "acc-1",
        amount: -350,
        description: "Car Payment",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2020-01-01",
        endDate: "2025-12-31",
        categoryId: "cat-income",
      },
    ];

    const result = buildRecurringTransactionGanttGroups(
      rts,
      categories,
      accounts,
      scenarios,
    );

    expect(result[0].items[0].label).toContain("Car Payment");
    expect(result[0].items[0].label).toContain("month");
  });
});
