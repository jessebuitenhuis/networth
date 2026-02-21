"use client";

import { useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildFlatTree } from "@/lib/buildFlatTree";

import type { Category } from "../Category.type";
import { CreateCategoryInline } from "./CreateCategoryInline";

type CategorySelectProps = {
  categories: Category[];
  value: string;
  onValueChange: (value: string) => void;
  onCreateCategory: (name: string, parentCategoryId?: string) => string;
};

const CREATE_SENTINEL = "__create_new__";

export function CategorySelect({
  categories,
  value,
  onValueChange,
  onCreateCategory,
}: CategorySelectProps) {
  const [isCreateMode, setIsCreateMode] = useState(false);

  const flatTree = useMemo(() => buildFlatTree(categories), [categories]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === CREATE_SENTINEL) {
      setIsCreateMode(true);
    } else {
      onValueChange(selectedValue);
    }
  };

  const handleCreate = (name: string, parentCategoryId?: string) => {
    const newId = onCreateCategory(name, parentCategoryId);
    onValueChange(newId);
    setIsCreateMode(false);
  };

  if (isCreateMode) {
    return (
      <CreateCategoryInline
        categories={categories}
        onCreate={handleCreate}
        onCancel={() => setIsCreateMode(false)}
      />
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
