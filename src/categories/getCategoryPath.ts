import type { Category } from "./Category.type";

export function getCategoryPath(
  categoryId: string,
  categories: Category[],
): string {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const parts: string[] = [];
  let current = categoryMap.get(categoryId);

  while (current) {
    parts.unshift(current.name);
    current = current.parentCategoryId
      ? categoryMap.get(current.parentCategoryId)
      : undefined;
  }

  return parts.join(" > ");
}
