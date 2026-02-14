import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountProvider, useAccounts } from "@/context/AccountContext";
import {
  TransactionProvider,
  useTransactions,
} from "@/context/TransactionContext";
import type { Account } from "@/models/Account.type";
import { AccountType } from "@/models/AccountType";

import { EditAccountDialog } from "./EditAccountDialog";

const defaultAccount: Account = {
  id: "1",
  name: "Checking",
  type: AccountType.Asset,
};

function TestHarness({ account }: { account: Account }) {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  return (
    <div>
      <EditAccountDialog account={account} />
      <ul data-testid="accounts">
        {accounts.map((a) => (
          <li key={a.id}>
            {a.name} - {a.type}
            {a.expectedReturnRate !== undefined && ` - ${a.expectedReturnRate}%`}
          </li>
        ))}
      </ul>
      <span data-testid="tx-count">{transactions.length}</span>
    </div>
  );
}

export class EditAccountDialogPage {
  private constructor(private _user: ReturnType<typeof userEvent.setup>) {}

  static render(account: Account = defaultAccount) {
    const user = userEvent.setup();
    render(
      <AccountProvider>
        <TransactionProvider>
          <TestHarness account={account} />
        </TransactionProvider>
      </AccountProvider>
    );
    return new EditAccountDialogPage(user);
  }

  get triggerButton() {
    return screen.getByRole("button", { name: "Edit Account" });
  }

  get dialog() {
    return screen.getByRole("dialog", { name: "Edit Account" });
  }

  queryDialog() {
    return screen.queryByRole("dialog", { name: "Edit Account" });
  }

  get nameInput() {
    return screen.getByLabelText("Name");
  }

  get typeSelect() {
    return screen.getByRole("combobox", { name: "Type" });
  }

  get expectedReturnInput() {
    return screen.getByLabelText("Expected Annual Rate (%) (optional)");
  }

  get saveButton() {
    return screen.getByRole("button", { name: "Save" });
  }

  get deleteButton() {
    return screen.getByRole("button", { name: "Delete" });
  }

  get accountsList() {
    return screen.getByTestId("accounts");
  }

  get txCount() {
    return screen.getByTestId("tx-count");
  }

  queryDeleteConfirmText() {
    return screen.queryByText(/are you sure you want to delete this account/i);
  }

  getDeleteConfirmText() {
    return screen.getByText(/are you sure you want to delete this account/i);
  }

  get confirmDeleteButton() {
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    return deleteButtons[deleteButtons.length - 1];
  }

  get cancelDeleteButton() {
    return screen.getByRole("button", { name: "Cancel" });
  }

  async open() {
    await this._user.click(this.triggerButton);
    return this;
  }

  async clearAndFillName(name: string) {
    await this._user.clear(this.nameInput);
    if (name) {
      await this._user.type(this.nameInput, name);
    }
    return this;
  }

  async fillExpectedReturn(rate: string) {
    await this._user.clear(this.expectedReturnInput);
    await this._user.type(this.expectedReturnInput, rate);
    return this;
  }

  async clearExpectedReturn() {
    await this._user.clear(this.expectedReturnInput);
    return this;
  }

  async selectType(type: string) {
    await this._user.click(this.typeSelect);
    await this._user.click(screen.getByRole("option", { name: type }));
    return this;
  }

  async save() {
    await this._user.click(this.saveButton);
    return this;
  }

  async pressEscape() {
    await this._user.keyboard("{Escape}");
    return this;
  }

  async clickDelete() {
    await this._user.click(this.deleteButton);
    return this;
  }

  async confirmDelete() {
    await this._user.click(this.confirmDeleteButton);
    return this;
  }

  async cancelDelete() {
    await this._user.click(this.cancelDeleteButton);
    return this;
  }
}
