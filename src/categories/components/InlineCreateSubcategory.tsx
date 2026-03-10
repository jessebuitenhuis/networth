"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type InlineCreateSubcategoryProps = {
  parentCategoryId: string;
  onCreate: (name: string, parentCategoryId: string) => void;
  onCancel: () => void;
  depth: number;
};

export function InlineCreateSubcategory({
  parentCategoryId,
  onCreate,
  onCancel,
  depth,
}: InlineCreateSubcategoryProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed, parentCategoryId);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    } else if (e.key === "Escape") {
      onCancel();
    }
  }

  return (
    <div
      className="flex items-center gap-2 border-t border-slate-200 bg-slate-50/50 pr-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/30"
      style={{ paddingLeft: 12 + (depth + 1) * 24 }}
    >
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Subcategory name..."
        className="h-8 flex-1 text-sm"
        autoComplete="off"
      />
      <Button
        size="sm"
        onClick={handleCreate}
        disabled={name.trim() === ""}
      >
        Create
      </Button>
      <Button size="sm" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
