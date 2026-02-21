"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Category } from "../Category.type";

type CategorySelectProps = {
  categories: Category[];
  value: string;
  onValueChange: (value: string) => void;
  onCreateCategory: (name: string, parentCategoryId?: string) => string;
};

const CREATE_SENTINEL = "__create_new__";

type CategoryNode = Category & { depth: number };

function buildFlatTree(categories: Category[]): CategoryNode[] {
  const childrenMap = new Map<string, Category[]>();
  const roots: Category[] = [];

  for (const cat of categories) {
    if (cat.parentCategoryId) {
      const children = childrenMap.get(cat.parentCategoryId) || [];
      children.push(cat);
      childrenMap.set(cat.parentCategoryId, children);
    } else {
      roots.push(cat);
    }
  }

  const result: CategoryNode[] = [];

  function walk(node: Category, depth: number) {
    result.push({ ...node, depth });
    const children = childrenMap.get(node.id) || [];
    children
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((child) => walk(child, depth + 1));
  }

  roots
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((root) => walk(root, 0));

  return result;
}

export function CategorySelect({
  categories,
  value,
  onValueChange,
  onCreateCategory,
}: CategorySelectProps) {
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [parentId, setParentId] = useState("none");
  const inputRef = useRef<HTMLInputElement>(null);

  const flatTree = useMemo(() => buildFlatTree(categories), [categories]);

  useEffect(() => {
    if (isCreateMode) {
      inputRef.current?.focus();
    }
  }, [isCreateMode]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === CREATE_SENTINEL) {
      setIsCreateMode(true);
      setNewCategoryName("");
      setParentId("none");
    } else {
      onValueChange(selectedValue);
    }
  };

  const handleCreate = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName) {
      const newId = onCreateCategory(
        trimmedName,
        parentId === "none" ? undefined : parentId,
      );
      onValueChange(newId);
      setIsCreateMode(false);
      setNewCategoryName("");
      setParentId("none");
    }
  };

  const handleCancel = () => {
    setIsCreateMode(false);
    setNewCategoryName("");
    setParentId("none");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const isCreateDisabled = newCategoryName.trim() === "";

  if (isCreateMode) {
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
            onClick={handleCancel}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="category-select">Category</Label>
      <Select value={value} onValueChange={handleSelectChange}>
        <SelectTrigger id="category-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {flatTree.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {"\u00A0\u00A0".repeat(cat.depth) + cat.name}
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value={CREATE_SENTINEL}>
            Create new category...
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
