import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import type { Account } from "../Account.type";
import { AccountType } from "../AccountType";
import { AccountSelect } from "./AccountSelect";

const defaultAccounts: Account[] = [
  { id: "a1", name: "Checking", type: AccountType.Asset },
  { id: "a2", name: "Savings", type: AccountType.Asset },
  { id: "a3", name: "Mortgage", type: AccountType.Liability },
];

type OnValueChange = (value: string) => void;

type RenderOptions = {
  accounts?: Account[];
  value?: string;
  onValueChange?: ReturnType<typeof vi.fn<OnValueChange>>;
  hasError?: boolean;
};

export class AccountSelectPage {
  private constructor(
    private _user: ReturnType<typeof userEvent.setup>,
    private _onValueChange: ReturnType<typeof vi.fn<OnValueChange>>
  ) {}

  static render(options: RenderOptions = {}) {
    const user = userEvent.setup();
    const onValueChange = options.onValueChange ?? vi.fn<(value: string) => void>();
    render(
      <AccountSelect
        accounts={options.accounts ?? defaultAccounts}
        value={options.value ?? "none"}
        onValueChange={onValueChange}
        hasError={options.hasError}
      />
    );
    return new AccountSelectPage(user, onValueChange);
  }

  get onValueChange() {
    return this._onValueChange;
  }

  get trigger() {
    return screen.getByRole("combobox", { name: "Account" });
  }

  get label() {
    return screen.getByLabelText("Account");
  }

  queryOption(name: RegExp | string) {
    return screen.queryByRole("option", { name });
  }

  queryError() {
    return screen.queryByText("Please select an account");
  }

  async open() {
    await this._user.click(this.trigger);
    return this;
  }

  async select(name: string) {
    await this._user.click(this.trigger);
    await this._user.click(screen.getByRole("option", { name }));
    return this;
  }
}
