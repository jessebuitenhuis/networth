import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountProvider } from "@/accounts/AccountContext";
import { CategoryProvider } from "@/categories/CategoryContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import type { Scenario } from "@/scenarios/Scenario.type";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { BasePageObject } from "@/test/page/BasePageObject";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { TransactionList } from "./TransactionList";

type RenderOptions = {
  accountId: string;
  transactions?: Transaction[];
  recurringTransactions?: RecurringTransaction[];
  scenarios?: Scenario[];
  activeScenarioId?: string | null;
};

export class TransactionListPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render({
    accountId,
    transactions = [],
    recurringTransactions = [],
    scenarios = [],
    activeScenarioId = null,
  }: RenderOptions) {
    const user = userEvent.setup();
    mockApiResponses({ transactions, recurringTransactions, scenarios, activeScenarioId });
    render(
      <TooltipProvider>
        <AccountProvider>
          <TransactionProvider>
            <ScenarioProvider>
              <RecurringTransactionProvider>
                <CategoryProvider>
                  <TransactionList accountId={accountId} />
                </CategoryProvider>
              </RecurringTransactionProvider>
            </ScenarioProvider>
          </TransactionProvider>
        </AccountProvider>
      </TooltipProvider>
    );
    return new TransactionListPage(user);
  }

  get emptyMessage() {
    return screen.getByText("No transactions yet.");
  }

  async findRows() {
    const rows = await screen.findAllByRole("row");
    return rows.slice(1); // skip header row
  }

  async findText(text: string) {
    return screen.findByText(text);
  }

  async findEditButton() {
    return screen.findByLabelText("Edit Transaction");
  }

  queryText(text: string | RegExp) {
    return screen.queryByText(text);
  }

  queryColumnHeader(name: string | RegExp) {
    return screen.queryByRole("columnheader", { name });
  }

  queryScenarioLabel(name: string | RegExp) {
    return screen.queryByLabelText(name);
  }

  async findScenarioLabel(name: string) {
    return screen.findByLabelText(name);
  }
}
