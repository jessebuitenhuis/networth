"use client";

import { useMemo } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buildTree } from "@/lib/buildTree";
import type { TreeNode } from "@/lib/TreeNode.type";

import type { Category } from "../Category.type";
import { useCategories } from "../CategoryContext";
import { EditCategoryDialog } from "./EditCategoryDialog";

function CategoryItem({
  node,
  depth,
}: {
  node: TreeNode<Category>;
  depth: number;
}) {
  return (
    <>
      <div
        className="flex items-center justify-between py-2"
        style={{ paddingLeft: `${depth * 1.5}rem` }}
      >
        <span className="text-sm">{node.name}</span>
        <EditCategoryDialog category={node} />
      </div>
      {node.children.map((child) => (
        <CategoryItem key={child.id} node={child} depth={depth + 1} />
      ))}
    </>
  );
}

export function CategoryList() {
  const { categories } = useCategories();
  const tree = useMemo(() => buildTree(categories), [categories]);

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No categories yet. Add a category to start organizing your
          transactions.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Categories</h3>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {tree.map((node) => (
            <CategoryItem key={node.id} node={node} depth={0} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
