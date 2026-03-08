import { beforeEach, describe, expect, it, vi } from "vitest";

import { transactions } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();
vi.mock("@/db/connection", () => ({ db: testDb }));

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

beforeEach(() => {
  testDb.delete(transactions).run();
});

describe("getAllTransactions", () => {
  it("returns empty array when no transactions exist", () => {
    expect(getAllTransactions("test-user")).toEqual([]);
  });

  it("returns all transactions when populated", () => {
    testDb
      .insert(transactions)
      .values([
        { id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Deposit", userId: "test-user" },
        { id: "t-2", accountId: "acc-1", amount: -50, date: "2025-01-15", description: "Withdrawal", userId: "test-user" },
      ])
      .run();

    expect(getAllTransactions("test-user")).toHaveLength(2);
  });
});

describe("getTransactionById", () => {
  it("returns the matching transaction", () => {
    testDb
      .insert(transactions)
      .values({ id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Deposit", userId: "test-user" })
      .run();

    const result = getTransactionById("test-user", "t-1");
    expect(result).toEqual(expect.objectContaining({ id: "t-1", amount: 100 }));
  });

  it("returns undefined for non-existent id", () => {
    expect(getTransactionById("test-user", "non-existent")).toBeUndefined();
  });
});

describe("createTransaction", () => {
  it("inserts and returns the created transaction with all fields normalized", () => {
    const result = createTransaction("test-user", {
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

  it("stores isProjected and scenarioId when provided", () => {
    const result = createTransaction("test-user", {
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
  it("inserts multiple transactions and returns them", () => {
    const result = createTransactions("test-user", [
      { id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "A" },
      { id: "t-2", accountId: "acc-1", amount: 200, date: "2025-01-02", description: "B" },
    ]);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(expect.arrayContaining(["t-1", "t-2"]));
  });
});

describe("updateTransaction", () => {
  it("modifies and returns the updated transaction", () => {
    testDb
      .insert(transactions)
      .values({ id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Original", userId: "test-user" })
      .run();

    const result = updateTransaction("test-user", "t-1", {
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
  it("removes the transaction", () => {
    testDb
      .insert(transactions)
      .values({ id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "To delete", userId: "test-user" })
      .run();

    deleteTransaction("test-user", "t-1");
    expect(getAllTransactions("test-user")).toHaveLength(0);
  });
});

describe("deleteTransactionsByAccountId", () => {
  it("deletes only matching transactions, leaves others", () => {
    testDb
      .insert(transactions)
      .values([
        { id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "A", userId: "test-user" },
        { id: "t-2", accountId: "acc-2", amount: 200, date: "2025-01-02", description: "B", userId: "test-user" },
      ])
      .run();

    deleteTransactionsByAccountId("test-user", "acc-1");

    const remaining = getAllTransactions("test-user");
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe("t-2");
  });
});

describe("deleteTransactionsByScenarioId", () => {
  it("deletes only matching transactions, leaves others", () => {
    testDb
      .insert(transactions)
      .values([
        { id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Base", userId: "test-user" },
        { id: "t-2", accountId: "acc-1", amount: 200, date: "2025-01-02", description: "Scenario", scenarioId: "s-1", userId: "test-user" },
      ])
      .run();

    deleteTransactionsByScenarioId("test-user", "s-1");

    const remaining = getAllTransactions("test-user");
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe("t-1");
  });
});

describe("cross-user isolation", () => {
  it("getAllTransactions does not return other user's transactions", () => {
    testDb
      .insert(transactions)
      .values([
        { id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Mine", userId: "test-user" },
        { id: "t-2", accountId: "acc-1", amount: 200, date: "2025-01-01", description: "Theirs", userId: "other-user" },
      ])
      .run();

    const result = getAllTransactions("test-user");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("t-1");
  });

  it("getTransactionById returns undefined for other user's transaction", () => {
    testDb
      .insert(transactions)
      .values({ id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Other", userId: "other-user" })
      .run();

    expect(getTransactionById("test-user", "t-1")).toBeUndefined();
  });

  it("updateTransaction does not modify other user's transaction", () => {
    testDb
      .insert(transactions)
      .values({ id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Original", userId: "other-user" })
      .run();

    updateTransaction("test-user", "t-1", { accountId: "acc-1", amount: 999, date: "2025-01-01", description: "Hacked" });

    const allRows = testDb.select().from(transactions).all();
    expect(allRows.find((r) => r.id === "t-1")?.description).toBe("Original");
  });

  it("deleteTransaction does not delete other user's transaction", () => {
    testDb
      .insert(transactions)
      .values({ id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Other", userId: "other-user" })
      .run();

    deleteTransaction("test-user", "t-1");

    const allRows = testDb.select().from(transactions).all();
    expect(allRows.find((r) => r.id === "t-1")).toBeDefined();
  });
});
