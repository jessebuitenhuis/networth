import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import type { WizardAccountEntry } from "../WizardAccountEntry.type";
import { AccountsStep } from "./AccountsStep";

export class AccountsStepPage {
  private constructor(
    private _user: ReturnType<typeof userEvent.setup>,
    private _props: {
      onAdd: ReturnType<typeof vi.fn>;
      onRemove: ReturnType<typeof vi.fn>;
      onUpdate: ReturnType<typeof vi.fn>;
    },
  ) {}

  static render(accounts: WizardAccountEntry[] = []) {
    const user = userEvent.setup();
    const props = {
      onAdd: vi.fn(),
      onRemove: vi.fn(),
      onUpdate: vi.fn(),
    };

    render(
      <AccountsStep
        accounts={accounts}
        onAdd={props.onAdd}
        onRemove={props.onRemove}
        onUpdate={props.onUpdate}
        generateTempId={() => "temp-id"}
      />,
    );

    return new AccountsStepPage(user, props);
  }

  get onAdd() {
    return this._props.onAdd;
  }

  get onRemove() {
    return this._props.onRemove;
  }

  get onUpdate() {
    return this._props.onUpdate;
  }

  getSuggestionButton(name: string) {
    return screen.getByRole("button", { name: new RegExp(`^[^A-Za-z]+ ${name}$`) });
  }

  querySuggestionButton(name: string) {
    return screen.queryByRole("button", { name: new RegExp(`^[^A-Za-z]+ ${name}$`) });
  }

  getRemoveButton(accountName: string) {
    return screen.getByRole("button", { name: `Remove ${accountName}` });
  }

  getNameInput(accountName: string) {
    return screen.getByLabelText(`${accountName} name`);
  }

  getBalanceInput(accountName: string) {
    return screen.getByLabelText(`${accountName} balance`);
  }

  async clickSuggestion(name: string) {
    await this._user.click(this.getSuggestionButton(name));
    return this;
  }

  async clickRemove(accountName: string) {
    await this._user.click(this.getRemoveButton(accountName));
    return this;
  }

  async editName(accountName: string, newName: string) {
    const input = this.getNameInput(accountName);
    await this._user.clear(input);
    await this._user.type(input, newName);
    return this;
  }
}
