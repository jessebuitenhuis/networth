import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Account } from "@/accounts/Account.type";
import { AccountProvider } from "@/accounts/AccountContext";
import { BasePageObject } from "@/test/page/BasePageObject";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { NetWorthSummary } from "./NetWorthSummary";

export class NetWorthSummaryPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render(accounts: Account[] = [], transactions: Transaction[] = []) {
    const user = userEvent.setup();
    mockApiResponses({ accounts, transactions });
    render(
      <AccountProvider>
        <TransactionProvider>
          <NetWorthSummary />
        </TransactionProvider>
      </AccountProvider>,
    );
    return new NetWorthSummaryPage(user);
  }

  get heading() {
    return screen.getByText("Net Worth");
  }

  get netWorthValue() {
    return this.heading.nextElementSibling!;
  }

  findByText(text: string) {
    return screen.findByText(text);
  }

  getByText(text: string) {
    return screen.getByText(text);
  }
}
