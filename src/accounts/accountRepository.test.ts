import { beforeEach, describe, expect, it, vi } from "vitest";

import { accounts } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();
vi.mock("@/db/connection", () => ({ db: testDb }));

const { getAllAccounts, getAccountById, createAccount, updateAccount, deleteAccount } =
  await import("./accountRepository");

beforeEach(() => {
  testDb.delete(accounts).run();
});

describe("getAllAccounts", () => {
  it("returns empty array when no accounts exist", () => {
    expect(getAllAccounts("test-user")).toEqual([]);
  });

  it("returns all accounts when populated", () => {
    testDb
      .insert(accounts)
      .values([
        { id: "1", name: "Checking", type: "Asset", userId: "test-user" },
        { id: "2", name: "Mortgage", type: "Liability", userId: "test-user" },
      ])
      .run();

    const result = getAllAccounts("test-user");
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "1", name: "Checking", type: "Asset" }),
        expect.objectContaining({ id: "2", name: "Mortgage", type: "Liability" }),
      ]),
    );
  });
});

describe("getAccountById", () => {
  it("returns the matching account", () => {
    testDb.insert(accounts).values({ id: "1", name: "Checking", type: "Asset", userId: "test-user" }).run();

    const result = getAccountById("test-user", "1");
    expect(result).toEqual(expect.objectContaining({ id: "1", name: "Checking" }));
  });

  it("returns undefined for non-existent id", () => {
    expect(getAccountById("test-user", "non-existent")).toBeUndefined();
  });
});

describe("createAccount", () => {
  it("inserts and returns the created account with all fields", () => {
    const result = createAccount("test-user", { id: "1", name: "Savings", type: "Asset" });
    expect(result).toEqual(
      expect.objectContaining({
        id: "1",
        name: "Savings",
        type: "Asset",
        expectedReturnRate: null,
      }),
    );
  });

  it("stores expectedReturnRate when provided", () => {
    const result = createAccount("test-user", { id: "1", name: "Stocks", type: "Asset", expectedReturnRate: 0.07 });
    expect(result.expectedReturnRate).toBe(0.07);
  });
});

describe("updateAccount", () => {
  it("modifies and returns the updated account", () => {
    testDb.insert(accounts).values({ id: "1", name: "Checking", type: "Asset", userId: "test-user" }).run();

    const result = updateAccount("test-user", "1", { name: "Updated Checking", type: "Asset" });
    expect(result.name).toBe("Updated Checking");
  });

  it("updates expectedReturnRate", () => {
    testDb.insert(accounts).values({ id: "1", name: "Stocks", type: "Asset", userId: "test-user" }).run();

    const result = updateAccount("test-user", "1", { name: "Stocks", type: "Asset", expectedReturnRate: 0.1 });
    expect(result.expectedReturnRate).toBe(0.1);
  });
});

describe("deleteAccount", () => {
  it("removes the account", () => {
    testDb.insert(accounts).values({ id: "1", name: "Checking", type: "Asset", userId: "test-user" }).run();

    deleteAccount("test-user", "1");
    expect(getAllAccounts("test-user")).toHaveLength(0);
  });
});

describe("cross-user isolation", () => {
  it("getAllAccounts does not return other user's accounts", () => {
    testDb
      .insert(accounts)
      .values([
        { id: "1", name: "My Account", type: "Asset", userId: "test-user" },
        { id: "2", name: "Other Account", type: "Asset", userId: "other-user" },
      ])
      .run();

    const result = getAllAccounts("test-user");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("getAccountById returns undefined for other user's account", () => {
    testDb.insert(accounts).values({ id: "1", name: "Other", type: "Asset", userId: "other-user" }).run();

    expect(getAccountById("test-user", "1")).toBeUndefined();
  });

  it("updateAccount does not modify other user's account", () => {
    testDb.insert(accounts).values({ id: "1", name: "Original", type: "Asset", userId: "other-user" }).run();

    updateAccount("test-user", "1", { name: "Hacked", type: "Asset" });

    const allRows = testDb.select().from(accounts).all();
    expect(allRows.find((r) => r.id === "1")?.name).toBe("Original");
  });

  it("deleteAccount does not delete other user's account", () => {
    testDb.insert(accounts).values({ id: "1", name: "Other", type: "Asset", userId: "other-user" }).run();

    deleteAccount("test-user", "1");

    const allRows = testDb.select().from(accounts).all();
    expect(allRows.find((r) => r.id === "1")).toBeDefined();
  });
});
