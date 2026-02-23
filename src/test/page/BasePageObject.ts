import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export abstract class BasePageObject {
  protected constructor(protected _user: ReturnType<typeof userEvent.setup>) {}

  async clearAndType(element: HTMLElement, text: string) {
    await this._user.clear(element);
    await this._user.type(element, text);
    return this;
  }

  async selectOption(trigger: HTMLElement, optionName: string) {
    await this._user.click(trigger);
    await this._user.click(screen.getByRole("option", { name: optionName }));
    return this;
  }
}
