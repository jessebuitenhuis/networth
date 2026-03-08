import { eq, isNull } from "drizzle-orm";

import { categories } from "@/db/schema";
import { getUserDb } from "@/db/userDb";

export function getAllCategories(userId: string) {
  return getUserDb(userId).select(categories).all();
}

export function getCategoryById(userId: string, id: string) {
  const [row] = getUserDb(userId).select(categories, eq(categories.id, id)).all();
  return row;
}

export function getRootCategories(userId: string) {
  return getUserDb(userId).select(categories, isNull(categories.parentCategoryId)).all();
}

export function getCategoriesByParentId(userId: string, parentId: string) {
  return getUserDb(userId).select(categories, eq(categories.parentCategoryId, parentId)).all();
}

export function createCategory(
  userId: string,
  {
    id,
    name,
    parentCategoryId,
  }: {
    id: string;
    name: string;
    parentCategoryId?: string | null;
  },
) {
  getUserDb(userId).insert(categories, { id, name, parentCategoryId: parentCategoryId ?? null }).run();
  return getCategoryById(userId, id)!;
}

export function updateCategory(
  userId: string,
  id: string,
  { name, parentCategoryId }: { name: string; parentCategoryId?: string | null },
) {
  getUserDb(userId)
    .update(categories, { name, parentCategoryId: parentCategoryId ?? null }, eq(categories.id, id))
    .run();
  return getCategoryById(userId, id)!;
}

export function deleteCategory(userId: string, id: string) {
  const userDb = getUserDb(userId);
  const category = getCategoryById(userId, id);
  if (category) {
    userDb
      .update(categories, { parentCategoryId: category.parentCategoryId }, eq(categories.parentCategoryId, id))
      .run();
  }
  userDb.delete(categories, eq(categories.id, id)).run();
}
