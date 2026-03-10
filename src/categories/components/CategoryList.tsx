"use client";

import { useCallback, useMemo, useState } from "react";

import { useTreeDrag } from "@/hooks/useTreeDrag";
import { buildFlatTree } from "@/lib/buildFlatTree";
import { findLastDescendantIndex } from "@/lib/findLastDescendantIndex";
import { generateId } from "@/lib/generateId";

import type { Category } from "../Category.type";
import { useCategories } from "../CategoryContext";
import { CategoryRow } from "./CategoryRow";
import { InlineCreateSubcategory } from "./InlineCreateSubcategory";

type CategoryListProps = {
  categories: Category[];
};

export function CategoryList({ categories }: CategoryListProps) {
  const { addCategory, updateCategory } = useCategories();
  const [addingFor, setAddingFor] = useState<string | null>(null);

  const handleReparent = useCallback(
    (item: Category, newParentId: string) => {
      updateCategory({ ...item, parentCategoryId: newParentId });
    },
    [updateCategory],
  );

  const drag = useTreeDrag(categories, handleReparent);

  const flatTree = useMemo(() => buildFlatTree(categories), [categories]);

  const handleCreate = useCallback(
    (name: string, parentCategoryId: string) => {
      addCategory({ id: generateId(), name, parentCategoryId });
      setAddingFor(null);
    },
    [addCategory],
  );

  if (categories.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No categories yet. Create a category to get started.
      </p>
    );
  }

  const insertAfterIndex = addingFor
    ? findLastDescendantIndex(flatTree, addingFor, categories)
    : -1;

  return (
    <ul className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      {flatTree.map((node, index) => (
        <li
          key={node.id}
          className={
            index < flatTree.length - 1
              ? "list-none border-b border-slate-200 dark:border-slate-700"
              : "list-none"
          }
        >
          <CategoryRow
            category={node}
            depth={node.depth}
            dropTargetId={drag.dropTargetId}
            onAddSubcategory={setAddingFor}
            onDragStart={drag.onDragStart}
            onDragOver={drag.onDragOver}
            onDragLeave={drag.onDragLeave}
            onDrop={drag.onDrop}
            onDragEnd={drag.onDragEnd}
          />
          {index === insertAfterIndex && addingFor && (
            <InlineCreateSubcategory
              parentCategoryId={addingFor}
              onCreate={handleCreate}
              onCancel={() => setAddingFor(null)}
              depth={node.depth}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
