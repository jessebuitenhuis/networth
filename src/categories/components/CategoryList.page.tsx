"use client";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Category } from "@/categories/Category.type";
import { CategoryProvider } from "@/categories/CategoryContext";

import { CategoryList } from "./CategoryList";

export class CategoryListPage {
  private _user = userEvent.setup();

  static render(categories: Category[] = []) {
    const page = new CategoryListPage();
    render(
      <CategoryProvider>
        <CategoryList categories={categories} />
      </CategoryProvider>,
    );
    return page;
  }

  queryCard() {
    return document.querySelector('[data-slot="card"]');
  }

  queryHeading(text: string) {
    return screen.queryByRole("heading", { name: text });
  }

  get emptyMessage() {
    return screen.getByText(
      /no categories yet\. add a category to start organizing your transactions\./i,
    );
  }

  getCategoryRow(name: string) {
    return screen.getByText(name).closest("[data-category-id]") as HTMLElement;
  }

  getActionsContainer(name: string) {
    const row = this.getCategoryRow(name);
    return within(row).getByTestId("category-actions");
  }

  getEditButton(name: string) {
    const row = this.getCategoryRow(name);
    return within(row).getByRole("button", { name: "Edit Category" });
  }

  getAddSubcategoryButton(name: string) {
    const row = this.getCategoryRow(name);
    return within(row).getByRole("button", { name: "Add Subcategory" });
  }

  async clickAddSubcategory(name: string) {
    await this._user.click(this.getAddSubcategoryButton(name));
  }

  getInlineInput() {
    return screen.getByPlaceholderText("Subcategory name");
  }

  queryInlineInput() {
    return screen.queryByPlaceholderText("Subcategory name");
  }

  async typeSubcategoryName(text: string) {
    await this._user.type(this.getInlineInput(), text);
  }

  async submitInlineForm() {
    await this._user.keyboard("{Enter}");
  }

  async cancelInlineForm() {
    await this._user.keyboard("{Escape}");
  }

  isDraggable(name: string) {
    return this.getCategoryRow(name).getAttribute("draggable") === "true";
  }
}
