import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BasePageObject } from "@/test/page/BasePageObject";

import { CurrencyInput } from "./CurrencyInput";

type CurrencyInputProps = {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  "aria-label"?: string;
  showSignToggle?: boolean;
};

export class CurrencyInputPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(props: CurrencyInputProps) {
    const user = userEvent.setup();
    render(<CurrencyInput {...props} />);
    return new CurrencyInputPage(user);
  }

  static renderWithRerender(props: CurrencyInputProps) {
    const user = userEvent.setup();
    const result = render(<CurrencyInput {...props} />);
    return { page: new CurrencyInputPage(user), rerender: result.rerender };
  }

  // --- Element getters ---

  get input() {
    return screen.getByRole("textbox") as HTMLInputElement;
  }

  get plusToggle() {
    return screen.getByRole("button", { name: /plus/i });
  }

  get minusToggle() {
    return screen.getByRole("button", { name: /minus/i });
  }

  // --- Query methods ---

  queryPlusToggle() {
    return screen.queryByRole("button", { name: /plus/i });
  }

  queryMinusToggle() {
    return screen.queryByRole("button", { name: /minus/i });
  }

  // --- Actions ---

  async typeValue(value: string) {
    await this._user.clear(this.input);
    await this._user.type(this.input, value);
    return this;
  }

  async clearInput() {
    await this._user.clear(this.input);
    return this;
  }

  async focusInput() {
    await this._user.click(this.input);
    return this;
  }

  async blurInput() {
    await this._user.tab();
    return this;
  }

  async toggleSign() {
    const toggle = this.queryPlusToggle() ?? this.minusToggle;
    await this._user.click(toggle);
    return this;
  }

  async pasteValue(value: string) {
    await this._user.clear(this.input);
    await this._user.click(this.input);
    await this._user.paste(value);
    return this;
  }

  async typeChar(char: string) {
    await this._user.type(this.input, char);
    return this;
  }
}
