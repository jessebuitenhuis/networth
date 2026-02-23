import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import type { Account } from "../Account.type";
import { AccountSelect } from "./AccountSelect";

const defaultAccounts: Account[] = [
  { id: "a1", name: "Checking", type: "Asset" },
  { id: "a2", name: "Savings", type: "Asset" },
  { id: "a3", name: "Mortgage", type: "Liability" },
];

type RenderOptions = {
  accounts?: Account[];
  value?: string;
  onValueChange?: ReturnType<typeof vi.fn>;
};

export class AccountSelectPage {
  private constructor(
    private _user: ReturnType<typeof userEvent.setup>,
    private _onValueChange: ReturnType<typeof vi.fn>
  ) {}

  static render(options: RenderOptions = {}) {
    const user = userEvent.setup();
    const onValueChange = options.onValueChange ?? vi.fn();
    render(
      <AccountSelect
        accounts={options.accounts ?? defaultAccounts}
        value={options.value ?? "none"}
        onValueChange={onValueChange}
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
