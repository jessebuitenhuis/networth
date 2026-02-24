import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db/connection";
import { categories } from "@/db/schema";
import { getCurrentUserId } from "@/lib/getCurrentUserId";

export function getAllCategories() {
  const userId = getCurrentUserId();
  return db.select().from(categories).where(eq(categories.userId, userId)).all();
}

export function getCategoryById(id: string) {
  const userId = getCurrentUserId();
  const [row] = db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .all();
  return row;
}

export function getRootCategories() {
  const userId = getCurrentUserId();
  return db
    .select()
    .from(categories)
    .where(and(isNull(categories.parentCategoryId), eq(categories.userId, userId)))
    .all();
}

export function getCategoriesByParentId(parentId: string) {
  const userId = getCurrentUserId();
  return db
    .select()
    .from(categories)
    .where(and(eq(categories.parentCategoryId, parentId), eq(categories.userId, userId)))
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
  const userId = getCurrentUserId();
  db.insert(categories)
    .values({ id, userId, name, parentCategoryId: parentCategoryId ?? null })
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
  const userId = getCurrentUserId();
  db.update(categories)
    .set({ name, parentCategoryId: parentCategoryId ?? null })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .run();

  return getCategoryById(id)!;
}

export function deleteCategory(id: string) {
  const userId = getCurrentUserId();
  const category = getCategoryById(id);
  if (category) {
    db.update(categories)
      .set({ parentCategoryId: category.parentCategoryId })
      .where(and(eq(categories.parentCategoryId, id), eq(categories.userId, userId)))
      .run();
  }
  db.delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .run();
}
