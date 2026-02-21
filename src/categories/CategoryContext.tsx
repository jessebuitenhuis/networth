"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

import type { Category } from "./Category.type";

export type CategoryAction =
  | { type: "add"; category: Category }
  | { type: "remove"; id: string }
  | { type: "update"; category: Category }
  | { type: "set"; categories: Category[] };

export function categoryReducer(
  state: Category[],
  action: CategoryAction,
): Category[] {
  switch (action.type) {
    case "add":
      return [...state, action.category];
    case "remove":
      return state.filter((c) => c.id !== action.id);
    case "update":
      return state.map((c) =>
        c.id === action.category.id ? action.category : c,
      );
    case "set":
      return action.categories;
  }
}

type CategoryContextValue = {
  categories: Category[];
  addCategory: (category: Category) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
};

const CategoryContext = createContext<CategoryContextValue | null>(null);

export function CategoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, dispatch] = useReducer(categoryReducer, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "set", categories: data }));
  }, []);

  async function addCategory(category: Category) {
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
    dispatch({ type: "add", category });
  }

  async function removeCategory(id: string) {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    dispatch({ type: "remove", id });
  }

  async function updateCategory(category: Category) {
    await fetch(`/api/categories/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
    dispatch({ type: "update", category });
  }

  return (
    <CategoryContext
      value={{ categories, addCategory, removeCategory, updateCategory }}
    >
      {children}
    </CategoryContext>
  );
}

export function useCategories(): CategoryContextValue {
  const ctx = useContext(CategoryContext);
  if (!ctx) {
    throw new Error("useCategories must be used within CategoryProvider");
  }
  return ctx;
}
