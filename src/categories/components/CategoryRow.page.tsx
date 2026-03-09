import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Category } from "@/categories/Category.type";
import { CategoryProvider } from "@/categories/CategoryContext";
import { BasePageObject } from "@/test/page/BasePageObject";

import { CategoryRow, type CategoryRowProps } from "./CategoryRow";

export class CategoryRowPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(props: CategoryRowProps) {
    const user = userEvent.setup();
    render(
      <CategoryProvider>
        <CategoryRow {...props} />
      </CategoryProvider>,
    );
    return new CategoryRowPage(user);
  }

  get row() {
    return screen.getByTestId(/^category-row-/);
  }

  getByText(text: string | RegExp) {
    return screen.getByText(text);
  }

  queryEditButton() {
    return screen.queryByRole("button", { name: /edit category/i });
  }

  queryAddButton() {
    return screen.queryByRole("button", { name: /add subcategory/i });
  }

  async hoverRow() {
    await this._user.hover(this.row);
    return this;
  }

  async click(element: HTMLElement) {
    await this._user.click(element);
    return this;
  }

  dragStart() {
    fireEvent.dragStart(this.row);
    return this;
  }

  dragOver() {
    fireEvent.dragOver(this.row);
    return this;
  }

  drop() {
    fireEvent.drop(this.row);
    return this;
  }

  dragLeave() {
    fireEvent.dragLeave(this.row);
    return this;
  }
}

export function createCategory(
  overrides: Partial<Category> & { id: string; name: string },
): Category {
  return { parentCategoryId: undefined, ...overrides };
}
