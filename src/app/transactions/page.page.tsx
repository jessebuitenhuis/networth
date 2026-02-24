import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Account } from "@/accounts/Account.type";
import { AccountProvider } from "@/accounts/AccountContext";
import { CategoryProvider } from "@/categories/CategoryContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import type { Scenario } from "@/scenarios/Scenario.type";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import TransactionsPage from "./page";

type RenderOptions = {
  accounts?: Account[];
  transactions?: Transaction[];
  scenarios?: Scenario[];
};

export class TransactionsPageObject {
  private constructor(private _user: ReturnType<typeof userEvent.setup>) {}

  static render(opts: RenderOptions = {}) {
    mockApiResponses({
      accounts: opts.accounts ?? [],
      transactions: opts.transactions ?? [],
      scenarios: opts.scenarios ?? [],
    });
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <SidebarProvider>
          <AccountProvider>
            <TransactionProvider>
              <ScenarioProvider>
                <RecurringTransactionProvider>
                  <CategoryProvider>
                    <TransactionsPage />
                  </CategoryProvider>
                </RecurringTransactionProvider>
              </ScenarioProvider>
            </TransactionProvider>
          </AccountProvider>
        </SidebarProvider>
      </TooltipProvider>
    );
    return new TransactionsPageObject(user);
  }

  async findHeading(name: string) {
    return screen.findByRole("heading", { name });
  }

  async findText(text: string | RegExp) {
    return screen.findByText(text);
  }

  getText(text: string | RegExp) {
    return screen.getByText(text);
  }

  getAllText(text: string | RegExp) {
    return screen.getAllByText(text);
  }

  queryText(text: string | RegExp) {
    return screen.queryByText(text);
  }

  async findButton(name: string | RegExp) {
    return screen.findByRole("button", { name });
  }

  async findSearchInput() {
    const searchButton = await screen.findByLabelText("Open search");
    await this._user.click(searchButton);
    return screen.findByRole("textbox", { name: "Search transactions" });
  }

  async typeInSearch(text: string) {
    const input = await this.findSearchInput();
    await this._user.type(input, text);
  }
}
