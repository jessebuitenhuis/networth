import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountProvider } from "@/context/AccountContext";
import {
  TransactionProvider,
  useTransactions,
} from "@/context/TransactionContext";

import { ImportCsvDialog } from "./ImportCsvDialog";

function TestHarness({ accountId }: { accountId: string }) {
  const { transactions } = useTransactions();
  return (
    <div>
      <ImportCsvDialog accountId={accountId} />
      <ul data-testid="transactions">
        {transactions.map((t) => (
          <li key={t.id}>
            {t.date} - {t.amount} - {t.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export class ImportCsvDialogPage {
  private constructor(private _user: ReturnType<typeof userEvent.setup>) {}

  static render(accountId = "acc-1") {
    const user = userEvent.setup();
    render(
      <AccountProvider>
        <TransactionProvider>
          <TestHarness accountId={accountId} />
        </TransactionProvider>
      </AccountProvider>
    );
    return new ImportCsvDialogPage(user);
  }

  get triggerButton() {
    return screen.getByRole("button", { name: /Import CSV/i });
  }

  get dialog() {
    return screen.getByRole("dialog");
  }

  queryDialog() {
    return screen.queryByRole("dialog");
  }

  get fileInput() {
    return screen.getByLabelText(/Select CSV file/i);
  }

  get dateColumnSelect() {
    return screen.getByRole("combobox", { name: /Date Column/i });
  }

  get amountColumnSelect() {
    return screen.getByRole("combobox", { name: /Amount Column/i });
  }

  get descriptionColumnSelect() {
    return screen.getByRole("combobox", { name: /Description Column/i });
  }

  get dateFormatSelect() {
    return screen.getByRole("combobox", { name: /Date Format/i });
  }

  get nextButton() {
    return screen.getByRole("button", { name: /Next/i });
  }

  get backButton() {
    return screen.getByRole("button", { name: /Back/i });
  }

  get importButton() {
    return screen.getByRole("button", { name: /Import/i });
  }

  get transactionsList() {
    return screen.getByTestId("transactions");
  }

  async open() {
    await this._user.click(this.triggerButton);
    return this;
  }

  async uploadFile(csvContent: string, filename = "test.csv") {
    const file = new File([csvContent], filename, { type: "text/csv" });
    await this._user.upload(this.fileInput, file);
    return this;
  }

  async selectDateColumn(column: string) {
    await this._user.click(this.dateColumnSelect);
    await this._user.click(screen.getByRole("option", { name: column }));
    return this;
  }

  async selectAmountColumn(column: string) {
    await this._user.click(this.amountColumnSelect);
    await this._user.click(screen.getByRole("option", { name: column }));
    return this;
  }

  async selectDescriptionColumn(column: string) {
    await this._user.click(this.descriptionColumnSelect);
    await this._user.click(screen.getByRole("option", { name: column }));
    return this;
  }

  async selectDateFormat(format: string) {
    await this._user.click(this.dateFormatSelect);
    await this._user.click(screen.getByRole("option", { name: format }));
    return this;
  }

  async clickNext() {
    await this._user.click(this.nextButton);
    return this;
  }

  async clickBack() {
    await this._user.click(this.backButton);
    return this;
  }

  async clickImport() {
    await this._user.click(this.importButton);
    return this;
  }
}
