import { beforeEach, describe, expect, it, vi } from "vitest";

import { accounts } from "@/db/schema";
import { createTestDb, TEST_USER_ID } from "@/test/createTestDb";

const { raw: rawDb } = await createTestDb();
vi.doMock("@/auth/getCurrentUserId", () => ({ getCurrentUserId: vi.fn() }));

const { getCurrentUserId } = await import("@/auth/getCurrentUserId");
const { getDb } = await import("./userDb");

beforeEach(async () => {
  await rawDb.delete(accounts);
  vi.mocked(getCurrentUserId).mockResolvedValue(TEST_USER_ID);
});

describe("getDb cross-user isolation", () => {
  it("select does not return other user's rows", async () => {
    await rawDb
      .insert(accounts)
      .values([
        { id: "1", name: "My Account", type: "Asset", userId: TEST_USER_ID },
        { id: "2", name: "Other Account", type: "Asset", userId: "other-user" },
      ]);

    const db = await getDb();
    const result = await db.select(accounts);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("insert tags rows with the current user", async () => {
    const db = await getDb();
    await db.insert(accounts, { id: "1", name: "New", type: "Asset" });

    const allRows = await rawDb.select().from(accounts);
    expect(allRows).toHaveLength(1);
    expect(allRows[0].userId).toBe(TEST_USER_ID);
  });

  it("update does not modify other user's rows", async () => {
    await rawDb.insert(accounts).values({ id: "1", name: "Original", type: "Asset", userId: "other-user" });

    const db = await getDb();
    const { eq } = await import("drizzle-orm");
    await db.update(accounts, { name: "Hacked" }, eq(accounts.id, "1"));

    const allRows = await rawDb.select().from(accounts);
    expect(allRows[0].name).toBe("Original");
  });

  it("delete does not remove other user's rows", async () => {
    await rawDb.insert(accounts).values({ id: "1", name: "Other", type: "Asset", userId: "other-user" });

    const db = await getDb();
    const { eq } = await import("drizzle-orm");
    await db.delete(accounts, eq(accounts.id, "1"));

    const allRows = await rawDb.select().from(accounts);
    expect(allRows).toHaveLength(1);
  });
});
