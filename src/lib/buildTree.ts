import type { TreeNode } from "./TreeNode.type";

type HasIdAndParent = { id: string; parentCategoryId?: string; name: string };

export function buildTree<T extends HasIdAndParent>(items: T[]): TreeNode<T>[] {
  const childrenMap = new Map<string, T[]>();
  const roots: T[] = [];

  for (const item of items) {
    if (item.parentCategoryId) {
      const children = childrenMap.get(item.parentCategoryId) || [];
      children.push(item);
      childrenMap.set(item.parentCategoryId, children);
    } else {
      roots.push(item);
    }
  }

  function toNode(item: T): TreeNode<T> {
    const children = (childrenMap.get(item.id) || [])
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(toNode);
    return { ...item, children };
  }

  return roots.sort((a, b) => a.name.localeCompare(b.name)).map(toNode);
}
