import { describe, expect, it } from "vitest";

import { findLastDescendantIndex } from "./findLastDescendantIndex";

const items = [
  { id: "1" },
  { id: "2", parentCategoryId: "1" },
  { id: "3", parentCategoryId: "2" },
  { id: "4" },
];

describe("findLastDescendantIndex", () => {
  it("returns index of last descendant in flat tree", () => {
    const flatTree = [
      { id: "1" },
      { id: "2", parentCategoryId: "1" },
      { id: "3", parentCategoryId: "2" },
      { id: "4" },
    ];
    expect(findLastDescendantIndex(flatTree, "1", items)).toBe(2);
  });

  it("returns parent index when no descendants follow", () => {
    const flatTree = [{ id: "4" }, { id: "1" }];
    expect(findLastDescendantIndex(flatTree, "4", items)).toBe(0);
  });

  it("returns -1 when parent not found", () => {
    expect(findLastDescendantIndex([], "999", items)).toBe(-1);
  });

  it("returns parent index when parent is a leaf", () => {
    expect(findLastDescendantIndex(items, "4", items)).toBe(3);
  });
});
