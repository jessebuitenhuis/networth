import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { AccountProvider } from "@/context/AccountContext";
import {
  TransactionProvider,
  useTransactions,
} from "@/context/TransactionContext";
import type { Transaction } from "@/transactions/Transaction.type";

import { UpdateBalanceDialog } from "./UpdateBalanceDialog";

const defaultAccount: Account = {
  id: "a1",
  name: "Checking",
  type: AccountType.Asset,
};

interface RenderOptions {
  account?: Account;
  transactions?: Transaction[];
}

function TestHarness({ accountId }: { accountId: string }) {
  const { transactions } = useTransactions();
  return (
    <div>
      <UpdateBalanceDialog accountId={accountId} />
      <ul data-testid="transactions">
        {transactions.map((t) => (
          <li key={t.id}>
            {t.description} - {t.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

export class UpdateBalanceDialogPage {
  private constructor(private _user: ReturnType<typeof userEvent.setup>) {}

  static render(options: RenderOptions = {}) {
    const account = options.account ?? defaultAccount;
    const transactions = options.transactions ?? [];

    localStorage.setItem("accounts", JSON.stringify([account]));
    localStorage.setItem("transactions", JSON.stringify(transactions));

    const user = userEvent.setup();
    render(
      <AccountProvider>
        <TransactionProvider>
          <TestHarness accountId={account.id} />
        </TransactionProvider>
      </AccountProvider>
    );
    return new UpdateBalanceDialogPage(user);
  }

  static async renderAndOpen(options: RenderOptions = {}) {
    const page = this.render(options);
    await page.open();
    return page;
  }

  get triggerButton() {
    return screen.getByRole("button", { name: "Update Balance" });
  }

  get dialog() {
    return screen.getByRole("dialog", { name: "Update Balance" });
  }

  queryDialog() {
    return screen.queryByRole("dialog");
  }

  get currentBalanceDisplay() {
    return screen.getByText(/Current Balance:/i).parentElement!;
  }

  get newValueInput() {
    return screen.getByLabelText("New Balance");
  }

  get adjustmentDisplay() {
    return screen.getByText(/Adjustment:/i).parentElement!;
  }

  get descriptionInput() {
    return screen.getByLabelText("Description");
  }

  get dateInput() {
    return screen.getByLabelText("Date");
  }

  get submitButton() {
    return screen.getByRole("button", { name: "Update Balance" });
  }

  get transactionsList() {
    return screen.getByTestId("transactions");
  }

  async open() {
    await this._user.click(this.triggerButton);
    return this;
  }

  async clearAndFillNewValue(value: string) {
    await this._user.clear(this.newValueInput);
    if (value) {
      await this._user.type(this.newValueInput, value);
    }
    return this;
  }

  async clearAndFillDescription(description: string) {
    await this._user.clear(this.descriptionInput);
    if (description) {
      await this._user.type(this.descriptionInput, description);
    }
    return this;
  }

  async clearAndFillDate(date: string) {
    await this._user.clear(this.dateInput);
    if (date) {
      await this._user.type(this.dateInput, date);
    }
    return this;
  }

  async submit() {
    await this._user.click(this.submitButton);
    return this;
  }
}
