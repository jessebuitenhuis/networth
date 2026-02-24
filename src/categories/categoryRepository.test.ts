import { beforeEach, describe, expect, it, vi } from "vitest";

import { categories } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

vi.mock("@/lib/getCurrentUserId", () => ({ getCurrentUserId: () => "test-user" }));

const testDb = createTestDb();
vi.mock("@/db/connection", () => ({ db: testDb }));

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
});

describe("getAllCategories", () => {
  it("returns empty array when no categories exist", () => {
    expect(getAllCategories()).toEqual([]);
  });

  it("returns all categories when populated", () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Income", userId: "test-user" },
        { id: "c-2", name: "Expenses", userId: "test-user" },
      ])
      .run();

    expect(getAllCategories()).toHaveLength(2);
  });
});

describe("getCategoryById", () => {
  it("returns the matching category", () => {
    testDb.insert(categories).values({ id: "c-1", name: "Income", userId: "test-user" }).run();

    const result = getCategoryById("c-1");
    expect(result).toEqual(expect.objectContaining({ id: "c-1", name: "Income" }));
  });

  it("returns undefined for non-existent id", () => {
    expect(getCategoryById("non-existent")).toBeUndefined();
  });
});

describe("getRootCategories", () => {
  it("returns only categories with no parent", () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Income", userId: "test-user" },
        { id: "c-2", name: "Salary", parentCategoryId: "c-1", userId: "test-user" },
      ])
      .run();

    const result = getRootCategories();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c-1");
  });
});

describe("getCategoriesByParentId", () => {
  it("returns children of the given parent", () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Income", userId: "test-user" },
        { id: "c-2", name: "Salary", parentCategoryId: "c-1", userId: "test-user" },
        { id: "c-3", name: "Bonus", parentCategoryId: "c-1", userId: "test-user" },
        { id: "c-4", name: "Expenses", userId: "test-user" },
      ])
      .run();

    const result = getCategoriesByParentId("c-1");
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.id)).toEqual(expect.arrayContaining(["c-2", "c-3"]));
  });

  it("returns empty array when parent has no children", () => {
    testDb.insert(categories).values({ id: "c-1", name: "Income", userId: "test-user" }).run();

    expect(getCategoriesByParentId("c-1")).toHaveLength(0);
  });
});

describe("createCategory", () => {
  it("inserts and returns the created category with all fields", () => {
    const result = createCategory({ id: "c-1", name: "Income" });
    expect(result).toEqual(
      expect.objectContaining({ id: "c-1", name: "Income", parentCategoryId: null }),
    );
  });

  it("stores parentCategoryId when provided", () => {
    testDb.insert(categories).values({ id: "c-1", name: "Income", userId: "test-user" }).run();

    const result = createCategory({ id: "c-2", name: "Salary", parentCategoryId: "c-1" });
    expect(result.parentCategoryId).toBe("c-1");
  });
});

describe("updateCategory", () => {
  it("modifies and returns the updated category", () => {
    testDb.insert(categories).values({ id: "c-1", name: "Income", userId: "test-user" }).run();

    const result = updateCategory("c-1", { name: "Revenue" });
    expect(result.name).toBe("Revenue");
  });

  it("updates parentCategoryId", () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Income", userId: "test-user" },
        { id: "c-2", name: "Salary", userId: "test-user" },
      ])
      .run();

    const result = updateCategory("c-2", { name: "Salary", parentCategoryId: "c-1" });
    expect(result.parentCategoryId).toBe("c-1");
  });
});

describe("deleteCategory", () => {
  it("removes the category", () => {
    testDb.insert(categories).values({ id: "c-1", name: "Income", userId: "test-user" }).run();

    deleteCategory("c-1");
    expect(getAllCategories()).toHaveLength(0);
  });

  it("re-parents children to the deleted category's parent", () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Root", userId: "test-user" },
        { id: "c-2", name: "Middle", parentCategoryId: "c-1", userId: "test-user" },
        { id: "c-3", name: "Leaf", parentCategoryId: "c-2", userId: "test-user" },
      ])
      .run();

    deleteCategory("c-2");

    const leaf = getCategoryById("c-3");
    expect(leaf?.parentCategoryId).toBe("c-1");
  });

  it("re-parents children to null when deleted category has no parent", () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Root", userId: "test-user" },
        { id: "c-2", name: "Child", parentCategoryId: "c-1", userId: "test-user" },
      ])
      .run();

    deleteCategory("c-1");

    const child = getCategoryById("c-2");
    expect(child?.parentCategoryId).toBeNull();
  });
});

describe("cross-user isolation", () => {
  it("getAllCategories does not return other user's categories", () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Mine", userId: "test-user" },
        { id: "c-2", name: "Theirs", userId: "other-user" },
      ])
      .run();

    const result = getAllCategories();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c-1");
  });

  it("getCategoryById returns undefined for other user's category", () => {
    testDb.insert(categories).values({ id: "c-1", name: "Other", userId: "other-user" }).run();

    expect(getCategoryById("c-1")).toBeUndefined();
  });

  it("updateCategory does not modify other user's category", () => {
    testDb.insert(categories).values({ id: "c-1", name: "Original", userId: "other-user" }).run();

    updateCategory("c-1", { name: "Hacked" });

    const allRows = testDb.select().from(categories).all();
    expect(allRows.find((c) => c.id === "c-1")?.name).toBe("Original");
  });

  it("deleteCategory does not delete other user's category", () => {
    testDb.insert(categories).values({ id: "c-1", name: "Other", userId: "other-user" }).run();

    deleteCategory("c-1");

    const allRows = testDb.select().from(categories).all();
    expect(allRows.find((c) => c.id === "c-1")).toBeDefined();
  });

  it("deleteCategory re-parenting does not affect other user's children", () => {
    testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "My Root", userId: "test-user" },
        { id: "c-2", name: "My Middle", parentCategoryId: "c-1", userId: "test-user" },
        { id: "c-3", name: "Other Child", parentCategoryId: "c-2", userId: "other-user" },
      ])
      .run();

    deleteCategory("c-2");

    const allRows = testDb.select().from(categories).all();
    const otherChild = allRows.find((c) => c.id === "c-3");
    expect(otherChild?.parentCategoryId).toBe("c-2");
  });
});
