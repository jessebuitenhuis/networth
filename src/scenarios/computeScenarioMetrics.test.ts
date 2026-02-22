import { describe, expect, it } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import type { Goal } from "@/goals/Goal.type";
import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Transaction } from "@/transactions/Transaction.type";

import { computeScenarioMetrics } from "./computeScenarioMetrics";

const TODAY = "2024-06-15";

function makeAccount(
  id: string,
  type: AccountType,
  expectedReturnRate?: number
): Account {
  return { id, name: `Account ${id}`, type, expectedReturnRate };
}

function makeTx(
  accountId: string,
  amount: number,
  date: string
): Transaction {
  return { id: `t-${accountId}-${date}-${amount}`, accountId, amount, date, description: "" };
}

function makeGoal(id: string, name: string, targetAmount: number): Goal {
  return { id, name, targetAmount };
}

describe("computeScenarioMetrics", () => {
  it("returns baseline metrics with no transactions", () => {
    const accounts = [makeAccount("a1", AccountType.Asset)];
    const result = computeScenarioMetrics(
      null, "Baseline", accounts, [], [], [], TODAY
    );

    expect(result.scenarioId).toBeNull();
    expect(result.scenarioName).toBe("Baseline");
    expect(result.projectedNetWorth1yr).toBe(0);
    expect(result.projectedNetWorth5yr).toBe(0);
    expect(result.projectedNetWorth10yr).toBe(0);
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.goalAchievements).toEqual([]);
  });

  it("computes projected net worth from past transactions", () => {
    const accounts = [makeAccount("a1", AccountType.Asset)];
    const transactions = [
      makeTx("a1", 10000, "2024-01-01"),
      makeTx("a1", 5000, "2024-03-15"),
    ];

    const result = computeScenarioMetrics(
      null, "Baseline", accounts, transactions, [], [], TODAY
    );

    expect(result.projectedNetWorth1yr).toBe(15000);
    expect(result.projectedNetWorth5yr).toBe(15000);
    expect(result.projectedNetWorth10yr).toBe(15000);
  });

  it("accounts for future manual transactions", () => {
    const accounts = [makeAccount("a1", AccountType.Asset)];
    const transactions = [
      makeTx("a1", 10000, "2024-01-01"),
      makeTx("a1", 5000, "2025-01-01"),
    ];

    const result = computeScenarioMetrics(
      null, "Baseline", accounts, transactions, [], [], TODAY
    );

    expect(result.projectedNetWorth1yr).toBe(15000);
    expect(result.projectedNetWorth5yr).toBe(15000);
    expect(result.projectedNetWorth10yr).toBe(15000);
  });

  it("handles liabilities correctly", () => {
    const accounts = [
      makeAccount("a1", AccountType.Asset),
      makeAccount("l1", AccountType.Liability),
    ];
    const transactions = [
      makeTx("a1", 50000, "2024-01-01"),
      makeTx("l1", 20000, "2024-01-01"),
    ];

    const result = computeScenarioMetrics(
      null, "Baseline", accounts, transactions, [], [], TODAY
    );

    expect(result.projectedNetWorth1yr).toBe(30000);
  });

  it("computes income and expenses from future transactions", () => {
    const accounts = [makeAccount("a1", AccountType.Asset)];
    const transactions = [
      makeTx("a1", 10000, "2024-01-01"),
      makeTx("a1", 5000, "2025-01-01"),
      makeTx("a1", -2000, "2025-06-01"),
    ];

    const result = computeScenarioMetrics(
      null, "Baseline", accounts, transactions, [], [], TODAY
    );

    expect(result.totalIncome).toBe(5000);
    expect(result.totalExpenses).toBe(2000);
  });

  it("computes income and expenses from recurring transactions", () => {
    const accounts = [makeAccount("a1", AccountType.Asset)];
    const recurring: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "a1",
        amount: 1000,
        description: "Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
      },
    ];

    const result = computeScenarioMetrics(
      null, "Baseline", accounts, [], recurring, [], TODAY
    );

    expect(result.totalIncome).toBeGreaterThan(0);
    expect(result.totalExpenses).toBe(0);
  });

  it("computes goal achievement dates", () => {
    const accounts = [makeAccount("a1", AccountType.Asset)];
    const transactions = [makeTx("a1", 10000, "2024-01-01")];
    const recurring: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "a1",
        amount: 1000,
        description: "Monthly saving",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
      },
    ];
    const goals = [makeGoal("g1", "First Goal", 50000)];

    const result = computeScenarioMetrics(
      null, "Baseline", accounts, transactions, recurring, goals, TODAY
    );

    expect(result.goalAchievements).toHaveLength(1);
    expect(result.goalAchievements[0].goalId).toBe("g1");
    expect(result.goalAchievements[0].achievementDate).not.toBeNull();
  });

  it("returns null achievement date for unreachable goals", () => {
    const accounts = [makeAccount("a1", AccountType.Asset)];
    const transactions = [makeTx("a1", 100, "2024-01-01")];
    const goals = [makeGoal("g1", "Huge Goal", 10000000)];

    const result = computeScenarioMetrics(
      null, "Baseline", accounts, transactions, [], goals, TODAY
    );

    expect(result.goalAchievements[0].achievementDate).toBeNull();
  });

  it("returns null achievement date for goals with zero target", () => {
    const accounts = [makeAccount("a1", AccountType.Asset)];
    const goals = [makeGoal("g1", "Zero Goal", 0)];

    const result = computeScenarioMetrics(
      null, "Baseline", accounts, [], [], goals, TODAY
    );

    expect(result.goalAchievements[0].achievementDate).toBeNull();
  });

  it("includes compound growth for accounts with expectedReturnRate", () => {
    const accounts = [makeAccount("a1", AccountType.Asset, 10)];
    const transactions = [makeTx("a1", 10000, "2024-01-01")];

    const result = computeScenarioMetrics(
      null, "Baseline", accounts, transactions, [], [], TODAY
    );

    expect(result.projectedNetWorth1yr).toBeGreaterThan(10000);
    expect(result.projectedNetWorth10yr).toBeGreaterThan(result.projectedNetWorth5yr);
    expect(result.projectedNetWorth5yr).toBeGreaterThan(result.projectedNetWorth1yr);
  });

  it("sets scenarioId and name for scenario metrics", () => {
    const result = computeScenarioMetrics(
      "s1", "My Scenario", [], [], [], [], TODAY
    );

    expect(result.scenarioId).toBe("s1");
    expect(result.scenarioName).toBe("My Scenario");
  });

  it("classifies liability payments as expenses", () => {
    const accounts = [makeAccount("l1", AccountType.Liability)];
    const transactions = [
      makeTx("l1", 10000, "2024-01-01"),
      makeTx("l1", 500, "2025-01-01"),
    ];

    const result = computeScenarioMetrics(
      null, "Baseline", accounts, transactions, [], [], TODAY
    );

    // Positive amount on liability = debt increase = expense
    // Negative amount on liability = debt paydown = income
    expect(result.totalExpenses).toBe(500);
    expect(result.totalIncome).toBe(0);
  });
});
