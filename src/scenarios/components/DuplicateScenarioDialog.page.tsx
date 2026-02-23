import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BasePageObject } from "@/test/page/BasePageObject";

import { DuplicateScenarioDialog } from "./DuplicateScenarioDialog";

type Props = React.ComponentProps<typeof DuplicateScenarioDialog>;

export class DuplicateScenarioDialogPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(overrides: Partial<Props> = {}) {
    const user = userEvent.setup();
    const props: Props = {
      scenarioName: "Base Plan",
      onSubmit: () => {},
      ...overrides,
    };
    render(<DuplicateScenarioDialog {...props} />);
    return new DuplicateScenarioDialogPage(user);
  }

  // --- Element getters ---

  get triggerButton() {
    return screen.getByRole("button", { name: "Duplicate Scenario" });
  }

  get dialog() {
    return screen.getByRole("dialog");
  }

  get heading() {
    return screen.getByRole("heading", { name: /duplicate scenario/i });
  }

  get nameInput() {
    return screen.getByLabelText(/name/i);
  }

  get duplicateButton() {
    return screen.getByRole("button", { name: /duplicate$/i });
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
    await this._user.clear(this.nameInput);
    if (name) {
      await this._user.type(this.nameInput, name);
    }
    return this;
  }

  async submit() {
    await this._user.click(this.duplicateButton);
    return this;
  }

  async cancel() {
    await this._user.click(this.cancelButton);
    return this;
  }
}
