import { eq, isNull } from "drizzle-orm";

import { categories } from "@/db/schema";
import { getUserDb } from "@/db/userDb";

export function getAllCategories() {
  return getUserDb().select(categories).all();
}

export function getCategoryById(id: string) {
  const [row] = getUserDb().select(categories, eq(categories.id, id)).all();
  return row;
}

export function getRootCategories() {
  return getUserDb().select(categories, isNull(categories.parentCategoryId)).all();
}

export function getCategoriesByParentId(parentId: string) {
  return getUserDb().select(categories, eq(categories.parentCategoryId, parentId)).all();
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
  getUserDb().insert(categories, { id, name, parentCategoryId: parentCategoryId ?? null }).run();
  return getCategoryById(id)!;
}

export function updateCategory(
  id: string,
  { name, parentCategoryId }: { name: string; parentCategoryId?: string | null },
) {
  getUserDb()
    .update(categories, { name, parentCategoryId: parentCategoryId ?? null }, eq(categories.id, id))
    .run();
  return getCategoryById(id)!;
}

export function deleteCategory(id: string) {
  const userDb = getUserDb();
  const category = getCategoryById(id);
  if (category) {
    userDb
      .update(categories, { parentCategoryId: category.parentCategoryId }, eq(categories.parentCategoryId, id))
      .run();
  }
  userDb.delete(categories, eq(categories.id, id)).run();
}
