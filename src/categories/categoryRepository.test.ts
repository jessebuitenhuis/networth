import { beforeEach, describe, expect, it, vi } from "vitest";

import { categories } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const TEST_USER_ID = "test-user";

const testDb = createTestDb();
vi.mock("@/db/connection", () => ({ db: testDb }));
vi.mock("@/auth/getCurrentUserId", () => ({ getCurrentUserId: vi.fn() }));

const { getCurrentUserId } = await import("@/auth/getCurrentUserId");
const {
  getAllCategories,
  getCategoryById,
  getRootCategories,
  getCategoriesByParentId,
  createCategory,
  updateCategory,
  deleteCategory,
} = await import("./categoryRepository");

beforeEach(() => {
  testDb.delete(categories).run();
  vi.mocked(getCurrentUserId).mockResolvedValue(TEST_USER_ID);
});

describe("getAllCategories", () => {
  it("returns empty array when no categories exist", async () => {
    expect(await getAllCategories()).toEqual([]);
  });

  it("returns all categories when populated", async () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Income", userId: TEST_USER_ID },
        { id: "c-2", name: "Expenses", userId: TEST_USER_ID },
      ])
      .run();

    expect(await getAllCategories()).toHaveLength(2);
  });
});

describe("getCategoryById", () => {
  it("returns the matching category", async () => {
    testDb.insert(categories).values({ id: "c-1", name: "Income", userId: TEST_USER_ID }).run();

    const result = await getCategoryById("c-1");
    expect(result).toEqual(expect.objectContaining({ id: "c-1", name: "Income" }));
  });

  it("returns undefined for non-existent id", async () => {
    expect(await getCategoryById("non-existent")).toBeUndefined();
  });
});

describe("getRootCategories", () => {
  it("returns only categories with no parent", async () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Income", userId: TEST_USER_ID },
        { id: "c-2", name: "Salary", parentCategoryId: "c-1", userId: TEST_USER_ID },
      ])
      .run();

    const result = await getRootCategories();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c-1");
  });
});

describe("getCategoriesByParentId", () => {
  it("returns children of the given parent", async () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Income", userId: TEST_USER_ID },
        { id: "c-2", name: "Salary", parentCategoryId: "c-1", userId: TEST_USER_ID },
        { id: "c-3", name: "Bonus", parentCategoryId: "c-1", userId: TEST_USER_ID },
        { id: "c-4", name: "Expenses", userId: TEST_USER_ID },
      ])
      .run();

    const result = await getCategoriesByParentId("c-1");
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.id)).toEqual(expect.arrayContaining(["c-2", "c-3"]));
  });

  it("returns empty array when parent has no children", async () => {
    testDb.insert(categories).values({ id: "c-1", name: "Income", userId: TEST_USER_ID }).run();

    expect(await getCategoriesByParentId("c-1")).toHaveLength(0);
  });
});

describe("createCategory", () => {
  it("inserts and returns the created category with all fields", async () => {
    const result = await createCategory({ id: "c-1", name: "Income" });
    expect(result).toEqual(
      expect.objectContaining({ id: "c-1", name: "Income", parentCategoryId: null }),
    );
  });

  it("stores parentCategoryId when provided", async () => {
    testDb.insert(categories).values({ id: "c-1", name: "Income", userId: TEST_USER_ID }).run();

    const result = await createCategory({ id: "c-2", name: "Salary", parentCategoryId: "c-1" });
    expect(result.parentCategoryId).toBe("c-1");
  });
});

describe("updateCategory", () => {
  it("modifies and returns the updated category", async () => {
    testDb.insert(categories).values({ id: "c-1", name: "Income", userId: TEST_USER_ID }).run();

    const result = await updateCategory("c-1", { name: "Revenue" });
    expect(result.name).toBe("Revenue");
  });

  it("updates parentCategoryId", async () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Income", userId: TEST_USER_ID },
        { id: "c-2", name: "Salary", userId: TEST_USER_ID },
      ])
      .run();

    const result = await updateCategory("c-2", { name: "Salary", parentCategoryId: "c-1" });
    expect(result.parentCategoryId).toBe("c-1");
  });
});

describe("deleteCategory", () => {
  it("removes the category", async () => {
    testDb.insert(categories).values({ id: "c-1", name: "Income", userId: TEST_USER_ID }).run();

    await deleteCategory("c-1");
    expect(await getAllCategories()).toHaveLength(0);
  });

  it("re-parents children to the deleted category's parent", async () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Root", userId: TEST_USER_ID },
        { id: "c-2", name: "Middle", parentCategoryId: "c-1", userId: TEST_USER_ID },
        { id: "c-3", name: "Leaf", parentCategoryId: "c-2", userId: TEST_USER_ID },
      ])
      .run();

    await deleteCategory("c-2");

    const leaf = await getCategoryById("c-3");
    expect(leaf?.parentCategoryId).toBe("c-1");
  });

  it("re-parents children to null when deleted category has no parent", async () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Root", userId: TEST_USER_ID },
        { id: "c-2", name: "Child", parentCategoryId: "c-1", userId: TEST_USER_ID },
      ])
      .run();

    await deleteCategory("c-1");

    const child = await getCategoryById("c-2");
    expect(child?.parentCategoryId).toBeNull();
  });
});

describe("cross-user isolation", () => {
  it("getAllCategories does not return other user's categories", async () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Mine", userId: TEST_USER_ID },
        { id: "c-2", name: "Theirs", userId: "other-user" },
      ])
      .run();

    const result = await getAllCategories();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c-1");
  });

  it("getCategoryById returns undefined for other user's category", async () => {
    testDb.insert(categories).values({ id: "c-1", name: "Other", userId: "other-user" }).run();

    expect(await getCategoryById("c-1")).toBeUndefined();
  });

  it("updateCategory does not modify other user's category", async () => {
    testDb.insert(categories).values({ id: "c-1", name: "Original", userId: "other-user" }).run();

    await updateCategory("c-1", { name: "Hacked" });

    const allRows = testDb.select().from(categories).all();
    expect(allRows.find((c) => c.id === "c-1")?.name).toBe("Original");
  });

  it("deleteCategory does not delete other user's category", async () => {
    testDb.insert(categories).values({ id: "c-1", name: "Other", userId: "other-user" }).run();

    await deleteCategory("c-1");

    const allRows = testDb.select().from(categories).all();
    expect(allRows.find((c) => c.id === "c-1")).toBeDefined();
  });

  it("deleteCategory re-parenting does not affect other user's children", async () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "My Root", userId: TEST_USER_ID },
        { id: "c-2", name: "My Middle", parentCategoryId: "c-1", userId: TEST_USER_ID },
        { id: "c-3", name: "Other Child", parentCategoryId: "c-2", userId: "other-user" },
      ])
      .run();

    await deleteCategory("c-2");

    const allRows = testDb.select().from(categories).all();
    const otherChild = allRows.find((c) => c.id === "c-3");
    expect(otherChild?.parentCategoryId).toBe("c-2");
  });
});
