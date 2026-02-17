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
    expect(getAllAccounts()).toEqual([]);
  });

  it("returns all accounts when populated", () => {
    testDb
      .insert(accounts)
      .values([
        { id: "1", name: "Checking", type: "Asset" },
        { id: "2", name: "Mortgage", type: "Liability" },
      ])
      .run();

    const result = getAllAccounts();
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
    testDb.insert(accounts).values({ id: "1", name: "Checking", type: "Asset" }).run();

    const result = getAccountById("1");
    expect(result).toEqual(expect.objectContaining({ id: "1", name: "Checking" }));
  });

  it("returns undefined for non-existent id", () => {
    expect(getAccountById("non-existent")).toBeUndefined();
  });
});

describe("createAccount", () => {
  it("inserts and returns the created account with all fields", () => {
    const result = createAccount({ id: "1", name: "Savings", type: "Asset" });
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
    const result = createAccount({ id: "1", name: "Stocks", type: "Asset", expectedReturnRate: 0.07 });
    expect(result.expectedReturnRate).toBe(0.07);
  });
});

describe("updateAccount", () => {
  it("modifies and returns the updated account", () => {
    testDb.insert(accounts).values({ id: "1", name: "Checking", type: "Asset" }).run();

    const result = updateAccount("1", { name: "Updated Checking", type: "Asset" });
    expect(result.name).toBe("Updated Checking");
  });

  it("updates expectedReturnRate", () => {
    testDb.insert(accounts).values({ id: "1", name: "Stocks", type: "Asset" }).run();

    const result = updateAccount("1", { name: "Stocks", type: "Asset", expectedReturnRate: 0.1 });
    expect(result.expectedReturnRate).toBe(0.1);
  });
});

describe("deleteAccount", () => {
  it("removes the account", () => {
    testDb.insert(accounts).values({ id: "1", name: "Checking", type: "Asset" }).run();

    deleteAccount("1");
    expect(getAllAccounts()).toHaveLength(0);
  });
});
