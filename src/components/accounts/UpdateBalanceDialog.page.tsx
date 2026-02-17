import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import type { Transaction } from "@/transactions/Transaction.type";

import { UpdateBalanceDialog } from "./UpdateBalanceDialog";

interface RenderOptions {
  transactions?: Transaction[];
}

function TestHarness({
  accountId,
  transactions,
  onSave,
}: {
  accountId: string;
  transactions: Transaction[];
  onSave: (transaction: Transaction) => void;
}) {
  return (
    <div>
      <UpdateBalanceDialog
        accountId={accountId}
        transactions={transactions}
        onSave={onSave}
      />
    </div>
  );
}

export class UpdateBalanceDialogPage {
  private constructor(
    private _user: ReturnType<typeof userEvent.setup>,
    private _onSave: ReturnType<typeof vi.fn>,
  ) {}

  static render(options: RenderOptions = {}) {
    const transactions = options.transactions ?? [];
    const onSave = vi.fn();

    const user = userEvent.setup();
    render(
      <TestHarness
        accountId="a1"
        transactions={transactions}
        onSave={onSave}
      />,
    );
    return new UpdateBalanceDialogPage(user, onSave);
  }

  static async renderAndOpen(options: RenderOptions = {}) {
    const page = this.render(options);
    await page.open();
    return page;
  }

  get onSave() {
    return this._onSave;
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
