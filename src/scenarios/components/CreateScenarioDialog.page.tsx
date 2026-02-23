import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BasePageObject } from "@/test/page/BasePageObject";

import { CreateScenarioDialog } from "./CreateScenarioDialog";

export class CreateScenarioDialogPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(onSubmit: (name: string) => void) {
    const user = userEvent.setup();
    render(<CreateScenarioDialog onSubmit={onSubmit} />);
    return new CreateScenarioDialogPage(user);
  }

  // --- Element getters ---

  get triggerButton() {
    return screen.getByRole("button", { name: /new scenario/i });
  }

  get dialog() {
    return screen.getByRole("dialog");
  }

  get heading() {
    return screen.getByRole("heading", { name: /create scenario/i });
  }

  get nameInput() {
    return screen.getByLabelText(/name/i);
  }

  get createButton() {
    return screen.getByRole("button", { name: /create$/i });
  }

  get cancelButton() {
    return screen.getByRole("button", { name: /cancel/i });
  }

  // --- Query methods ---

  queryDialog() {
    return screen.queryByRole("dialog");
  }

  // --- Actions ---

  async open() {
    await this._user.click(this.triggerButton);
    return this;
  }

  async fillName(name: string) {
    await this._user.type(this.nameInput, name);
    return this;
  }

  async submit() {
    await this._user.click(this.createButton);
    return this;
  }

  async cancel() {
    await this._user.click(this.cancelButton);
    return this;
  }
}
