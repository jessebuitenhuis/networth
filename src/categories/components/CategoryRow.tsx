"use client";

import { Plus } from "lucide-react";

import { DraggableTreeRow } from "@/components/shared/DraggableTreeRow";
import { Button } from "@/components/ui/button";
import type { DragHandlers } from "@/hooks/DragHandlers.type";

import type { Category } from "../Category.type";
import { EditCategoryDialog } from "./EditCategoryDialog";

export type CategoryRowProps = DragHandlers & {
  category: Category;
  depth: number;
  dropTargetId: string | null;
  onAddSubcategory: (parentId: string) => void;
};

export function CategoryRow({
  category,
  depth,
  dropTargetId,
  onAddSubcategory,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: CategoryRowProps) {
  function handleAddClick(e: React.MouseEvent) {
    e.stopPropagation();
    onAddSubcategory(category.id);
  }

  return (
    <DraggableTreeRow
      id={category.id}
      dropTargetId={dropTargetId}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      data-testid={`category-row-${category.id}`}
      style={{ paddingLeft: 12 + depth * 24 }}
      className="group flex items-center gap-2 pr-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
    >
      <span className="flex-1 truncate text-sm">{category.name}</span>
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <EditCategoryDialog category={category} />
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          aria-label="Add Subcategory"
          onClick={handleAddClick}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </DraggableTreeRow>
  );
}
