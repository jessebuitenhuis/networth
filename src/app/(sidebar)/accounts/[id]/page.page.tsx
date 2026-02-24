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

import AccountDetailPage from "./page";

type RenderOptions = {
  accounts?: Account[];
  transactions?: Transaction[];
  scenarios?: Scenario[];
  activeScenarioId?: string | null;
};

export class AccountDetailPageObject {
  private constructor(private _user: ReturnType<typeof userEvent.setup>) {}

  static render(id: string, opts: RenderOptions = {}) {
    mockApiResponses({
      accounts: opts.accounts ?? [],
      transactions: opts.transactions ?? [],
      scenarios: opts.scenarios ?? [],
      activeScenarioId: opts.activeScenarioId ?? null,
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
                    <AccountDetailPage params={{ id }} />
                  </CategoryProvider>
                </RecurringTransactionProvider>
              </ScenarioProvider>
            </TransactionProvider>
          </AccountProvider>
        </SidebarProvider>
      </TooltipProvider>
    );
    return new AccountDetailPageObject(user);
  }

  async findHeading(name: string) {
    return screen.findByRole("heading", { name });
  }

  async findText(text: string) {
    return screen.findByText(text);
  }

  getText(text: string) {
    return screen.getByText(text);
  }

  async findButton(name: string | RegExp) {
    return screen.findByRole("button", { name });
  }

  async findCombobox(name: string) {
    return screen.findByRole("combobox", { name });
  }

  getCombobox(name: string) {
    return screen.getByRole("combobox", { name });
  }

  getOption(name: string) {
    return screen.getByRole("option", { name });
  }

  async clickElement(element: HTMLElement) {
    await this._user.click(element);
    return this;
  }
}
