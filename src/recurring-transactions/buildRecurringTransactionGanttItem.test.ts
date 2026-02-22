import { describe, expect, it } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import type { Category } from "@/categories/Category.type";
import type { Scenario } from "@/scenarios/Scenario.type";

import { buildRecurringTransactionGanttItem } from "./buildRecurringTransactionGanttItem";
import { RecurrenceFrequency } from "./RecurrenceFrequency";
import type { RecurringTransaction } from "./RecurringTransaction.type";

const categories: Category[] = [
  { id: "cat-income", name: "Income" },
];

const accounts: Account[] = [
  { id: "acc-1", name: "Checking", type: AccountType.Asset },
];

const scenarios: Scenario[] = [{ id: "scen-1", name: "Optimistic" }];

function makeRt(overrides: Partial<RecurringTransaction> = {}): RecurringTransaction {
  return {
    id: "rt-1",
    accountId: "acc-1",
    amount: -500,
    description: "Test",
    frequency: RecurrenceFrequency.Monthly,
    startDate: "2020-01-01",
    ...overrides,
  };
}

describe("buildRecurringTransactionGanttItem", () => {
  it("sets color to green for positive amounts", () => {
    const item = buildRecurringTransactionGanttItem(
      makeRt({ amount: 1000 }),
      categories,
      accounts,
      scenarios,
    );

    expect(item.color).toBe("green");
  });

  it("sets color to red for negative amounts", () => {
    const item = buildRecurringTransactionGanttItem(
      makeRt({ amount: -500 }),
      categories,
      accounts,
      scenarios,
    );

    expect(item.color).toBe("red");
  });

  it("sets dashed to false for baseline items", () => {
    const item = buildRecurringTransactionGanttItem(
      makeRt(),
      categories,
      accounts,
      scenarios,
    );

    expect(item.dashed).toBe(false);
  });

  it("sets dashed to true for scenario items", () => {
    const item = buildRecurringTransactionGanttItem(
      makeRt({ scenarioId: "scen-1" }),
      categories,
      accounts,
      scenarios,
    );

    expect(item.dashed).toBe(true);
  });

  it("sets endDate to null for ongoing items", () => {
    const item = buildRecurringTransactionGanttItem(
      makeRt(),
      categories,
      accounts,
      scenarios,
    );

    expect(item.endDate).toBeNull();
  });

  it("preserves endDate when provided", () => {
    const item = buildRecurringTransactionGanttItem(
      makeRt({ endDate: "2025-12-31" }),
      categories,
      accounts,
      scenarios,
    );

    expect(item.endDate).toBe("2025-12-31");
  });

  it("includes description and frequency in the label", () => {
    const item = buildRecurringTransactionGanttItem(
      makeRt({ description: "Car Payment", frequency: RecurrenceFrequency.Monthly }),
      categories,
      accounts,
      scenarios,
    );

    expect(item.label).toContain("Car Payment");
    expect(item.label).toContain("month");
  });
});
