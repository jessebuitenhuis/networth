import { beforeEach, describe, expect, it } from "vitest";

import { categories } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = await createTestDb();

const {
  getAllCategories,
  getCategoryById,
  getRootCategories,
  getCategoriesByParentId,
  createCategory,
  updateCategory,
  deleteCategory,
} = await import("./categoryRepository");

beforeEach(async () => {
  await testDb.delete(categories);
});

describe("getAllCategories", () => {
  it("returns empty array when no categories exist", async () => {
    expect(await getAllCategories()).toEqual([]);
  });

  it("returns all categories when populated", async () => {
    await testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Income"},
        { id: "c-2", name: "Expenses"},
      ]);

    expect(await getAllCategories()).toHaveLength(2);
  });
});

describe("getCategoryById", () => {
  it("returns the matching category", async () => {
    await testDb.insert(categories).values({ id: "c-1", name: "Income"});

    const result = await getCategoryById("c-1");
    expect(result).toEqual(expect.objectContaining({ id: "c-1", name: "Income" }));
  });

  it("returns undefined for non-existent id", async () => {
    expect(await getCategoryById("non-existent")).toBeUndefined();
  });
});

describe("getRootCategories", () => {
  it("returns only categories with no parent", async () => {
    await testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Income"},
        { id: "c-2", name: "Salary", parentCategoryId: "c-1"},
      ]);

    const result = await getRootCategories();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c-1");
  });
});

describe("getCategoriesByParentId", () => {
  it("returns children of the given parent", async () => {
    await testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Income"},
        { id: "c-2", name: "Salary", parentCategoryId: "c-1"},
        { id: "c-3", name: "Bonus", parentCategoryId: "c-1"},
        { id: "c-4", name: "Expenses"},
      ]);

    const result = await getCategoriesByParentId("c-1");
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.id)).toEqual(expect.arrayContaining(["c-2", "c-3"]));
  });

  it("returns empty array when parent has no children", async () => {
    await testDb.insert(categories).values({ id: "c-1", name: "Income"});

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
    await testDb.insert(categories).values({ id: "c-1", name: "Income"});

    const result = await createCategory({ id: "c-2", name: "Salary", parentCategoryId: "c-1" });
    expect(result.parentCategoryId).toBe("c-1");
  });
});

describe("updateCategory", () => {
  it("modifies and returns the updated category", async () => {
    await testDb.insert(categories).values({ id: "c-1", name: "Income"});

    const result = await updateCategory("c-1", { name: "Revenue" });
    expect(result.name).toBe("Revenue");
  });

  it("updates parentCategoryId", async () => {
    await testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Income"},
        { id: "c-2", name: "Salary"},
      ]);

    const result = await updateCategory("c-2", { name: "Salary", parentCategoryId: "c-1" });
    expect(result.parentCategoryId).toBe("c-1");
  });
});

describe("deleteCategory", () => {
  it("removes the category", async () => {
    await testDb.insert(categories).values({ id: "c-1", name: "Income"});

    await deleteCategory("c-1");
    expect(await getAllCategories()).toHaveLength(0);
  });

  it("re-parents children to the deleted category's parent", async () => {
    await testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Root"},
        { id: "c-2", name: "Middle", parentCategoryId: "c-1"},
        { id: "c-3", name: "Leaf", parentCategoryId: "c-2"},
      ]);

    await deleteCategory("c-2");

    const leaf = await getCategoryById("c-3");
    expect(leaf?.parentCategoryId).toBe("c-1");
  });

  it("re-parents children to null when deleted category has no parent", async () => {
    await testDb
      .insert(categories)
      .values([
        { id: "c-1", name: "Root"},
        { id: "c-2", name: "Child", parentCategoryId: "c-1"},
      ]);

    await deleteCategory("c-1");

    const child = await getCategoryById("c-2");
    expect(child?.parentCategoryId).toBeNull();
  });
});
