import { beforeEach, describe, expect, it } from "vitest";

import { transactions } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = await createTestDb();

const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  createTransactions,
  updateTransaction,
  deleteTransaction,
  deleteTransactionsByAccountId,
  deleteTransactionsByScenarioId,
} = await import("./transactionRepository");

beforeEach(async () => {
  await testDb.delete(transactions);
});

describe("getAllTransactions", () => {
  it("returns empty array when no transactions exist", async () => {
    expect(await getAllTransactions()).toEqual([]);
  });

  it("returns all transactions when populated", async () => {
    await testDb
      .insert(transactions)
      .values([
        { id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Deposit"},
        { id: "t-2", accountId: "acc-1", amount: -50, date: "2025-01-15", description: "Withdrawal"},
      ]);

    expect(await getAllTransactions()).toHaveLength(2);
  });
});

describe("getTransactionById", () => {
  it("returns the matching transaction", async () => {
    await testDb
      .insert(transactions)
      .values({ id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Deposit"});

    const result = await getTransactionById("t-1");
    expect(result).toEqual(expect.objectContaining({ id: "t-1", amount: 100 }));
  });

  it("returns undefined for non-existent id", async () => {
    expect(await getTransactionById("non-existent")).toBeUndefined();
  });
});

describe("createTransaction", () => {
  it("inserts and returns the created transaction with all fields normalized", async () => {
    const result = await createTransaction({
      id: "t-1",
      accountId: "acc-1",
      amount: 100,
      date: "2025-01-01",
      description: "Deposit",
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: "t-1",
        accountId: "acc-1",
        amount: 100,
        date: "2025-01-01",
        description: "Deposit",
        isProjected: null,
        scenarioId: null,
      }),
    );
  });

  it("stores isProjected and scenarioId when provided", async () => {
    const result = await createTransaction({
      id: "t-1",
      accountId: "acc-1",
      amount: 100,
      date: "2025-01-01",
      description: "Projected",
      isProjected: true,
      scenarioId: "s-1",
    });

    expect(result.isProjected).toBe(true);
    expect(result.scenarioId).toBe("s-1");
  });
});

describe("createTransactions", () => {
  it("inserts multiple transactions and returns them", async () => {
    const result = await createTransactions([
      { id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "A" },
      { id: "t-2", accountId: "acc-1", amount: 200, date: "2025-01-02", description: "B" },
    ]);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(expect.arrayContaining(["t-1", "t-2"]));
  });
});

describe("updateTransaction", () => {
  it("modifies and returns the updated transaction", async () => {
    await testDb
      .insert(transactions)
      .values({ id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Original"});

    const result = await updateTransaction("t-1", {
      accountId: "acc-1",
      amount: 250,
      date: "2025-01-01",
      description: "Updated",
    });

    expect(result.amount).toBe(250);
    expect(result.description).toBe("Updated");
  });
});

describe("deleteTransaction", () => {
  it("removes the transaction", async () => {
    await testDb
      .insert(transactions)
      .values({ id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "To delete"});

    await deleteTransaction("t-1");
    expect(await getAllTransactions()).toHaveLength(0);
  });
});

describe("deleteTransactionsByAccountId", () => {
  it("deletes only matching transactions, leaves others", async () => {
    await testDb
      .insert(transactions)
      .values([
        { id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "A"},
        { id: "t-2", accountId: "acc-2", amount: 200, date: "2025-01-02", description: "B"},
      ]);

    await deleteTransactionsByAccountId("acc-1");

    const remaining = await getAllTransactions();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe("t-2");
  });
});

describe("deleteTransactionsByScenarioId", () => {
  it("deletes only matching transactions, leaves others", async () => {
    await testDb
      .insert(transactions)
      .values([
        { id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Base"},
        { id: "t-2", accountId: "acc-1", amount: 200, date: "2025-01-02", description: "Scenario", scenarioId: "s-1"},
      ]);

    await deleteTransactionsByScenarioId("s-1");

    const remaining = await getAllTransactions();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe("t-1");
  });
});
