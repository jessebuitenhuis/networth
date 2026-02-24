import { useMemo } from "react";

import type { MultiSelectPickerItem } from "@/components/shared/MultiSelectPicker";

import { useCategories } from "./CategoryContext";
import { getCategoryPath } from "./getCategoryPath";

export function useCategoryPickerItems(): MultiSelectPickerItem[] {
  const { categories } = useCategories();
  return useMemo(
    () => categories.map((c) => ({ id: c.id, label: getCategoryPath(c.id, categories) })),
    [categories]
  );
}
