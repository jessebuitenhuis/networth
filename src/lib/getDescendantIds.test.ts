import { describe, expect, it } from "vitest";

import { getDescendantIds } from "./getDescendantIds";

type Item = { id: string; parentCategoryId?: string };

describe("getDescendantIds", () => {
  it("returns just the item itself when it has no children", () => {
    const items: Item[] = [{ id: "1" }, { id: "2" }];
    const result = getDescendantIds("1", items);
    expect(result).toEqual(new Set(["1"]));
  });

  it("returns item and all descendants", () => {
    const items: Item[] = [
      { id: "1" },
      { id: "2", parentCategoryId: "1" },
      { id: "3", parentCategoryId: "2" },
    ];
    const result = getDescendantIds("1", items);
    expect(result).toEqual(new Set(["1", "2", "3"]));
  });

  it("returns only subtree descendants, not siblings", () => {
    const items: Item[] = [
      { id: "1" },
      { id: "2", parentCategoryId: "1" },
      { id: "3", parentCategoryId: "1" },
      { id: "4", parentCategoryId: "2" },
    ];
    const result = getDescendantIds("2", items);
    expect(result).toEqual(new Set(["2", "4"]));
  });
});
