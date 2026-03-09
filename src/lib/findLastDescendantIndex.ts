import type { TreeItem } from "@/hooks/TreeItem.type";

import { getDescendantIds } from "./getDescendantIds";

export function findLastDescendantIndex(
  flatTree: TreeItem[],
  parentId: string,
  items: TreeItem[],
): number {
  const descendants = getDescendantIds(parentId, items);
  const parentIndex = flatTree.findIndex((n) => n.id === parentId);
  if (parentIndex === -1) return -1;

  let lastIndex = parentIndex;
  for (let i = parentIndex + 1; i < flatTree.length; i++) {
    if (descendants.has(flatTree[i].id)) {
      lastIndex = i;
    } else {
      break;
    }
  }
  return lastIndex;
}
