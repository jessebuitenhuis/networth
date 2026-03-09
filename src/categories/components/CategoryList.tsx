"use client";

import { useCallback, useMemo, useState } from "react";

import { useTreeDrag } from "@/hooks/useTreeDrag";
import { buildFlatTree } from "@/lib/buildFlatTree";
import { generateId } from "@/lib/generateId";
import { getDescendantIds } from "@/lib/getDescendantIds";

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

  // Find where to insert inline form: after all descendants of addingFor
  const insertAfterIndex = addingFor
    ? findInsertIndex(flatTree, addingFor, categories)
    : -1;

  return (
    <ul className="space-y-0.5">
      {flatTree.map((node, index) => (
        <li key={node.id} className="list-none">
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

function findInsertIndex<T extends { id: string; parentCategoryId?: string }>(
  flatTree: T[],
  parentId: string,
  categories: { id: string; parentCategoryId?: string }[],
): number {
  const descendants = getDescendantIds(parentId, categories);
  const parentIndex = flatTree.findIndex((n) => n.id === parentId);
  if (parentIndex === -1) return -1;

  let lastIndex = parentIndex;
  for (let i = parentIndex + 1; i < flatTree.length; i++) {
    if (descendants.has(flatTree[i].id)) {
      lastIndex = i;
    } else {
      break;
    }
  }
  return lastIndex;
}
