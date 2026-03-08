import { eq, isNull } from "drizzle-orm";

import { categories } from "@/db/schema";
import { getUserDb } from "@/db/userDb";

export async function getAllCategories() {
  return (await getUserDb()).select(categories).all();
}

export async function getCategoryById(id: string) {
  const [row] = (await getUserDb()).select(categories, eq(categories.id, id)).all();
  return row;
}

export async function getRootCategories() {
  return (await getUserDb()).select(categories, isNull(categories.parentCategoryId)).all();
}

export async function getCategoriesByParentId(parentId: string) {
  return (await getUserDb()).select(categories, eq(categories.parentCategoryId, parentId)).all();
}

export async function createCategory({
  id,
  name,
  parentCategoryId,
}: {
  id: string;
  name: string;
  parentCategoryId?: string | null;
}) {
  (await getUserDb()).insert(categories, { id, name, parentCategoryId: parentCategoryId ?? null }).run();
  return (await getCategoryById(id))!;
}

export async function updateCategory(
  id: string,
  { name, parentCategoryId }: { name: string; parentCategoryId?: string | null },
) {
  (await getUserDb())
    .update(categories, { name, parentCategoryId: parentCategoryId ?? null }, eq(categories.id, id))
    .run();
  return (await getCategoryById(id))!;
}

export async function deleteCategory(id: string) {
  const userDb = await getUserDb();
  const category = await getCategoryById(id);
  if (category) {
    userDb
      .update(categories, { parentCategoryId: category.parentCategoryId }, eq(categories.parentCategoryId, id))
      .run();
  }
  userDb.delete(categories, eq(categories.id, id)).run();
}
