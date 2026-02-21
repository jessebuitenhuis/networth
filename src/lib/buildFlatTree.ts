import type { FlatTreeNode } from "./FlatTreeNode.type";

type HasIdAndParent = { id: string; parentCategoryId?: string; name: string };

export function buildFlatTree<T extends HasIdAndParent>(items: T[]): FlatTreeNode<T>[] {
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

  const result: FlatTreeNode<T>[] = [];

  function walk(node: T, depth: number) {
    result.push({ ...node, depth });
    const children = childrenMap.get(node.id) || [];
    children
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((child) => walk(child, depth + 1));
  }

  roots
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((root) => walk(root, 0));

  return result;
}
