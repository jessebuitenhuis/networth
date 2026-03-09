import { beforeEach, describe, expect, it } from "vitest";

import { recurringTransactions } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = await createTestDb();

const { recurringTransactionRepo } = await import("./recurringTransactionRepository");

beforeEach(async () => {
  await testDb.delete(recurringTransactions);
});

describe("getAllRecurringTransactions", () => {
  it("returns empty array when none exist", async () => {
    expect(await recurringTransactionRepo.getAll()).toEqual([]);
  });

  it("returns all recurring transactions when populated", async () => {
    await testDb
      .insert(recurringTransactions)
      .values([
        { id: "rt-1", accountId: "acc-1", amount: 3000, description: "Salary", frequency: "Monthly", startDate: "2025-01-01"},
        { id: "rt-2", accountId: "acc-1", amount: -1200, description: "Rent", frequency: "Monthly", startDate: "2025-01-01"},
      ]);

    expect(await recurringTransactionRepo.getAll()).toHaveLength(2);
  });
});

describe("getRecurringTransactionById", () => {
  it("returns the matching recurring transaction", async () => {
    await testDb
      .insert(recurringTransactions)
      .values({ id: "rt-1", accountId: "acc-1", amount: 3000, description: "Salary", frequency: "Monthly", startDate: "2025-01-01"});

    const result = await recurringTransactionRepo.getById("rt-1");
    expect(result).toEqual(expect.objectContaining({ id: "rt-1", description: "Salary" }));
  });

  it("returns undefined for non-existent id", async () => {
    expect(await recurringTransactionRepo.getById("non-existent")).toBeUndefined();
  });
});

describe("createRecurringTransaction", () => {
  it("inserts and returns the created recurring transaction with all fields", async () => {
    const result = await recurringTransactionRepo.createRecurringTransaction({
      id: "rt-1",
      accountId: "acc-1",
      amount: 3000,
      description: "Salary",
      frequency: "Monthly",
      startDate: "2025-01-01",
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: "rt-1",
        accountId: "acc-1",
        amount: 3000,
        description: "Salary",
        frequency: "Monthly",
        startDate: "2025-01-01",
        endDate: null,
        scenarioId: null,
      }),
    );
  });

  it("stores optional endDate and scenarioId when provided", async () => {
    const result = await recurringTransactionRepo.createRecurringTransaction({
      id: "rt-1",
      accountId: "acc-1",
      amount: 500,
      description: "Bonus",
      frequency: "Yearly",
      startDate: "2025-01-01",
      endDate: "2027-01-01",
      scenarioId: "s-1",
    });

    expect(result.endDate).toBe("2027-01-01");
    expect(result.scenarioId).toBe("s-1");
  });
});

describe("updateRecurringTransaction", () => {
  it("modifies and returns the updated recurring transaction", async () => {
    await testDb
      .insert(recurringTransactions)
      .values({ id: "rt-1", accountId: "acc-1", amount: 3000, description: "Salary", frequency: "Monthly", startDate: "2025-01-01"});

    const result = await recurringTransactionRepo.updateRecurringTransaction("rt-1", {
      accountId: "acc-1",
      amount: 3500,
      description: "Salary (raise)",
      frequency: "Monthly",
      startDate: "2025-01-01",
    });

    expect(result.amount).toBe(3500);
    expect(result.description).toBe("Salary (raise)");
  });
});

describe("deleteRecurringTransaction", () => {
  it("removes the recurring transaction", async () => {
    await testDb
      .insert(recurringTransactions)
      .values({ id: "rt-1", accountId: "acc-1", amount: 3000, description: "Salary", frequency: "Monthly", startDate: "2025-01-01"});

    await recurringTransactionRepo.delete("rt-1");
    expect(await recurringTransactionRepo.getAll()).toHaveLength(0);
  });
});

describe("deleteRecurringTransactionsByScenarioId", () => {
  it("deletes only matching recurring transactions, leaves others", async () => {
    await testDb
      .insert(recurringTransactions)
      .values([
        { id: "rt-1", accountId: "acc-1", amount: 100, description: "Base", frequency: "Monthly", startDate: "2025-01-01"},
        { id: "rt-2", accountId: "acc-1", amount: 200, description: "Scenario", frequency: "Monthly", startDate: "2025-01-01", scenarioId: "s-1"},
      ]);

    await recurringTransactionRepo.deleteByScenarioId("s-1");

    const remaining = await recurringTransactionRepo.getAll();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe("rt-1");
  });
});
