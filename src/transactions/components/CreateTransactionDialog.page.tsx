import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountProvider, useAccounts } from "@/accounts/AccountContext";
import { CategoryProvider } from "@/categories/CategoryContext";
import {
  RecurringTransactionProvider,
  useRecurringTransactions,
} from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider, useScenarios } from "@/scenarios/ScenarioContext";
import { TransactionProvider, useTransactions } from "@/transactions/TransactionContext";

import { CreateTransactionDialog } from "./CreateTransactionDialog";

function TestHarness({ accountId }: { accountId?: string }) {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  const { scenarios } = useScenarios();
  const filtered = accountId
    ? transactions.filter((t) => t.accountId === accountId)
    : transactions;
  return (
    <div>
      <CreateTransactionDialog accountId={accountId} />
      {accounts.length > 0 && <span data-testid="accounts-loaded" />}
      <ul data-testid="transactions">
        {filtered.map((t) => (
          <li key={t.id}>
            {accountId ? "" : `${t.accountId} - `}{t.description} - {t.amount}
          </li>
        ))}
      </ul>
      <ul data-testid="recurring">
        {recurringTransactions
          .filter((rt) => !accountId || rt.accountId === accountId)
          .map((rt) => (
            <li key={rt.id}>
              {accountId ? "" : `${rt.accountId} - `}{rt.description} - {rt.amount} - {rt.frequency}
            </li>
          ))}
      </ul>
      <ul data-testid="scenarios">
        {scenarios.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </div>
  );
}

export class CreateTransactionDialogPage {
  private constructor(private _user: ReturnType<typeof userEvent.setup>) {}

  static render(accountId?: string) {
    const user = userEvent.setup();
    render(
      <AccountProvider>
        <TransactionProvider>
          <ScenarioProvider>
            <RecurringTransactionProvider>
              <CategoryProvider>
                <TestHarness accountId={accountId} />
              </CategoryProvider>
            </RecurringTransactionProvider>
          </ScenarioProvider>
        </TransactionProvider>
      </AccountProvider>
    );
    return new CreateTransactionDialogPage(user);
  }

  static async renderDashboard() {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <AccountProvider>
          <TransactionProvider>
            <ScenarioProvider>
              <RecurringTransactionProvider>
                <CategoryProvider>
                  <TestHarness />
                </CategoryProvider>
              </RecurringTransactionProvider>
            </ScenarioProvider>
          </TransactionProvider>
        </AccountProvider>
      );
    });
    await screen.findByTestId("accounts-loaded");
    return new CreateTransactionDialogPage(user);
  }

  // --- Element getters ---

  get triggerButton() {
    return screen.getByRole("button", { name: "Add Transaction" });
  }

  get heading() {
    return screen.getByRole("heading", { name: "Add Transaction" });
  }

  get amountInput() {
    return screen.getByLabelText("Amount");
  }

  get dateInput() {
    return screen.getByLabelText("Date");
  }

  get descriptionInput() {
    return screen.getByLabelText("Description");
  }

  get recurringCheckbox() {
    return screen.getByRole("checkbox", { name: "Recurring" });
  }

  get frequencySelect() {
    return screen.getByRole("combobox", { name: "Frequency" });
  }

  get endDateInput() {
    return screen.getByLabelText("End Date");
  }

  get accountSelect() {
    return screen.getByRole("combobox", { name: "Account" });
  }

  get accountLabel() {
    return screen.getByLabelText("Account");
  }

  get scenarioSelect() {
    return screen.getByRole("combobox", { name: "Scenario" });
  }

  get submitButton() {
    return screen.getByRole("button", { name: "Submit" });
  }

  get transactionsList() {
    return screen.getByTestId("transactions");
  }

  get recurringList() {
    return screen.getByTestId("recurring");
  }

  get scenariosList() {
    return screen.getByTestId("scenarios");
  }

  // --- Query methods (nullable) ---

  queryHeading() {
    return screen.queryByRole("heading", { name: "Add Transaction" });
  }

  queryAccountLabel() {
    return screen.queryByLabelText("Account");
  }

  queryFrequency() {
    return screen.queryByLabelText("Frequency");
  }

  queryEndDate() {
    return screen.queryByLabelText("End Date");
  }

  queryAccountError() {
    return screen.queryByText("Please select an account");
  }

  // --- Actions ---

  async open() {
    await this._user.click(this.triggerButton);
    return this;
  }

  async fillAmount(amount: string) {
    await this._user.clear(this.amountInput);
    await this._user.type(this.amountInput, amount);
    return this;
  }

  async fillDescription(description: string) {
    await this._user.type(this.descriptionInput, description);
    return this;
  }

  async fillDate(date: string) {
    await this._user.clear(this.dateInput);
    await this._user.type(this.dateInput, date);
    return this;
  }

  async fillEndDate(date: string) {
    await this._user.type(this.endDateInput, date);
    return this;
  }

  async toggleRecurring() {
    await this._user.click(this.recurringCheckbox);
    return this;
  }

  async selectFrequency(frequency: string) {
    await this._user.click(this.frequencySelect);
    await this._user.click(screen.getByRole("option", { name: frequency }));
    return this;
  }

  async selectAccount(name: string) {
    await this._user.click(this.accountSelect);
    await this._user.click(screen.getByRole("option", { name }));
    return this;
  }

  async selectScenario(name: string) {
    await this._user.click(this.scenarioSelect);
    await this._user.click(screen.getByRole("option", { name }));
    return this;
  }

  async createScenarioInline(name: string) {
    await this.selectScenario("Create new scenario...");
    await this._user.type(screen.getByLabelText(/scenario name/i), name);
    await this._user.click(screen.getByRole("button", { name: /create/i }));
    return this;
  }

  async submit() {
    await this._user.click(this.submitButton);
    return this;
  }
}
