import { describe, expect, it } from "vitest";

import { buildFlatTree } from "./buildFlatTree";

type Item = { id: string; name: string; parentCategoryId?: string };

describe("buildFlatTree", () => {
  it("returns empty array for empty input", () => {
    expect(buildFlatTree([])).toEqual([]);
  });

  it("returns flat nodes with depth 0 for roots", () => {
    const items: Item[] = [
      { id: "1", name: "B" },
      { id: "2", name: "A" },
    ];
    const result = buildFlatTree(items);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("A");
    expect(result[0].depth).toBe(0);
    expect(result[1].name).toBe("B");
    expect(result[1].depth).toBe(0);
  });

  it("assigns increasing depth to nested items", () => {
    const items: Item[] = [
      { id: "1", name: "Housing" },
      { id: "2", name: "Mortgage", parentCategoryId: "1" },
      { id: "3", name: "Maintenance", parentCategoryId: "1" },
    ];
    const result = buildFlatTree(items);
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ name: "Housing", depth: 0 });
    expect(result[1]).toMatchObject({ name: "Maintenance", depth: 1 });
    expect(result[2]).toMatchObject({ name: "Mortgage", depth: 1 });
  });

  it("handles multi-level nesting in order", () => {
    const items: Item[] = [
      { id: "1", name: "Root" },
      { id: "2", name: "Child", parentCategoryId: "1" },
      { id: "3", name: "Grandchild", parentCategoryId: "2" },
    ];
    const result = buildFlatTree(items);
    expect(result[0]).toMatchObject({ name: "Root", depth: 0 });
    expect(result[1]).toMatchObject({ name: "Child", depth: 1 });
    expect(result[2]).toMatchObject({ name: "Grandchild", depth: 2 });
  });
});
