import { beforeEach, describe, expect, it } from "vitest";

import type { Category } from "@/categories/Category.type";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";

import { CategoryListPage } from "./CategoryList.page";

describe("CategoryList", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  it("displays empty state when no categories exist", () => {
    const page = CategoryListPage.render([]);
    expect(page.getByText(/no categories yet/i)).toBeInTheDocument();
  });

  it("renders categories", () => {
    const categories: Category[] = [
      { id: "1", name: "Food" },
      { id: "2", name: "Transport" },
    ];
    const page = CategoryListPage.render(categories);
    expect(page.getByText("Food")).toBeInTheDocument();
    expect(page.getByText("Transport")).toBeInTheDocument();
  });

  it("renders categories in alphabetical tree order", () => {
    const categories: Category[] = [
      { id: "1", name: "Transport" },
      { id: "2", name: "Food" },
      { id: "3", name: "Groceries", parentCategoryId: "2" },
    ];
    const page = CategoryListPage.render(categories);
    const items = page.getAllItems();
    expect(items[0]).toHaveTextContent("Food");
    expect(items[1]).toHaveTextContent("Groceries");
    expect(items[2]).toHaveTextContent("Transport");
  });

  it("shows inline create form when add-subcategory is clicked", async () => {
    const categories: Category[] = [{ id: "1", name: "Food" }];
    const page = CategoryListPage.render(categories);
    await page.clickAddSubcategory(0);
    expect(page.queryInput(/subcategory name/i)).toBeInTheDocument();
  });

  it("hides inline create form on cancel", async () => {
    const categories: Category[] = [{ id: "1", name: "Food" }];
    const page = CategoryListPage.render(categories);
    await page.clickAddSubcategory(0);
    await page.clickButton(/cancel/i);
    expect(page.queryInput(/subcategory name/i)).not.toBeInTheDocument();
  });
});
