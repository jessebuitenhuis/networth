import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Account } from "@/accounts/Account.type";
import { BasePageObject } from "@/test/page/BasePageObject";

import { AccountPicker } from "./AccountPicker";

type AccountPickerProps = {
  accounts: Account[];
  excludedIds: Set<string>;
  onToggle: (id: string) => void;
};

export class AccountPickerPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render({ accounts, excludedIds, onToggle }: AccountPickerProps) {
    const user = userEvent.setup();
    render(
      <AccountPicker
        accounts={accounts}
        excludedIds={excludedIds}
        onToggle={onToggle}
      />
    );
    return new AccountPickerPage(user);
  }

  static renderAndGetContainer(props: AccountPickerProps) {
    const user = userEvent.setup();
    const { container } = render(
      <AccountPicker
        accounts={props.accounts}
        excludedIds={props.excludedIds}
        onToggle={props.onToggle}
      />
    );
    return { page: new AccountPickerPage(user), container };
  }

  // --- Element getters ---

  triggerButton(count: number) {
    return screen.getByRole("button", { name: `Accounts (${count})` });
  }

  checkbox(name: string) {
    return screen.getByRole("checkbox", { name });
  }

  // --- Actions ---

  async open(count: number) {
    await this._user.click(this.triggerButton(count));
    return this;
  }

  async toggleCheckbox(name: string) {
    await this._user.click(this.checkbox(name));
    return this;
  }
}
