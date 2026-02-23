import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Account } from "@/accounts/Account.type";
import { AccountProvider } from "@/accounts/AccountContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { BasePageObject } from "@/test/page/BasePageObject";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { AccountBreakdownSection } from "./AccountBreakdownSection";

export class AccountBreakdownSectionPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(accounts: Account[] = [], transactions: Transaction[] = []) {
    const user = userEvent.setup();
    mockApiResponses({ accounts, transactions });
    render(
      <AccountProvider>
        <TransactionProvider>
          <AccountBreakdownSection />
        </TransactionProvider>
      </AccountProvider>,
    );
    return new AccountBreakdownSectionPage(user);
  }

  queryByText(text: string) {
    return screen.queryByText(text);
  }

  findByText(text: string) {
    return screen.findByText(text);
  }

  getByText(text: string) {
    return screen.getByText(text);
  }

  getAllByText(text: string) {
    return screen.getAllByText(text);
  }
}
