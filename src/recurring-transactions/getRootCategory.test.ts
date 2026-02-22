import { describe, expect, it } from "vitest";

import type { Category } from "@/categories/Category.type";

import { getRootCategory } from "./getRootCategory";

describe("getRootCategory", () => {
  const categories: Category[] = [
    { id: "root1", name: "Housing" },
    { id: "child1", name: "Mortgage", parentCategoryId: "root1" },
    { id: "grandchild1", name: "Primary Home", parentCategoryId: "child1" },
    { id: "root2", name: "Income" },
  ];

  it("returns the root category for a root-level category", () => {
    const result = getRootCategory("root1", categories);
    expect(result).toEqual({ id: "root1", name: "Housing" });
  });

  it("returns the root category for a child category", () => {
    const result = getRootCategory("child1", categories);
    expect(result).toEqual({ id: "root1", name: "Housing" });
  });

  it("returns the root category for a grandchild category", () => {
    const result = getRootCategory("grandchild1", categories);
    expect(result).toEqual({ id: "root1", name: "Housing" });
  });

  it("returns null for a non-existent category ID", () => {
    const result = getRootCategory("nonexistent", categories);
    expect(result).toBeNull();
  });

  it("handles a category whose parent does not exist", () => {
    const orphaned: Category[] = [
      { id: "orphan", name: "Orphan", parentCategoryId: "missing" },
    ];
    const result = getRootCategory("orphan", orphaned);
    expect(result).toEqual({ id: "orphan", name: "Orphan", parentCategoryId: "missing" });
  });
});
