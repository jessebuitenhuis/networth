import { beforeEach, describe, expect, it, vi } from "vitest";

import { accounts } from "@/db/schema";
import { createTestDb, TEST_USER_ID } from "@/test/createTestDb";

const { raw: rawDb } = createTestDb();
vi.doMock("@/auth/getCurrentUserId", () => ({ getCurrentUserId: vi.fn() }));

const { getCurrentUserId } = await import("@/auth/getCurrentUserId");
const { getDb } = await import("./userDb");

beforeEach(() => {
  rawDb.delete(accounts).run();
  vi.mocked(getCurrentUserId).mockResolvedValue(TEST_USER_ID);
});

describe("getDb cross-user isolation", () => {
  it("select does not return other user's rows", async () => {
    rawDb
      .insert(accounts)
      .values([
        { id: "1", name: "My Account", type: "Asset", userId: TEST_USER_ID },
        { id: "2", name: "Other Account", type: "Asset", userId: "other-user" },
      ])
      .run();

    const db = await getDb();
    const result = db.select(accounts).all();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("insert tags rows with the current user", async () => {
    const db = await getDb();
    db.insert(accounts, { id: "1", name: "New", type: "Asset" }).run();

    const allRows = rawDb.select().from(accounts).all();
    expect(allRows).toHaveLength(1);
    expect(allRows[0].userId).toBe(TEST_USER_ID);
  });

  it("update does not modify other user's rows", async () => {
    rawDb.insert(accounts).values({ id: "1", name: "Original", type: "Asset", userId: "other-user" }).run();

    const db = await getDb();
    const { eq } = await import("drizzle-orm");
    db.update(accounts, { name: "Hacked" }, eq(accounts.id, "1")).run();

    const allRows = rawDb.select().from(accounts).all();
    expect(allRows[0].name).toBe("Original");
  });

  it("delete does not remove other user's rows", async () => {
    rawDb.insert(accounts).values({ id: "1", name: "Other", type: "Asset", userId: "other-user" }).run();

    const db = await getDb();
    const { eq } = await import("drizzle-orm");
    db.delete(accounts, eq(accounts.id, "1")).run();

    const allRows = rawDb.select().from(accounts).all();
    expect(allRows).toHaveLength(1);
  });
});
