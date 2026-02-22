import type { Category } from "@/categories/Category.type";
import type { GanttChartGroup } from "@/components/shared/gantt-chart/GanttChartGroup.type";
import type { GanttChartItem } from "@/components/shared/gantt-chart/GanttChartItem.type";

import { getRootCategory } from "./getRootCategory";

type ItemWithCategory = {
  item: GanttChartItem;
  categoryId?: string;
};

export function buildRecurringTransactionGanttGroups(
  items: ItemWithCategory[],
  categories: Category[],
): GanttChartGroup[] {
  const groupMap = new Map<string, { label: string; items: GanttChartItem[] }>();

  for (const { item, categoryId } of items) {
    const rootCategory = categoryId
      ? getRootCategory(categoryId, categories)
      : null;
    const groupId = rootCategory?.id ?? "__uncategorized__";
    const groupLabel = rootCategory?.name ?? "Uncategorized";

    if (!groupMap.has(groupId)) {
      groupMap.set(groupId, { label: groupLabel, items: [] });
    }

    groupMap.get(groupId)!.items.push(item);
  }

  const groups: GanttChartGroup[] = [];
  const uncategorized = groupMap.get("__uncategorized__");
  groupMap.delete("__uncategorized__");

  const sortedEntries = [...groupMap.entries()].sort(([, a], [, b]) =>
    a.label.localeCompare(b.label),
  );

  for (const [id, { label, items: groupItems }] of sortedEntries) {
    groupItems.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
    groups.push({ id, label, items: groupItems });
  }

  if (uncategorized) {
    uncategorized.items.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
    groups.push({
      id: "__uncategorized__",
      label: uncategorized.label,
      items: uncategorized.items,
    });
  }

  return groups;
}
