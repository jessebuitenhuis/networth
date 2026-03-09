import { eq, isNull } from "drizzle-orm";

import { BaseRepository } from "@/db/BaseRepository";
import { categories } from "@/db/schema";
import { getDb } from "@/db/userDb";

class CategoryRepository extends BaseRepository<typeof categories> {
  constructor() {
    super(categories, categories.id);
  }

  async createCategory({
    id,
    name,
    parentCategoryId,
  }: {
    id: string;
    name: string;
    parentCategoryId?: string | null;
  }) {
    return this.create({ id, name, parentCategoryId: parentCategoryId ?? null });
  }

  async updateCategory(
    id: string,
    { name, parentCategoryId }: { name: string; parentCategoryId?: string | null },
  ) {
    return this.update(id, { name, parentCategoryId: parentCategoryId ?? null });
  }

  async getRootCategories() {
    return (await getDb()).select(categories, isNull(categories.parentCategoryId));
  }

  async getCategoriesByParentId(parentId: string) {
    return (await getDb()).select(categories, eq(categories.parentCategoryId, parentId));
  }

  async deleteCategory(id: string) {
    const userDb = await getDb();
    const category = await this.getById(id);
    if (category) {
      await userDb.update(categories, { parentCategoryId: category.parentCategoryId }, eq(categories.parentCategoryId, id));
    }
    await userDb.delete(categories, eq(categories.id, id));
  }
}

export const categoryRepo = new CategoryRepository();
