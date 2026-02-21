"use client";

import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { buildFlatTree } from "@/lib/buildFlatTree";
import { getDescendantIds } from "@/lib/getDescendantIds";

import type { Category } from "../Category.type";
import { useCategories } from "../CategoryContext";

type EditCategoryDialogProps = {
  category: Category;
};

export function EditCategoryDialog({ category }: EditCategoryDialogProps) {
  const { categories, updateCategory, removeCategory } = useCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [name, setName] = useState(category.name);
  const [parentCategoryId, setParentCategoryId] = useState(
    category.parentCategoryId || "none",
  );

  // Exclude this category and its descendants from parent options
  const descendantIds = useMemo(
    () => getDescendantIds(category.id, categories),
    [category.id, categories],
  );

  const flatTree = useMemo(
    () =>
      buildFlatTree(categories).filter((cat) => !descendantIds.has(cat.id)),
    [categories, descendantIds],
  );

  function resetForm() {
    setName(category.name);
    setParentCategoryId(category.parentCategoryId || "none");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    updateCategory({
      id: category.id,
      name: name.trim(),
      parentCategoryId:
        parentCategoryId === "none" ? undefined : parentCategoryId,
    });
    setIsOpen(false);
  }

  function handleDeleteClick() {
    setIsOpen(false);
    setIsDeleteConfirmOpen(true);
  }

  function handleCancelDelete() {
    setIsDeleteConfirmOpen(false);
    setIsOpen(true);
  }

  function handleDelete() {
    removeCategory(category.id);
    setIsDeleteConfirmOpen(false);
  }

  function handleTriggerClick(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            aria-label="Edit Category"
            onClick={handleTriggerClick}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-category-name" className="mb-2">
                Name
              </Label>
              <Input
                id="edit-category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-category-parent" className="mb-2">
                Parent Category
              </Label>
              <Select
                value={parentCategoryId}
                onValueChange={setParentCategoryId}
              >
                <SelectTrigger id="edit-category-parent">
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
            <div className="flex justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteClick}
              >
                Delete
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelDelete();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? Subcategories will
              be moved up to the parent level. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
