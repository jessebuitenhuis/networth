"use client";

import { GripVertical, Plus } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildTree } from "@/lib/buildTree";
import { generateId } from "@/lib/generateId";
import { getDescendantIds } from "@/lib/getDescendantIds";
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
  categories,
  draggedId,
  dropTargetId,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  onDragLeave,
}: {
  node: TreeNode<Category>;
  depth: number;
  categories: Category[];
  draggedId: string | null;
  dropTargetId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string) => void;
  onDragOver: (e: React.DragEvent, targetId: string) => void;
  onDragLeave: () => void;
}) {
  const { addCategory } = useCategories();
  const [isCreating, setIsCreating] = useState(false);
  const isDropTarget = dropTargetId === node.id;
  const isDragged = draggedId === node.id;

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
        onDragStart(node.id);
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, node.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop(node.id);
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
        <CategoryItem
          key={child.id}
          node={child}
          depth={depth + 1}
          categories={categories}
          draggedId={draggedId}
          dropTargetId={dropTargetId}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        />
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
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const isValidDropTarget = useCallback(
    (targetId: string) => {
      if (!draggedId || draggedId === targetId) return false;
      const descendants = getDescendantIds(draggedId, categories);
      return !descendants.has(targetId);
    },
    [draggedId, categories],
  );

  function handleDragOver(e: React.DragEvent, targetId: string) {
    if (isValidDropTarget(targetId)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropTargetId(targetId);
    }
  }

  function handleDrop(targetId: string) {
    if (!draggedId || !isValidDropTarget(targetId)) return;
    const dragged = categories.find((c) => c.id === draggedId);
    if (dragged) {
      updateCategory({ ...dragged, parentCategoryId: targetId });
    }
    setDraggedId(null);
    setDropTargetId(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDropTargetId(null);
  }

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
        <CategoryItem
          key={node.id}
          node={node}
          depth={0}
          categories={categories}
          draggedId={draggedId}
          dropTargetId={dropTargetId}
          onDragStart={setDraggedId}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDropTargetId(null)}
        />
      ))}
    </div>
  );
}
