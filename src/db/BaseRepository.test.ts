import { beforeEach, describe, expect, it } from "vitest";

import { accounts } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = await createTestDb();

const { BaseRepository } = await import("./BaseRepository");

const repo = new BaseRepository(accounts, accounts.id);

beforeEach(async () => {
  await testDb.delete(accounts);
});

describe("getAll", () => {
  it("returns empty array when no rows exist", async () => {
    expect(await repo.getAll()).toEqual([]);
  });

  it("returns all rows when populated", async () => {
    await testDb.insert(accounts).values([
      { id: "1", name: "Checking", type: "Asset" },
      { id: "2", name: "Mortgage", type: "Liability" },
    ]);

    const result = await repo.getAll();
    expect(result).toHaveLength(2);
  });
});

describe("getById", () => {
  it("returns the matching row", async () => {
    await testDb.insert(accounts).values({ id: "1", name: "Checking", type: "Asset" });

    const result = await repo.getById("1");
    expect(result).toEqual(expect.objectContaining({ id: "1", name: "Checking" }));
  });

  it("returns undefined for non-existent id", async () => {
    expect(await repo.getById("non-existent")).toBeUndefined();
  });
});

describe("create", () => {
  it("inserts and returns the created row", async () => {
    const result = await repo.create({ id: "1", name: "Savings", type: "Asset" });
    expect(result).toEqual(
      expect.objectContaining({ id: "1", name: "Savings", type: "Asset" }),
    );
  });
});

describe("update", () => {
  it("modifies and returns the updated row", async () => {
    await testDb.insert(accounts).values({ id: "1", name: "Checking", type: "Asset" });

    const result = await repo.update("1", { name: "Updated Checking" });
    expect(result).toEqual(expect.objectContaining({ id: "1", name: "Updated Checking" }));
  });
});

describe("delete", () => {
  it("removes the row", async () => {
    await testDb.insert(accounts).values({ id: "1", name: "Checking", type: "Asset" });

    await repo.delete("1");
    expect(await repo.getAll()).toHaveLength(0);
  });
});
