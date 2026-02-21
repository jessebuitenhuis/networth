"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildFlatTree } from "@/lib/buildFlatTree";

import type { Category } from "../Category.type";

type CreateCategoryInlineProps = {
  categories: Category[];
  onCreate: (name: string, parentCategoryId?: string) => void;
  onCancel: () => void;
};

export function CreateCategoryInline({
  categories,
  onCreate,
  onCancel,
}: CreateCategoryInlineProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [parentId, setParentId] = useState("none");
  const inputRef = useRef<HTMLInputElement>(null);

  const flatTree = useMemo(() => buildFlatTree(categories), [categories]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCreate = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName) {
      onCreate(trimmedName, parentId === "none" ? undefined : parentId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const isCreateDisabled = newCategoryName.trim() === "";

  return (
    <div className="space-y-2">
      <Label htmlFor="category-name">Category Name</Label>
      <Input
        id="category-name"
        ref={inputRef}
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter category name..."
        autoComplete="off"
      />
      {categories.length > 0 && (
        <>
          <Label htmlFor="parent-category-select">Parent Category</Label>
          <Select value={parentId} onValueChange={setParentId}>
            <SelectTrigger id="parent-category-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Top Level)</SelectItem>
              {flatTree.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {"  ".repeat(cat.depth) + cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleCreate}
          disabled={isCreateDisabled}
          size="sm"
        >
          Create
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
