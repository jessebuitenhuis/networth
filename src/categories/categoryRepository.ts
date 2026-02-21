import { eq, isNull } from "drizzle-orm";

import { db } from "@/db/connection";
import { categories } from "@/db/schema";

export function getAllCategories() {
  return db.select().from(categories).all();
}

export function getCategoryById(id: string) {
  const [row] = db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .all();
  return row;
}

export function getRootCategories() {
  return db
    .select()
    .from(categories)
    .where(isNull(categories.parentCategoryId))
    .all();
}

export function getCategoriesByParentId(parentId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.parentCategoryId, parentId))
    .all();
}

export function createCategory({
  id,
  name,
  parentCategoryId,
}: {
  id: string;
  name: string;
  parentCategoryId?: string | null;
}) {
  db.insert(categories)
    .values({ id, name, parentCategoryId: parentCategoryId ?? null })
    .run();

  return getCategoryById(id)!;
}

export function updateCategory(
  id: string,
  {
    name,
    parentCategoryId,
  }: { name: string; parentCategoryId?: string | null },
) {
  db.update(categories)
    .set({ name, parentCategoryId: parentCategoryId ?? null })
    .where(eq(categories.id, id))
    .run();

  return getCategoryById(id)!;
}

export function deleteCategory(id: string) {
  // Move children to parent's parent (or root) before deleting
  const category = getCategoryById(id);
  if (category) {
    db.update(categories)
      .set({ parentCategoryId: category.parentCategoryId })
      .where(eq(categories.parentCategoryId, id))
      .run();
  }
  db.delete(categories).where(eq(categories.id, id)).run();
}
