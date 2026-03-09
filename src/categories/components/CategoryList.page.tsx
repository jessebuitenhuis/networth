import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Category } from "@/categories/Category.type";
import { CategoryProvider } from "@/categories/CategoryContext";
import { BasePageObject } from "@/test/page/BasePageObject";

import { CategoryList } from "./CategoryList";

export class CategoryListPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(categories: Category[]) {
    const user = userEvent.setup();
    render(
      <CategoryProvider>
        <CategoryList categories={categories} />
      </CategoryProvider>,
    );
    return new CategoryListPage(user);
  }

  getByText(text: string | RegExp) {
    return screen.getByText(text);
  }

  queryByText(text: string | RegExp) {
    return screen.queryByText(text);
  }

  getAllItems() {
    return screen.getAllByRole("listitem");
  }

  queryAllItems() {
    return screen.queryAllByRole("listitem");
  }

  getAddButtons() {
    return screen.getAllByRole("button", { name: /add subcategory/i });
  }

  async clickAddSubcategory(index: number) {
    const buttons = this.getAddButtons();
    await this._user.click(buttons[index]);
    return this;
  }

  queryInput(placeholder: string | RegExp) {
    return screen.queryByPlaceholderText(placeholder);
  }

  getInput(placeholder: string | RegExp) {
    return screen.getByPlaceholderText(placeholder);
  }

  async typeIntoInput(placeholder: string | RegExp, text: string) {
    await this._user.type(this.getInput(placeholder), text);
    return this;
  }

  async clickButton(name: string | RegExp) {
    await this._user.click(screen.getByRole("button", { name }));
    return this;
  }

  queryButton(name: string | RegExp) {
    return screen.queryByRole("button", { name });
  }
}
