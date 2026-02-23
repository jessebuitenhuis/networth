import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Account } from "@/accounts/Account.type";
import { AccountProvider } from "@/accounts/AccountContext";
import { CategoryProvider } from "@/categories/CategoryContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import type { Scenario } from "@/scenarios/Scenario.type";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { BasePageObject } from "@/test/page/BasePageObject";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { ScenarioTransactionList } from "./ScenarioTransactionList";

type RenderOptions = {
  accounts?: Account[];
  transactions?: Transaction[];
  recurringTransactions?: RecurringTransaction[];
  scenarios?: Scenario[];
  selectedScenarioIds?: Set<string>;
};

export class ScenarioTransactionListPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render({
    accounts = [],
    transactions = [],
    recurringTransactions = [],
    scenarios = [],
    selectedScenarioIds = new Set(),
  }: RenderOptions = {}) {
    const user = userEvent.setup();
    mockApiResponses({ accounts, transactions, recurringTransactions, scenarios });
    render(
      <TooltipProvider>
        <AccountProvider>
          <TransactionProvider>
            <ScenarioProvider>
              <RecurringTransactionProvider>
                <CategoryProvider>
                  <ScenarioTransactionList selectedScenarioIds={selectedScenarioIds} />
                </CategoryProvider>
              </RecurringTransactionProvider>
            </ScenarioProvider>
          </TransactionProvider>
        </AccountProvider>
      </TooltipProvider>
    );
    return new ScenarioTransactionListPage(user);
  }

  async findText(text: string | RegExp) {
    return screen.findByText(text);
  }

  async findEditButton() {
    return screen.findByRole("button", { name: /edit/i });
  }

  async findScenarioLabel(name: string) {
    return screen.findByLabelText(name);
  }

  queryText(text: string | RegExp) {
    return screen.queryByText(text);
  }

  queryScenarioLabel(name: string | RegExp) {
    return screen.queryByLabelText(name);
  }

  getAllByText(text: string | RegExp) {
    return screen.getAllByText(text);
  }

  getByRole(role: string, options?: { name?: string | RegExp }) {
    return screen.getByRole(role as Parameters<typeof screen.getByRole>[0], options);
  }

  getAllByRole(role: string, options?: { name?: string | RegExp }) {
    return screen.getAllByRole(role as Parameters<typeof screen.getAllByRole>[0], options);
  }

  async clickEditButton() {
    const btn = await this.findEditButton();
    await this._user.click(btn);
    return this;
  }

  async clickDeleteButton() {
    const btn = this.getByRole("button", { name: /delete/i });
    await this._user.click(btn);
    return this;
  }

  async clickLastDeleteButton() {
    const buttons = this.getAllByRole("button", { name: /delete/i });
    await this._user.click(buttons[buttons.length - 1]);
    return this;
  }
}
