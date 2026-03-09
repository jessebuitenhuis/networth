"use client";

import { Plus } from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { Category } from "../Category.type";
import { EditCategoryDialog } from "./EditCategoryDialog";

export type CategoryRowProps = {
  category: Category;
  depth: number;
  onAddSubcategory: (parentId: string) => void;
  onDragStart: (categoryId: string) => void;
  onDrop: (targetCategoryId: string) => void;
  isDragOver: boolean;
  onDragOver: (categoryId: string) => void;
  onDragLeave: () => void;
};

export function CategoryRow({
  category,
  depth,
  onAddSubcategory,
  onDragStart,
  onDrop,
  isDragOver,
  onDragOver,
  onDragLeave,
}: CategoryRowProps) {
  function handleDragStart(e: React.DragEvent) {
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    onDragStart(category.id);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    onDragOver(category.id);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    onDrop(category.id);
  }

  function handleAddClick(e: React.MouseEvent) {
    e.stopPropagation();
    onAddSubcategory(category.id);
  }

  return (
    <div
      data-testid={`category-row-${category.id}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={onDragLeave}
      style={{ paddingLeft: depth * 24 }}
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
        isDragOver && "bg-accent",
      )}
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
    </div>
  );
}
