import { describe, expect, it } from "vitest";

import type { Category } from "@/categories/Category.type";
import type { GanttChartItem } from "@/components/shared/gantt-chart/GanttChartItem.type";

import { buildRecurringTransactionGanttGroups } from "./buildRecurringTransactionGanttGroups";

const categories: Category[] = [
  { id: "cat-housing", name: "Housing" },
  { id: "cat-mortgage", name: "Mortgage", parentCategoryId: "cat-housing" },
  { id: "cat-income", name: "Income" },
];

function makeItem(overrides: Partial<GanttChartItem> & { id: string }): GanttChartItem {
  return {
    label: "Test",
    startDate: "2020-01-01",
    endDate: null,
    color: "red",
    dashed: false,
    tooltipContent: null,
    ...overrides,
  };
}

describe("buildRecurringTransactionGanttGroups", () => {
  it("returns empty array for no items", () => {
    const result = buildRecurringTransactionGanttGroups([], categories);
    expect(result).toEqual([]);
  });

  it("groups by root category and sorts alphabetically with Uncategorized last", () => {
    const items = [
      { item: makeItem({ id: "1" }), categoryId: "cat-mortgage" },
      { item: makeItem({ id: "2" }), categoryId: "cat-income" },
      { item: makeItem({ id: "3" }) },
    ];

    const result = buildRecurringTransactionGanttGroups(items, categories);

    expect(result).toHaveLength(3);
    expect(result[0].label).toBe("Housing");
    expect(result[1].label).toBe("Income");
    expect(result[2].label).toBe("Uncategorized");
  });

  it("groups child categories under their root", () => {
    const items = [
      { item: makeItem({ id: "1" }), categoryId: "cat-mortgage" },
      { item: makeItem({ id: "2" }), categoryId: "cat-housing" },
    ];

    const result = buildRecurringTransactionGanttGroups(items, categories);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Housing");
    expect(result[0].items).toHaveLength(2);
  });

  it("sorts items within groups by startDate", () => {
    const items = [
      { item: makeItem({ id: "later", startDate: "2023-06-01" }), categoryId: "cat-income" },
      { item: makeItem({ id: "earlier", startDate: "2020-01-01" }), categoryId: "cat-income" },
    ];

    const result = buildRecurringTransactionGanttGroups(items, categories);

    expect(result[0].items[0].id).toBe("earlier");
    expect(result[0].items[1].id).toBe("later");
  });

  it("places items without categoryId into Uncategorized", () => {
    const items = [
      { item: makeItem({ id: "1" }) },
    ];

    const result = buildRecurringTransactionGanttGroups(items, categories);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Uncategorized");
  });
});
