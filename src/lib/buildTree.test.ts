import { describe, expect, it } from "vitest";

import { buildTree } from "./buildTree";

type Item = { id: string; name: string; parentCategoryId?: string };

describe("buildTree", () => {
  it("returns empty array for empty input", () => {
    expect(buildTree([])).toEqual([]);
  });

  it("builds a flat list of roots when no parents", () => {
    const items: Item[] = [
      { id: "1", name: "B" },
      { id: "2", name: "A" },
    ];
    const tree = buildTree(items);
    expect(tree).toHaveLength(2);
    expect(tree[0].name).toBe("A");
    expect(tree[1].name).toBe("B");
    expect(tree[0].children).toEqual([]);
  });

  it("nests children under parents", () => {
    const items: Item[] = [
      { id: "1", name: "Housing" },
      { id: "2", name: "Mortgage", parentCategoryId: "1" },
      { id: "3", name: "Maintenance", parentCategoryId: "1" },
    ];
    const tree = buildTree(items);
    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe("Housing");
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children[0].name).toBe("Maintenance");
    expect(tree[0].children[1].name).toBe("Mortgage");
  });

  it("handles multi-level nesting", () => {
    const items: Item[] = [
      { id: "1", name: "Root" },
      { id: "2", name: "Child", parentCategoryId: "1" },
      { id: "3", name: "Grandchild", parentCategoryId: "2" },
    ];
    const tree = buildTree(items);
    expect(tree[0].children[0].children[0].name).toBe("Grandchild");
  });
});
