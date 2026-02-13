import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountProvider, useAccounts } from "@/context/AccountContext";
import {
  TransactionProvider,
  useTransactions,
} from "@/context/TransactionContext";

import { CreateAccountDialog } from "./CreateAccountDialog";

function TestHarness() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  return (
    <div>
      <CreateAccountDialog />
      <ul data-testid="accounts">
        {accounts.map((a) => (
          <li key={a.id}>
            {a.name} - {a.type}
          </li>
        ))}
      </ul>
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

export class CreateAccountDialogPage {
  private constructor(private _user: ReturnType<typeof userEvent.setup>) {}

  static render() {
    const user = userEvent.setup();
    render(
      <AccountProvider>
        <TransactionProvider>
          <TestHarness />
        </TransactionProvider>
      </AccountProvider>
    );
    return new CreateAccountDialogPage(user);
  }

  static renderWithTrigger(trigger: React.ReactNode) {
    const user = userEvent.setup();
    render(
      <AccountProvider>
        <TransactionProvider>
          <CreateAccountDialog trigger={trigger} />
        </TransactionProvider>
      </AccountProvider>
    );
    return new CreateAccountDialogPage(user);
  }

  get triggerButton() {
    return screen.getByRole("button", { name: "Add Account" });
  }

  get dialog() {
    return screen.getByRole("dialog", { name: "Add Account" });
  }

  queryDialog() {
    return screen.queryByRole("dialog");
  }

  get nameInput() {
    return screen.getByLabelText("Name");
  }

  get typeSelect() {
    return screen.getByRole("combobox", { name: "Type" });
  }

  get balanceInput() {
    return screen.getByLabelText("Balance (optional)");
  }

  get submitButton() {
    return screen.getByRole("button", { name: "Add Account" });
  }

  get accountsList() {
    return screen.getByTestId("accounts");
  }

  get transactionsList() {
    return screen.getByTestId("transactions");
  }

  async open() {
    await this._user.click(this.triggerButton);
    return this;
  }

  async fillName(name: string) {
    await this._user.type(this.nameInput, name);
    return this;
  }

  async clearAndFillBalance(balance: string) {
    await this._user.clear(this.balanceInput);
    await this._user.type(this.balanceInput, balance);
    return this;
  }

  async selectType(type: string) {
    await this._user.click(this.typeSelect);
    await this._user.click(screen.getByRole("option", { name: type }));
    return this;
  }

  async submit() {
    await this._user.click(this.submitButton);
    return this;
  }

  async clickCustomTrigger(name: string) {
    await this._user.click(screen.getByRole("button", { name }));
    return this;
  }
}
