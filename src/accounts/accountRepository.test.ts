import { beforeEach, describe, expect, it, vi } from "vitest";

import { accounts } from "@/db/schema";
import { createTestDb, TEST_USER_ID } from "@/test/createTestDb";

const testDb = createTestDb();
vi.mock("@/db/connection", () => ({ globalDb: testDb }));
vi.mock("@/auth/getCurrentUserId", () => ({
  getCurrentUserId: () => Promise.resolve(TEST_USER_ID),
}));

const { getAllAccounts, getAccountById, createAccount, updateAccount, deleteAccount } =
  await import("./accountRepository");

beforeEach(() => {
  testDb.delete(accounts).run();
});

describe("getAllAccounts", () => {
  it("returns empty array when no accounts exist", async () => {
    expect(await getAllAccounts()).toEqual([]);
  });

  it("returns all accounts when populated", async () => {
    testDb
      .insert(accounts)
      .values([
        { id: "1", name: "Checking", type: "Asset", userId: TEST_USER_ID },
        { id: "2", name: "Mortgage", type: "Liability", userId: TEST_USER_ID },
      ])
      .run();

    const result = await getAllAccounts();
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
  it("returns the matching account", async () => {
    testDb.insert(accounts).values({ id: "1", name: "Checking", type: "Asset", userId: TEST_USER_ID }).run();

    const result = await getAccountById("1");
    expect(result).toEqual(expect.objectContaining({ id: "1", name: "Checking" }));
  });

  it("returns undefined for non-existent id", async () => {
    expect(await getAccountById("non-existent")).toBeUndefined();
  });
});

describe("createAccount", () => {
  it("inserts and returns the created account with all fields", async () => {
    const result = await createAccount({ id: "1", name: "Savings", type: "Asset" });
    expect(result).toEqual(
      expect.objectContaining({
        id: "1",
        name: "Savings",
        type: "Asset",
        expectedReturnRate: null,
      }),
    );
  });

  it("stores expectedReturnRate when provided", async () => {
    const result = await createAccount({ id: "1", name: "Stocks", type: "Asset", expectedReturnRate: 0.07 });
    expect(result.expectedReturnRate).toBe(0.07);
  });
});

describe("updateAccount", () => {
  it("modifies and returns the updated account", async () => {
    testDb.insert(accounts).values({ id: "1", name: "Checking", type: "Asset", userId: TEST_USER_ID }).run();

    const result = await updateAccount("1", { name: "Updated Checking", type: "Asset" });
    expect(result.name).toBe("Updated Checking");
  });

  it("updates expectedReturnRate", async () => {
    testDb.insert(accounts).values({ id: "1", name: "Stocks", type: "Asset", userId: TEST_USER_ID }).run();

    const result = await updateAccount("1", { name: "Stocks", type: "Asset", expectedReturnRate: 0.1 });
    expect(result.expectedReturnRate).toBe(0.1);
  });
});

describe("deleteAccount", () => {
  it("removes the account", async () => {
    testDb.insert(accounts).values({ id: "1", name: "Checking", type: "Asset", userId: TEST_USER_ID }).run();

    await deleteAccount("1");
    expect(await getAllAccounts()).toHaveLength(0);
  });
});
