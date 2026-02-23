import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountType } from "@/accounts/AccountType";
import { BasePageObject } from "@/test/page/BasePageObject";

import { AccountIcon } from "./AccountIcon";

export class AccountIconPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(name: string, type: AccountType = AccountType.Asset) {
    const user = userEvent.setup();
    render(<AccountIcon name={name} type={type} />);
    return new AccountIconPage(user);
  }

  getByText(text: string) {
    return screen.getByText(text);
  }
}
