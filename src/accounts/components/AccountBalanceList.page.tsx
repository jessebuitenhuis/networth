import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { AccountBalanceItem } from "@/accounts/AccountBalanceItem.type";
import { BasePageObject } from "@/test/page/BasePageObject";

import { AccountBalanceList } from "./AccountBalanceList";

interface AccountBalanceListProps {
  title: string;
  accounts: AccountBalanceItem[];
  subtotal: number;
}

export class AccountBalanceListPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render({ title, accounts, subtotal }: AccountBalanceListProps) {
    const user = userEvent.setup();
    render(<AccountBalanceList title={title} accounts={accounts} subtotal={subtotal} />);
    return new AccountBalanceListPage(user);
  }

  queryTitle(text: string) {
    return screen.queryByText(text);
  }

  getByText(text: string) {
    return screen.getByText(text);
  }

  queryByText(text: string) {
    return screen.queryByText(text);
  }
}
