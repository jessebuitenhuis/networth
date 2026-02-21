"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooterActions } from "@/components/shared/DialogFooterActions";
import { buildFlatTree } from "@/lib/buildFlatTree";
import { generateId } from "@/lib/generateId";

import { useCategories } from "../CategoryContext";

export function CreateCategoryDialog() {
  const { categories, addCategory } = useCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("none");

  const flatTree = useMemo(() => buildFlatTree(categories), [categories]);

  function resetForm() {
    setName("");
    setParentCategoryId("none");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    addCategory({
      id: generateId(),
      name: name.trim(),
      parentCategoryId:
        parentCategoryId === "none" ? undefined : parentCategoryId,
    });

    resetForm();
    setIsOpen(false);
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) {
      resetForm();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Housing, Income, Food"
              autoComplete="off"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-parent">Parent Category</Label>
            <Select
              value={parentCategoryId}
              onValueChange={setParentCategoryId}
            >
              <SelectTrigger id="category-parent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top Level)</SelectItem>
                {flatTree.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {"\u00A0\u00A0".repeat(cat.depth) + cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooterActions
            onCancel={() => setIsOpen(false)}
            submitLabel="Add Category"
            submitDisabled={!name.trim()}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
