"use client";

import { useCategories } from "@/categories/CategoryContext";
import { CategoryList } from "@/categories/components/CategoryList";
import { CreateCategoryDialog } from "@/categories/components/CreateCategoryDialog";
import TopBar from "@/components/layout/TopBar";

export default function CategoriesPage() {
  const { categories } = useCategories();

  return (
    <>
      <TopBar title="Categories" actions={<CreateCategoryDialog />} />
      <div className="flex justify-center p-4">
        <div className="w-full max-w-2xl">
          <CategoryList categories={categories} />
        </div>
      </div>
    </>
  );
}
