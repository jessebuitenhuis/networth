"use client";

import { CreateCategoryDialog } from "@/categories/components/CreateCategoryDialog";
import { CategoryList } from "@/categories/components/CategoryList";
import TopBar from "@/components/layout/TopBar";

export default function CategoriesPage() {
  return (
    <>
      <TopBar title="Categories" actions={<CreateCategoryDialog />} />
      <div className="flex justify-center p-4">
        <div className="w-full max-w-2xl">
          <CategoryList />
        </div>
      </div>
    </>
  );
}
