import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BasePageObject } from "@/test/page/BasePageObject";

import {
  InlineCreateSubcategory,
  type InlineCreateSubcategoryProps,
} from "./InlineCreateSubcategory";

export class InlineCreateSubcategoryPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(props: InlineCreateSubcategoryProps) {
    const user = userEvent.setup();
    render(<InlineCreateSubcategory {...props} />);
    return new InlineCreateSubcategoryPage(user);
  }

  get nameInput() {
    return screen.getByPlaceholderText(/subcategory name/i);
  }

  get createButton() {
    return screen.getByRole("button", { name: /create/i });
  }

  get cancelButton() {
    return screen.getByRole("button", { name: /cancel/i });
  }

  async typeName(name: string) {
    await this._user.type(this.nameInput, name);
    return this;
  }

  async pressEnter() {
    await this._user.keyboard("{Enter}");
    return this;
  }

  async pressEscape() {
    await this._user.keyboard("{Escape}");
    return this;
  }

  async clickCreate() {
    await this._user.click(this.createButton);
    return this;
  }

  async clickCancel() {
    await this._user.click(this.cancelButton);
    return this;
  }
}
