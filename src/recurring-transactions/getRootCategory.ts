import type { Category } from "@/categories/Category.type";

export function getRootCategory(
  categoryId: string,
  categories: Category[],
): Category | null {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  let current = categoryMap.get(categoryId);

  if (!current) {
    return null;
  }

  while (current.parentCategoryId) {
    const parent = categoryMap.get(current.parentCategoryId);
    if (!parent) {
      break;
    }
    current = parent;
  }

  return current;
}
