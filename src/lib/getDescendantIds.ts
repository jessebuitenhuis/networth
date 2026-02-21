type HasIdAndParent = { id: string; parentCategoryId?: string };

export function getDescendantIds<T extends HasIdAndParent>(
  itemId: string,
  items: T[],
): Set<string> {
  const ids = new Set<string>();
  const childrenMap = new Map<string, T[]>();

  for (const item of items) {
    if (item.parentCategoryId) {
      const children = childrenMap.get(item.parentCategoryId) || [];
      children.push(item);
      childrenMap.set(item.parentCategoryId, children);
    }
  }

  function walk(id: string) {
    ids.add(id);
    const children = childrenMap.get(id) || [];
    children.forEach((child) => walk(child.id));
  }

  walk(itemId);
  return ids;
}
