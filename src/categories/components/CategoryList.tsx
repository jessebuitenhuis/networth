"use client";

import { GripVertical, Plus } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DragHandlers, TreeDragState } from "@/hooks/useTreeDrag";
import { useTreeDrag } from "@/hooks/useTreeDrag";
import { buildTree } from "@/lib/buildTree";
import { generateId } from "@/lib/generateId";
import type { TreeNode } from "@/lib/TreeNode.type";

import type { Category } from "../Category.type";
import { useCategories } from "../CategoryContext";
import { EditCategoryDialog } from "./EditCategoryDialog";

function InlineSubcategoryInput({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed) onSubmit(trimmed);
    } else if (e.key === "Escape") {
      onCancel();
    }
  }

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={onCancel}
      placeholder="Subcategory name"
      className="h-7 text-sm"
      autoFocus
      autoComplete="off"
    />
  );
}

function CategoryItem({
  node,
  depth,
  drag,
}: {
  node: TreeNode<Category>;
  depth: number;
  drag: TreeDragState & DragHandlers;
}) {
  const { addCategory } = useCategories();
  const [isCreating, setIsCreating] = useState(false);
  const isDropTarget = drag.dropTargetId === node.id;
  const isDragged = drag.draggedId === node.id;

  function handleCreateSubcategory(name: string) {
    addCategory({
      id: generateId(),
      name,
      parentCategoryId: node.id,
    });
    setIsCreating(false);
  }

  function handleAddClick(e: React.MouseEvent) {
    e.stopPropagation();
    setIsCreating(true);
  }

  return (
    <div
      data-category-id={node.id}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", node.id);
        e.dataTransfer.effectAllowed = "move";
        drag.onDragStart(node.id);
      }}
      onDragEnd={drag.onDragEnd}
      onDragOver={(e) => drag.onDragOver(e, node.id)}
      onDragLeave={drag.onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        drag.onDrop(node.id);
      }}
      className={`group/cat ${isDragged ? "opacity-40" : ""} ${isDropTarget ? "bg-accent rounded" : ""}`}
    >
      <div
        className="flex items-center justify-between py-2"
        style={{ paddingLeft: `${depth * 1.5}rem` }}
      >
        <div className="flex items-center gap-1">
          <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground opacity-0 group-hover/cat:opacity-100 transition-opacity" />
          <span className="text-sm">{node.name}</span>
        </div>
        <div
          data-testid="category-actions"
          className="flex gap-1 opacity-0 group-hover/cat:opacity-100 transition-opacity"
        >
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            aria-label="Add Subcategory"
            onClick={handleAddClick}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <EditCategoryDialog category={node} />
        </div>
      </div>
      {isCreating && (
        <div
          className="py-1"
          style={{ paddingLeft: `${(depth + 1) * 1.5}rem` }}
        >
          <InlineSubcategoryInput
            onSubmit={handleCreateSubcategory}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}
      {node.children.map((child) => (
        <CategoryItem key={child.id} node={child} depth={depth + 1} drag={drag} />
      ))}
    </div>
  );
}

type CategoryListProps = {
  categories: Category[];
};

export function CategoryList({ categories }: CategoryListProps) {
  const { updateCategory } = useCategories();
  const tree = useMemo(() => buildTree(categories), [categories]);

  const handleReparent = useCallback(
    (item: Category, newParentId: string) => {
      updateCategory({ ...item, parentCategoryId: newParentId });
    },
    [updateCategory],
  );

  const drag = useTreeDrag(categories, handleReparent);

  if (categories.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No categories yet. Add a category to start organizing your transactions.
      </div>
    );
  }

  return (
    <div className="divide-y">
      {tree.map((node) => (
        <CategoryItem key={node.id} node={node} depth={0} drag={drag} />
      ))}
    </div>
  );
}
